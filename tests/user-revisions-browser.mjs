import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({ executablePath:process.env.CHROMIUM_EXECUTABLE ?? '/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage'],headless:true });
const failures=[];
try {
  const page=await browser.newPage({ viewport:{width:390,height:844},reducedMotion:'reduce' });
  await page.route('https://almaty.itstep.org/**',r=>r.abort('blockedbyclient'));
  await page.goto(process.env.TEST_BASE_URL ?? 'http://127.0.0.1:4173/',{waitUntil:'networkidle'});
  if (await page.locator('#academy').count()) failures.push('academy promotion still present');
  if (await page.locator('.section-heading .eyebrow span').count()) failures.push('section numbers still present');
  const colors=await page.evaluate(()=>{
    const panel=document.querySelector('.consultation-panel'),button=panel.querySelector('.button');
    return {background:getComputedStyle(panel).backgroundColor,text:getComputedStyle(panel).color,paragraph:getComputedStyle(panel.querySelector('p')).color,button:getComputedStyle(button).backgroundColor,number:getComputedStyle(button).color};
  });
  if(colors.background!=='rgb(255, 255, 255)') failures.push(`consultation background ${colors.background}`);
  for(const key of ['text','paragraph','number']) if(colors[key]!=='rgb(0, 0, 0)') failures.push(`${key} must be black, got ${colors[key]}`);
  if(colors.button!=='rgb(248, 117, 70)') failures.push(`phone button must be orange, got ${colors.button}`);
  await mkdir('work/browser-qa',{recursive:true});
  for(const width of [360,390]) {
    await page.setViewportSize({width,height:844});
    for(const selector of ['.audience-grid','.outcomes-grid']) {
      const carousel=page.locator(selector);
      const before=await carousel.evaluate(el=>({width:el.clientWidth,content:el.scrollWidth,scrollbar:getComputedStyle(el).scrollbarWidth,cards:[...el.children].map(card=>({width:card.getBoundingClientRect().width,height:card.getBoundingClientRect().height}))}));
      if(before.content<=before.width) failures.push(`${selector} does not overflow horizontally at ${width}`);
      if(before.scrollbar!=='none') failures.push(`${selector} must hide its scrollbar at ${width}`);
      if(before.cards[0].width<before.width*.89 || before.cards[0].width>=before.width-14) failures.push(`${selector} needs wider cards with the next card peeking at ${width}`);
      if(!before.cards.every(card=>Math.abs(card.height-before.cards[0].height)<1)) failures.push(`${selector} needs equal card heights at ${width}`);
      if(width===390 && before.cards[0].height>440) failures.push(`${selector} is still too tall: ${before.cards[0].height}px`);
      await carousel.evaluate(el=>el.scrollTo({left:el.clientWidth,behavior:'instant'}));
      const moved=await carousel.evaluate(el=>el.scrollLeft>0);
      if(!moved) failures.push(`${selector} cannot scroll sideways at ${width}`);
      await carousel.evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));
    }
    const pageWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
    if(pageWidth>width) failures.push(`page itself overflows at ${width}: ${pageWidth}`);
  }
  await page.locator('#consultation').scrollIntoViewIfNeeded();
  await page.screenshot({path:'work/browser-qa/revised-consultation-390.png'});
  await page.setViewportSize({width:1440,height:900});
  for(const selector of ['.audience-grid','.outcomes-grid']) {
    const layout=await page.locator(selector).evaluate(el=>({width:el.clientWidth,content:el.scrollWidth,tops:[...el.children].map(child=>child.getBoundingClientRect().top)}));
    if(layout.content>layout.width || !layout.tops.every(top=>Math.abs(top-layout.tops[0])<2)) failures.push(`${selector} must remain a desktop row`);
  }
  assert.deepEqual(failures,[],'requested visual revisions');
  console.log('Requested revisions verified: unnumbered sections; academy removed; white/black/orange consultation; both mobile carousels scroll; desktop rows preserved.');
}finally{await browser.close();}
