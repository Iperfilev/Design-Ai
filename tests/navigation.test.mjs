import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { pageMarkup } from '../src/render.js';
import { courseContent } from '../src/content.js';
import { initNavigation, initCourseInteractions } from '../src/main.js';

const setup = () => parseHTML(`<!doctype html><html><body>${pageMarkup(courseContent)}</body></html>`);
test('mobile menu opens, closes with Escape, and exposes its state', () => {
  const { document, window } = setup();
  initNavigation(document);
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-nav');
  assert.equal(toggle.hidden, false);
  assert.equal(menu.hidden, true);
  toggle.click();
  assert.equal(menu.hidden, false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  const escape = new window.Event('keydown');
  escape.key = 'Escape';
  document.dispatchEvent(escape);
  assert.equal(menu.hidden, true);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
});

test('following a menu link closes it without suppressing the anchor', () => {
  const { document, window } = setup();
  initNavigation(document);
  document.querySelector('.menu-toggle').click();
  const link = document.querySelector('#mobile-nav a[href="#program"]');
  const event = new window.Event('click', { bubbles: true, cancelable: true });
  link.dispatchEvent(event);
  assert.equal(document.querySelector('#mobile-nav').hidden, true);
  assert.equal(event.defaultPrevented, false);
});

test('initialization is safe to repeat and outside pointer closes the menu', () => {
  const { document, window } = setup();
  initNavigation(document);
  initNavigation(document);
  document.querySelector('.menu-toggle').click();
  assert.equal(document.querySelector('#mobile-nav').hidden, false);
  document.querySelector('main').dispatchEvent(new window.Event('pointerdown', { bubbles: true }));
  assert.equal(document.querySelector('#mobile-nav').hidden, true);
});

test('show more reveals the original remaining modules', () => {
  const { document } = setup();
  initCourseInteractions(document);
  const modules = [...document.querySelectorAll('[data-module]')];
  assert.equal(modules.filter(m => !m.hidden).length, 3);
  document.querySelector('.show-modules').click();
  assert.equal(modules.filter(m => !m.hidden).length, 5);
  assert.equal(document.querySelector('.show-modules').hidden, true);
  assert.equal(modules[3].open, true);
});

test('unavailable original images retain a real link instead of invented work', () => {
  const { document, window } = setup();
  initCourseInteractions(document);
  const image = document.querySelector('img[data-original-work]');
  const original = image.getAttribute('src');
  image.dispatchEvent(new window.Event('error'));
  assert.equal(image.hidden, true);
  assert.equal(image.parentElement.getAttribute('href'), original);
  assert.equal(image.parentElement.querySelector('.image-fallback').hidden, false);
});
