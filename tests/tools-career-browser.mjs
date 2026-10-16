import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox'],headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.route('https://almaty.itstep.org/**',r=>r.abort());
 await page.goto(process.env.TEST_BASE_URL??'http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 for(const width of [360,390,1440]){
  await page.setViewportSize({width,height:1000});
  assert.equal(await page.locator('p.eyebrow').count(),0);
  assert.equal(await page.locator('.hero-visual').isVisible(),width>760);
  assert.equal(await page.locator('.hero-consultation').isVisible(),true);
  const panels=await page.locator('.consultation-panel').evaluateAll(els=>els.map(el=>({bg:getComputedStyle(el).backgroundColor,button:getComputedStyle(el.querySelector('.button')).backgroundColor,text:getComputedStyle(el.querySelector('.button')).color})));
  assert.equal(panels.length,2);
  panels.forEach(p=>assert.deepEqual(p,{bg:'rgb(248, 117, 70)',button:'rgb(23, 22, 20)',text:'rgb(255, 255, 255)'}));
  await page.locator('.hero').screenshot({path:`work/browser-qa/hero-revised-${width}.png`});
  await page.locator('#career').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.career-growth-line').naturalWidth>0);
  const state=await page.evaluate(()=>{
   const track=document.querySelector('.career-scroll');
   const cards=[...track.querySelectorAll('article')].map(el=>{const r=el.getBoundingClientRect();return {top:r.top,width:r.width}});
   return {cards,width:track.clientWidth,scrollWidth:track.scrollWidth,body:document.documentElement.scrollWidth,indices:[...document.querySelectorAll('.tool-index')].map(el=>({text:el.textContent,height:el.getBoundingClientRect().height,line:parseFloat(getComputedStyle(el).lineHeight)})),image:track.querySelector('img').naturalWidth};
  });
  assert.ok(state.cards[0].top>state.cards[1].top&&state.cards[1].top>state.cards[2].top,'career steps ascend');
  assert.equal(state.body,width,'no page overflow');
  assert.ok(state.image>0,'growth artwork loaded');
  assert.equal(state.indices.length,0);

  if(width<700){
   assert.ok(state.scrollWidth>state.width);
   assert.ok(state.cards[0].width<state.width-10&&state.cards[0].width>state.width*.88);
   await page.locator('.career-scroll').evaluate(el=>el.scrollTo({left:el.clientWidth,behavior:'instant'}));
   assert.ok(await page.locator('.career-scroll').evaluate(el=>el.scrollLeft>0));
   await page.locator('.career-scroll').evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));
  }
  await page.locator('#career').screenshot({path:`work/browser-qa/career-${width}.png`});
  const tools=page.locator('.tool-panel');
  assert.equal(await tools.evaluate(el=>el.open),false);
  assert.equal(await tools.locator('.tool-list').isVisible(),false);
  if(width===390) await tools.screenshot({path:'work/browser-qa/tools-collapsed.png'});
  await tools.locator('summary').focus();
  await page.keyboard.press('Enter');
  assert.equal(await tools.evaluate(el=>el.open),true);
  await page.waitForFunction(()=>document.querySelector('.editorial-detail').naturalWidth>0);
  assert.deepEqual(await tools.locator('.tool-list>span').allTextContents(),['Adobe Photoshop','Behance','Adobe Illustrator','Canva','Figma','ChatGPT']);
  assert.equal(await tools.locator('.tool-list>span').evaluateAll(els=>els.every(el=>el.scrollWidth<=el.clientWidth)),true);
  if(width===390) await tools.screenshot({path:'work/browser-qa/tools-new.png'});
  await tools.locator('summary').click();
  assert.equal(await tools.evaluate(el=>el.open),false);
  const reasons=page.locator('.reasons-list');
  await reasons.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.reason-image').naturalWidth>0);
  assert.equal(await reasons.locator('article').count(),5);
  assert.ok(await reasons.evaluate(el=>el.scrollWidth>el.clientWidth));
  await reasons.evaluate(el=>el.scrollTo({left:el.clientWidth,behavior:'instant'}));
  assert.ok(await reasons.evaluate(el=>el.scrollLeft>0));
  await reasons.evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));
  await page.locator('#start').screenshot({path:`work/browser-qa/reasons-${width}.png`});
  assert.equal(await page.locator('.module-number').count(),0);
  if(width===390) await page.locator('[data-module="1"]').screenshot({path:'work/browser-qa/module-new.png'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
  if(width===390){
   await page.locator('#benefits').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('.editorial-figure img').naturalWidth>0);
   await page.locator('#benefits').screenshot({path:'work/browser-qa/benefits-new.png'});
  }
 }
 console.log('Hero contacts, closed modules, tools, image carousels and career growth: 360/390/1440 passed.');
}finally{await browser.close()}
