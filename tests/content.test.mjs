import { test } from 'node:test';
import assert from 'node:assert/strict';
import { courseContent as c } from '../src/content.js';

test('course duration and programme match the approved source', () => {
  assert.equal(c.durationMonths, 12);
  assert.deepEqual(c.modules.map(m => m.title), [
    'Adobe Photoshop', 'Adobe Illustrator', 'Теория дизайна',
    'Айдентика с использованием искусственного интеллекта', 'Рекламный дизайн'
  ]);
  assert.deepEqual(c.modules.map(m => m.topics.length), [4, 4, 3, 6, 7]);
  assert.equal(c.format, 'Онлайн, живые занятия + доступ к записям');
});

test('both campuses and their original contacts are preserved', () => {
  assert.deepEqual(c.contacts.addresses, ['г. Алматы, Коктем-3, дом 16а.', 'улица Байсеитовой, 45']);
  assert.deepEqual(c.contacts.phones.map(p => p.href), ['tel:+77059575150', 'tel:+77055936395']);
  assert.equal(c.contacts.email, 'welcome@itstep.org');
  assert.equal(c.contacts.hours, 'Пн-Сб 9:30-19:00');
});

test('all source groups and unique course content are included', () => {
  assert.equal(c.audiences.length, 3);
  assert.equal(c.audiences.flatMap(a => a.items).length, 9);
  assert.equal(c.professionBenefits.length, 4);
  assert.equal(c.skills.length, 9);
  assert.deepEqual(c.tools, ['Adobe Photoshop', 'Behance', 'Adobe Illustrator', 'Canva', 'Figma', 'ChatGPT']);
  assert.deepEqual(c.career.map(x => x.salary), ['от $600+', 'от $1 300+', 'от $2 500+']);
  assert.equal(c.studentWorks.length, 8);
  assert.equal(c.industries.length, 10);
  assert.equal(c.outcomes.length, 3);
  assert.equal(c.academy.stats.length, 5);
  assert.equal(c.reasonsToStart.length, 5);
  assert.equal(c.faq.length, 3);
});

test('original student artwork is not replaced with invented work', () => {
  for (const [i, work] of c.studentWorks.entries()) {
    assert.equal(work.src, `https://almaty.itstep.org/dist/images/courses-adult/ai-graphics/pet${i + 1}.png`);
    assert.equal(work.kind, 'source-student-work');
  }
});

test('legal and academy links keep their resolved source destinations', () => {
  assert.equal(c.links.offer.href, 'https://almaty.itstep.org/public-offer-agreement');
  assert.equal(c.links.privacy.href, 'https://almaty.itstep.org/privacy.pdf');
  assert.deepEqual(c.links.academy.map(x => x.href), [
    'https://almaty.itstep.org/about-academy', 'https://almaty.itstep.org/comment',
    'https://almaty.itstep.org/contacts', 'https://almaty.itstep.org/blog', 'https://almaty.itstep.org/vacancy'
  ]);
  assert.deepEqual(c.links.courses.slice(0, 6).map(x => new URL(x.href).searchParams.get('category')),
    ['2464', '2467', '2776', '4286', '4292', '5125']);
});
