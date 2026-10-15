import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { pageMarkup } from '../src/render.js';
import { courseContent as c } from '../src/content.js';
import { parseHTML } from 'linkedom';

const html = pageMarkup(c);
test('the complete reading path exists and every in-page link resolves', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'unique IDs');
  for (const id of ['about','skills','works','program','results','faq','consultation','contacts']) assert.ok(ids.includes(id), id);
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id), `missing anchor ${id}`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.ok(html.indexOf('step-white.svg') < html.indexOf('astana-hub-white.svg'));
  assert.ok(html.replace(/<[^>]+>/g, '').includes('онлайн-курс. из графического дизайна?'), 'heading words retain their source spacing');
});

test('all approved text is rendered, including hidden native disclosures', () => {
  const escaped = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const required = [
    ...c.audiences.flatMap(a => [a.title,...a.items]),
    ...c.professionBenefits.flatMap(x => [x.title,x.text]), ...c.skills,...c.tools,
    ...c.career.flatMap(x => [x.title,x.text,x.salary]),...c.courseBenefits,...c.industries,
    ...c.modules.flatMap(m => [m.title,...m.topics]),
    ...c.outcomes.flatMap(x => [x.title,x.text]),
    ...c.reasonsToStart.flatMap(x => [x.title,x.text]),...c.faq.flatMap(x => [x.question,x.answer]),
    ...c.contacts.addresses,c.contacts.email,c.contacts.hours,c.format
  ];
  for (const text of required) assert.ok(html.includes(escaped(text)), `missing source text: ${text}`);
  assert.equal((html.match(/data-module=/g) ?? []).length, 5);
  assert.equal((html.match(/data-faq=/g) ?? []).length, 3);
});

test('source links and student images retain their exact destinations', () => {
  assert.ok(html.includes(`href="${c.source}"`), 'course source link must not invent an anchor');
  for (const item of [...c.links.academy,...c.links.courses,c.links.offer,c.links.privacy,...c.contacts.phones]) assert.ok(html.includes(item.href.replaceAll('&','&amp;')));
  for (const work of c.studentWorks) {
    assert.ok(html.includes(`src="${work.src}"`));
    assert.ok(html.includes(`href="${work.src}"`), 'original-file fallback');
  }
  for (const [, src] of html.matchAll(/(?:src|href)="(assets\/[^"#]+)"/g)) assert.ok(existsSync(new URL(`../${src}`, import.meta.url)), src);
  assert.ok(!html.includes('concept-3.png'), 'page is real markup, not a screenshot');
});

test('consultation uses anchors and contacts, not fake submission or payment', () => {
  assert.ok((html.match(/href="#consultation"/g) ?? []).length >= 3);
  assert.ok(html.includes('href="mailto:welcome@itstep.org"'));
  assert.ok(!/<form\b|<input\b|type="submit"|data-payment/.test(html));
  assert.ok(!/заявка отправлена|оплата прошла/i.test(html));
});

test('disclosures and images have accessible native markup', () => {
  for (const image of html.match(/<img\b[^>]+>/g) ?? []) assert.match(image, /\balt="[^"]*"/);
  assert.ok(html.includes('<details'));
  assert.ok(html.includes('<summary'));
  assert.ok(html.includes('aria-controls="mobile-nav"'));
});

test('requested section cleanup removes section numbers and academy promotion', () => {
  assert.ok(!html.includes('id="academy"'));
  assert.ok(!html.includes('Почему наши IT курсы самые лучшие?'));
  assert.ok(!/<p class="eyebrow"><span>\d+<\/span>/.test(html));
});

test('tools use simple numbers and their own new illustration', () => {
  const {document}=parseHTML(html);
  assert.deepEqual([...document.querySelectorAll('.tool-index')].map(el=>el.textContent),['1','2','3','4','5','6']);
  assert.equal(document.querySelector('.editorial-detail').getAttribute('src'),'assets/images/tools-studio.webp');
  assert.equal(document.querySelector('.editorial-figure img').getAttribute('src'),'assets/images/editorial.webp');
});

test('career is presented as three ordered growth milestones', () => {
  const {document}=parseHTML(html);
  const track=document.querySelector('.career-scroll');
  assert.ok(track);
  assert.deepEqual([...track.querySelectorAll('article h3')].map(el=>el.textContent),c.career.map(item=>item.title));
  assert.ok(track.querySelector('img.career-growth-line[src="assets/images/career-growth.webp"]'));
});
