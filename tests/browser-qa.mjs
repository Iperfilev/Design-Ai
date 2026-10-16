import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve(process.env.QA_OUTPUT ?? 'work/browser-qa');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE ?? '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const results = [];
try {
  for (const width of [360, 390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    // The runtime blocks this origin. Exercise the honest original-file fallback
    // rather than replacing student artwork or pretending to verify its network.
    await context.route('https://almaty.itstep.org/**', route => route.abort('blockedbyclient'));
    const page = await context.newPage();
    const errors = [];
    const failedLocal = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().startsWith('http://127.0.0.1:4173') && response.status() >= 400) failedLocal.push(response.url()); });
    await page.goto(process.env.TEST_BASE_URL ?? 'http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('h1').count(), 1);
    const overflowing = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    assert.ok(overflowing.scrollWidth <= width, JSON.stringify(overflowing));
    assert.equal(await page.locator('details[data-module]:visible').count(), 3);
    await page.locator('.show-modules').click();
    assert.equal(await page.locator('details[data-module]:visible').count(), 5);
    assert.equal(await page.locator('.module[open]').count(),0);
    await page.locator('[data-module="1"] summary').click();
    assert.equal(await page.locator('[data-module="1"]').evaluate(el=>el.open),true);
    await page.locator('[data-module="1"] summary').click();
    await page.locator('[data-faq="1"] summary').click();
    assert.equal(await page.locator('[data-faq="1"]').evaluate(el => el.open), true);
    if (width <= 760) {
      await page.locator('.menu-toggle').click();
      assert.equal(await page.locator('#mobile-nav').isVisible(), true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#mobile-nav').isVisible(), false);
      assert.equal(await page.evaluate(() => document.activeElement.classList.contains('menu-toggle')), true);
      await page.locator('.menu-toggle').click();
      await page.locator('#mobile-nav a[href="#program"]').click();
      assert.equal(await page.locator('#mobile-nav').isVisible(), false);
      assert.equal(new URL(page.url()).hash, '#program');
    }
    await page.locator('#mobile-nav a[href="#consultation"]').evaluate(el=>el.click());
    assert.equal(new URL(page.url()).hash, '#consultation');
    const consultation = await page.locator('#consultation').boundingBox();
    assert.ok(consultation.y >= 0 && consultation.y < 200, `consultation visible below header: ${consultation.y}`);
    await page.locator('.mobile-quickbar').waitFor({ state: 'hidden', timeout: 2000 });
    await page.locator('#contacts').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('a[href="tel:+77059575150"]').count() >= 3, true);
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    await page.locator('.mobile-quickbar').waitFor({ state: 'hidden', timeout: 2000 });
    await page.evaluate(() => scrollTo(0,0));
    await page.screenshot({ path: path.join(output, `landing-${width}.png`), fullPage: true });
    await page.screenshot({ path: path.join(output, `hero-${width}.png`) });
    if (width === 390) {
      const enlarged = await page.evaluate(() => {
        const textElements = [...document.querySelectorAll('body *')].filter(el =>
          !['SCRIPT','STYLE','NOSCRIPT'].includes(el.tagName) && [...el.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()));
        const sizes = textElements.map(el => [el, parseFloat(getComputedStyle(el).fontSize)]);
        for (const [el, size] of sizes) el.style.fontSize = `${size * 2}px`;
        return { viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth,
          offenders: textElements.filter(el => el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0).slice(0,8).map(el => el.textContent.slice(0,80)) };
      });
      assert.ok(enlarged.scrollWidth <= width, `200% text: ${JSON.stringify(enlarged)}`);
    }
    assert.deepEqual(errors, [], 'no JavaScript errors');
    assert.deepEqual(failedLocal, [], 'all local assets and scripts load');
    results.push({ width, overflow: false, localFailures: failedLocal, javascriptErrors: errors, programme: '5 modules', faq: 'opens', consultation: 'anchor', originalImageNetwork: 'not verified; policy-blocked fallback tested' });
    await context.close();
  }
  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await nojs.route('https://almaty.itstep.org/**', route => route.abort('blockedbyclient'));
  const page = await nojs.newPage();
  await page.goto(process.env.TEST_BASE_URL ?? 'http://127.0.0.1:4173/');
  assert.equal(await page.locator('details[data-module]').count(), 5);
  assert.equal(await page.locator('details[data-module]:visible').count(), 5);
  assert.equal(await page.locator('.nojs-nav').isVisible(), true);
  assert.equal(await page.locator('h1').isVisible(), true);
  await nojs.close();
  await writeFile(path.join(output, 'results.json'), JSON.stringify({ results, noJavaScript: 'content and navigation available' }, null, 2));
  console.log(JSON.stringify({ viewports: results.map(r => r.width), checks: 'passed', noJavaScript: 'passed', output, originalImageNetwork: 'not verified' }, null, 2));
} finally {
  await browser.close();
}
