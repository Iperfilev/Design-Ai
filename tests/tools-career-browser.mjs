import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox'],headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.route('https://almaty.itstep.org/**',r=>r.abort());
 await page.goto(process.env.TEST_BASE_URL??'http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 for(const width of [360,390,1440]){
  await page.setViewportSize({width,height:1000});
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
  assert.deepEqual(state.indices.map(x=>x.text),['1','2','3','4','5','6']);
  for(const n of state.indices) assert.ok(n.height<=n.line+1,'number stays on one line');
  if(width<700){
   assert.ok(state.scrollWidth>state.width);
   assert.ok(state.cards[0].width<state.width-10&&state.cards[0].width>state.width*.88);
   await page.locator('.career-scroll').evaluate(el=>el.scrollTo({left:el.clientWidth,behavior:'instant'}));
   assert.ok(await page.locator('.career-scroll').evaluate(el=>el.scrollLeft>0));
   await page.locator('.career-scroll').evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));
  }
  await page.locator('#career').screenshot({path:`work/browser-qa/career-${width}.png`});
  if(width===390) await page.locator('.tool-panel').screenshot({path:'work/browser-qa/tools-new.png'});
 }
 console.log('Tools numbering and career growth: 360/390/1440 passed.');
}finally{await browser.close()}
