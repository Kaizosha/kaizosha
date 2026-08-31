// Non-browser interaction regression checks; no build step or browser dependency.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/scripts/home-products.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

class Target {
  listeners = new Map();
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, []); this.listeners.get(type).push(fn); }
  dispatchEvent(event) { for (const fn of this.listeners.get(event.type) || []) fn(event); return !event.defaultPrevented; }
  emit(type, props = {}) { const e = { type, target: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...props }; this.dispatchEvent(e); return e; }
}
class Element extends Target {
  constructor(tag = 'div') { super(); this.tagName = tag; this.dataset = {}; this.attrs = new Map(); this.hidden = false; this.textContent = ''; this.parent = null; this.children = []; this.selectors = {}; this.scrollHeight = 400; this.clientHeight = 500; this.scrollTop = 0; this.offsetWidth = 1; this.offsetHeight = 1; this.classes = new Set(); this.styles = new Map();
    this.classList = { add: (...names) => names.forEach(n => this.classes.add(n)), remove: (...names) => names.forEach(n => this.classes.delete(n)), contains: n => this.classes.has(n), toggle: (n, value) => value ? this.classes.add(n) : this.classes.delete(n) };
    this.style = { setProperty: (n,v) => this.styles.set(n,v), removeProperty: n => this.styles.delete(n), getPropertyValue: n => this.styles.get(n) || '' };
  }
  append(child) { child.parent = this; this.children.push(child); return child; }
  querySelector(s) { return this.selectors[s] || null; }
  querySelectorAll(s) { return this.selectorLists?.[s] || []; }
  setAttribute(k,v) { this.attrs.set(k,String(v)); }
  getAttribute(k) { return this.attrs.get(k) ?? null; }
  removeAttribute(k) { this.attrs.delete(k); }
  hasAttribute(k) { return this.attrs.has(k); }
  contains(child) { return child === this || this.children.some(c => c.contains(child)); }
  closest(s) { if (s === '.home-main' && this.classes.has('home-main')) return this; if (s === 'a, button' && ['a','button'].includes(this.tagName)) return this; return this.parent?.closest(s) || null; }
  focus() { this.focused = true; }
  getBoundingClientRect() { return { width: parseFloat(this.styles.get('--handoff-frame-width')) || 350, height: parseFloat(this.styles.get('--handoff-frame-height')) || 600 }; }
  click(props = {}) { return this.emit('click', { detail: 1, button: 0, ...props }); }
}

function attrs(text) { const result = {}; for (const m of text.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) result[m[1]] = m[2] ?? ''; return result; }
function harness({ fine = true, reduced = false, seed = 1 } = {}) {
  const main = new Element(); main.classes.add('home-main');
  const grid = main.append(new Element());
  const logo = main.append(new Element('button'));
  const glyphs = ['KAI','조','श'].map(text => { const g = new Element('span'); g.textContent = text; g.lang = 'en'; g.dir = 'ltr'; return g; });
  logo.selectorLists = { '.brand-lockup__glyph': glyphs };
  const slots = ['top-left','top-right','bottom-left','bottom-right'];
  const names = [...html.matchAll(/<div class="product-cell" ([^>]*data-product-slot[^>]*)>[\s\S]*?<a class="product-cell__name"([^>]*)>([^<]+)<\/a>[\s\S]*?<p class="product-cell__description">([^<]+)<\/p>[\s\S]*?<p class="product-cell__meta">([^<]+)<\/p>/g)];
  assert.equal(names.length, 4);
  const records = names.map((m, i) => {
    const ca = attrs(m[1]), na = attrs(m[2]);
    const cell = grid.append(new Element());
    cell.dataset.productSlot = slots[i];
    if ('data-product-kind' in ca) cell.dataset.productKind = ca['data-product-kind'];
    if ('data-product-sequence' in ca) cell.dataset.productSequence = ca['data-product-sequence'];
    if ('data-product-featured' in ca) cell.setAttribute('data-product-featured', '');
    const keys = ['content','nameLink','detail','eyebrow','description','meta','closeButton','exploreLink','scrollCue'];
    const selectors = ['.product-cell__content','.product-cell__name','.product-cell__detail','.product-cell__eyebrow','.product-cell__description','.product-cell__meta','[data-product-close]','.product-cell__explore','[data-product-scroll-cue]'];
    const record = { cell };
    keys.forEach((key, index) => { const e = new Element(key.includes('Link') ? 'a' : key === 'closeButton' ? 'button' : 'div'); cell.append(e); record[key] = e; cell.selectors[selectors[index]] = e; });
    record.nameLink.textContent = m[3]; record.nameLink.href = na.href; record.description.textContent = m[4]; record.meta.textContent = m[5]; record.nameLink.target = '_blank'; record.exploreLink.target = '_blank';
    return record;
  });
  grid.selectorLists = { '.product-cell[data-product-slot]': records.map(r => r.cell) };
  const templateItems = [...html.matchAll(/<span\s+(data-product-catalog-item[\s\S]*?)><\/span>/g)].map(m => { const e = new Element('span'); const a = attrs(m[1]); for (const [key,value] of Object.entries(a)) { e.setAttribute(key,value); if (key.startsWith('data-')) e.dataset[key.slice(5).replace(/-([a-z])/g,(_m,c)=>c.toUpperCase())] = value; } return e; });
  const template = { content: { querySelectorAll: () => templateItems } };
  const controls = new Element(), previous = new Element('button'), next = new Element('button'), status = new Element(), body = new Element('body');
  const document = new Target(); document.body = body; document.activeElement = null; document.documentElement = { clientWidth: 390, clientHeight: 844 };
  const query = { '.home-products[data-products]': grid, '[data-product-controls]': controls, '[data-products-previous]': previous, '[data-products-next]': next, '[data-products-status]': status, '.home-logo': logo, '[data-home-intro-open]': logo, 'template[data-product-catalog]': template };
  document.querySelector = s => query[s] || null;
  const window = new Target(); window.innerHeight = 844; window.visualViewport = Object.assign(new Target(), { width: 390, height: 844 });
  const assignments = [], frames = new Map(), timers = new Map(); let serial = 1;
  window.requestAnimationFrame = fn => { const id = serial++; frames.set(id,fn); return id; };
  window.cancelAnimationFrame = id => frames.delete(id);
  window.setTimeout = (fn,delay) => { const id = serial++; timers.set(id,{fn,delay}); return id; };
  window.clearTimeout = id => timers.delete(id);
  window.location = { assign: url => assignments.push(url) };
  window.matchMedia = query => Object.assign(new Target(), { matches: query.includes('reduced') ? reduced : fine });
  window.getComputedStyle = el => el === body ? { paddingLeft:'12px', paddingRight:'12px', paddingTop:'12px', paddingBottom:'12px' } : { overflowY:'auto' };
  const math = Object.create(Math); math.random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 2**32; };
  vm.runInNewContext(source, { window, document, URL, Math:math, Event:class {constructor(type){this.type=type;}} });
  const flushFrame = () => { const list = [...frames]; frames.clear(); for (const [,fn] of list) fn(); };
  const flush = () => { for(let i=0;(frames.size || timers.size) && i<10;i++){ flushFrame(); const list=[...timers.values()]; timers.clear(); for(const {fn} of list) fn(); } };
  flush();
  const story = () => records.find(r => r.cell.dataset.productName === 'i');
  const hover = r => r.cell.emit('pointerenter', { pointerType: 'mouse' });
  const wheel = (r,dy,dx=0,target=r.description) => main.emit('wheel',{target,deltaY:dy,deltaX:dx,deltaMode:0});
  const touch = (type,r,x,y,count=1) => main.emit(type,{ target:r.description, touches:Array.from({length:count},()=>({clientX:x,clientY:y})) });
  return { records, main, previous, next, story, hover, wheel, touch, window, document, body, assignments, flush, flushFrame, frames, timers };
}

test('i appears on every first arrangement; all six stable identities remain in rotation',()=>{
  const seen = new Map();
  for(let seed=1;seed<=50;seed++) {
    const h = harness({seed}); assert(h.story()); assert.equal(h.story().eyebrow.textContent,'story / 06');
    for(let page=0;page<4;page++){ for(const r of h.records) seen.set(r.cell.dataset.productName,r.eyebrow.textContent); h.next.click(); h.flush(); }
  }
  assert.equal(seen.size,6); assert.equal(seen.get('ModScan'),'product / 04'); assert.equal(seen.get('Morph'),'product / 05');
});
test('plain Explore and keyboard name activation continue same-tab with slot, scroll and mark',()=>{
  for(const keyboard of [false,true]) { const h=harness(), r=h.story(); r.content.scrollTop=31.26;
    const e=keyboard?r.nameLink.click({detail:0}):r.exploreLink.click(); assert(e.defaultPrevented); assert(h.main.classList.contains('is-story-handoff')); assert.equal(h.body.dataset.motionPaused,'true'); h.flush();
    assert.equal(h.assignments.length,1); const url=new URL(h.assignments[0]); assert.equal(url.hostname,'i.kaizosha.org'); assert.equal(url.searchParams.get('from'),'kaizosha'); assert.equal(url.searchParams.get('scroll'),'31.26'); assert.equal(url.searchParams.get('slot'),r.cell.dataset.productSlot); assert.equal(JSON.parse(url.searchParams.get('mark')).length,3);
  }
});
test('modified mouse clicks preserve default new-tab behavior',()=>{
  for(const props of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{button:1}]) { const h=harness(),r=h.story(); assert.equal(r.exploreLink.click(props).defaultPrevented,false); assert.equal(r.nameLink.click(props).defaultPrevented,false);h.flush();assert.equal(h.assignments.length,0); }
});
test('mouse wheel expands then opens; reverse wheel cancels preview',()=>{
  const h=harness(),r=h.story();h.hover(r);const e=h.wheel(r,110); assert(e.defaultPrevented);assert(h.main.classList.contains('is-story-handoff'));assert(h.main.styles.has('--handoff-frame-width'));h.wheel(r,-1);assert(!h.main.classList.contains('is-story-handoff'));h.wheel(r,220);h.flush();assert.equal(h.assignments.length,1);
});
test('scrollable detail gets first scroll; controls do not accidentally trigger wheel handoff',()=>{
  const h=harness(),r=h.story();h.hover(r);r.content.scrollHeight=800;r.content.clientHeight=300;r.content.scrollTop=0;assert.equal(h.wheel(r,300).defaultPrevented,false);h.flush();assert.equal(h.assignments.length,0);r.content.scrollTop=500;assert.equal(h.wheel(r,300,0,r.exploreLink).defaultPrevented,false);h.flush();assert.equal(h.assignments.length,0);
});
test('touch name opens details, upward swipe opens only on release; cancellation resets',()=>{
  const h=harness({fine:false}),r=h.story();assert(r.nameLink.click().defaultPrevented);assert.equal(h.assignments.length,0);h.touch('touchstart',r,10,300);h.touch('touchmove',r,10,140);assert(h.main.classList.contains('is-story-handoff'));assert.equal(h.assignments.length,0);h.touch('touchcancel',r,10,140);assert(!h.main.classList.contains('is-story-handoff'));h.touch('touchstart',r,10,300);h.touch('touchmove',r,10,140);h.touch('touchend',r,10,140,0);h.flush();assert.equal(h.assignments.length,1);
});
test('diagonal swipe and multi-touch do not navigate',()=>{
  for(const multi of [false,true]) { const h=harness({fine:false}),r=h.story();r.nameLink.click();h.touch('touchstart',r,10,300);h.touch('touchmove',r,multi?10:250,140,multi?2:1);h.touch('touchend',r,10,140,0);h.flush();assert.equal(h.assignments.length,0); }
});
test('pagehide cancels both queued frame and delayed navigation; BFCache restore resets chrome and brand',()=>{
  for(const beforeTimer of [true,false]) for(const reduced of [false,true]) { const h=harness({reduced}),r=h.story();r.exploreLink.click();if(!beforeTimer)h.flushFrame();h.window.emit('pagehide',{persisted:true});h.flush();assert.equal(h.assignments.length,0);h.window.emit('pageshow',{persisted:true});assert(!h.main.classList.contains('is-navigating-product'));assert(!h.main.classList.contains('is-story-handoff'));assert.equal(h.body.dataset.motionPaused,undefined);r.exploreLink.click();h.flush();assert.equal(h.assignments.length,1); }
});
test('navigation destination cannot be replaced by keyboard pagination during handoff delay',()=>{
  const h=harness({seed:1}),r=h.story();r.exploreLink.click();h.next.click({detail:0});h.flush();assert.equal(new URL(h.assignments[0]).hostname,'i.kaizosha.org');
});
