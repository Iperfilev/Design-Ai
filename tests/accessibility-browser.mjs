import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE ?? '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const failures = [];
const contrast = (a,b) => {
  const luminance = rgb => rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(v => v/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4).reduce((sum,v,i) => sum + v*[.2126,.7152,.0722][i], 0);
  const values = [luminance(a),luminance(b)].sort((x,y) => y-x);
  return (values[0]+.05)/(values[1]+.05);
};
assert.equal(contrast('rgb(255,255,255)','rgb(0,0,0)'), 21);
try {
  const page = await browser.newPage({ viewport: { width:390,height:844 }, reducedMotion:'reduce' });
  await page.route('https://almaty.itstep.org/**', route => route.abort('blockedbyclient'));
  await page.goto(process.env.TEST_BASE_URL ?? 'http://127.0.0.1:4173/', { waitUntil:'networkidle' });
  for (const selector of ['.module-content li','.tool-list>span']) {
    const size = await page.locator(selector).first().evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    if (size < 16) failures.push(`${selector}: source information is only ${size}px, expected >=16px`);
  }
  await page.keyboard.press('Tab');
  for (const selector of ['.consultation-email','.consultation-actions .button']) {
    await page.locator(selector).focus();
    const styles = await page.locator(selector).evaluate(el => ({ outline:getComputedStyle(el).outlineColor, style:getComputedStyle(el).outlineStyle, background:getComputedStyle(el.closest('.consultation-panel')).backgroundColor }));
    const ratio = contrast(styles.outline,styles.background);
    if (styles.style === 'none' || ratio < 3) failures.push(`${selector}: focus contrast ${ratio.toFixed(2)}:1, expected >=3:1`);
  }
  await page.setViewportSize({ width:768,height:900 });
  const phone = page.locator('.header-phone');
  const rect = await phone.boundingBox();
  if (!rect || rect.width < 44 || rect.height < 44) failures.push(`compact header phone target: ${JSON.stringify(rect)}, expected >=44x44`);
  if (await page.getByRole('link', { name:'Позвонить +7705 957 51 50',exact:true }).count() !== 1) failures.push('compact header phone has no persistent accessible call label');
  assert.deepEqual(failures, [], 'accessibility regressions');
  console.log('Accessibility browser regressions passed: source text >=16px; compact phone label and44px target; orange-panel focus contrast >=3:1.');
} finally { await browser.close(); }
