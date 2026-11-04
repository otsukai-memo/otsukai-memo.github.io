// かいものメモ: the app itself. It lives apart from index.html so the page's CSP can refuse every script written
// into the page (script-src 'self'): words typed into the app can never run as a program.
// When APP_VER changes, change ?v= on the script, check.js and style.css tags in index.html too, so no old copy is used.
(() => {
'use strict';
// check.js found this browser too old, or the page inside another site's page: nothing runs
if (window.kaimonoStop) return;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
// Lucide (lucide.dev, lucide-static 1.66.0), ISC License; a few come from Feather, MIT License: see LICENSE-lucide.txt.
// Drawn with lines like the item pictures; play and stop are filled in, as people expect of them
const ICONS = {
  'menu': '<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>',
  'lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  'cloud-upload': '<path d="M12 13v8"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m8 17 4-4 4 4"/>',
  'file-check': '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="m9 15 2 2 4-4"/>',
  'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  'arrow-down-wide-narrow': '<path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/>',
  'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  'camera': '<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/>',
  'check': '<path d="M20 6 9 17l-5-5"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'copy-plus': '<line x1="15" x2="15" y1="12" y2="18"/><line x1="12" x2="18" y1="15" y2="15"/><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  'download': '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
  'history': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  'image-off': '<line x1="2" x2="22" y1="2" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><line x1="13.5" x2="6" y1="13.5" y2="21"/><line x1="18" x2="21" y1="12" y2="15"/><path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59"/><path d="M21 15V5a2 2 0 0 0-2-2H9"/>',
  'keyboard': '<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
  'mic': '<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',
  'minus': '<path d="M5 12h14"/>',
  'notebook-pen': '<path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>',
  'play': '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/>',
  'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  'send': '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  'settings': '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
  'smartphone': '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  'square': '<rect width="18" height="18" x="3" y="3" rx="2"/>',
  'trash-2': '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  'upload': '<path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
  'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};
const FILLED = new Set(['play', 'square']);
const svgOf = (inner, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
const ic = (name, cls = '') => svgOf(ICONS[name], 'ic' + (FILLED.has(name) ? ' fill' : '') + (cls ? ' ' + cls : ''));
// static markup names its icons with data-ic; they are drawn once here
$$('[data-ic]').forEach(el => { el.outerHTML = ic(el.dataset.ic); });

const KEY = 'kaimono:v1:';
const APP_VER = '1.22';
const DAY = 864e5;

// 1.15: たべもの is split into the genres of a supermarket's shelves, so the genre menu reaches each of them
const GROUPS = [
  { key: 'staple', label: 'ごはん・パン・めん' },
  { key: 'veg', label: 'やさい' },
  { key: 'fruit', label: 'くだもの' },
  { key: 'meat', label: 'お肉' },
  { key: 'fish', label: 'おさかな' },
  { key: 'chilled', label: 'たまご・とうふ・乳製品' },
  { key: 'season', label: 'ちょうみりょう' },
  { key: 'snack', label: 'おかし' },
  { key: 'deli', label: 'おそうざい・れいとう' },
  { key: 'dry', label: 'かんづめ・かんぶつ' },
  // what the family put under たべもの before 1.15 and isn't one of the starting items
  { key: 'food', label: 'ほかの たべもの' },
  { key: 'drink', label: 'のみもの' },
  // daily goods are asked for at uneven times, so their rows say when they were last asked for
  { key: 'daily', label: 'にちようひん', showLast: true },
  { key: 'other', label: 'そのほか' },
];
// which genres an item has been sorted by: 2 since 1.15 (items from before are moved out of たべもの once, by name)
const GSET = 2;
const UNITS = ['個', '本', 'パック', '袋', '箱', 'たば', 'ふさ', 'g'];
const WHEN = ['きょう中に', 'あしたまでに', 'こんど来るとき', 'いそがない'];
// Emoji 13 or older, so they show on older Android phones too
// the pictures an item can have: Lucide name, what it shows (read out, and shown on a long look), colour, drawing
const PICS = [
  ['sandwich', 'パン', 'brown', '<path d="m2.37 11.223 8.372-6.777a2 2 0 0 1 2.516 0l8.371 6.777"/><path d="M21 15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-5.25"/><path d="M3 15a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h9"/><path d="m6.67 15 6.13 4.6a2 2 0 0 0 2.8-.4l3.15-4.2"/><rect width="20" height="4" x="2" y="11" rx="1"/>'],
  ['croissant', 'クロワッサン', 'amber', '<path d="M10.2 18H4.774a1.5 1.5 0 0 1-1.352-.97 11 11 0 0 1 .132-6.487"/><path d="M18 10.2V4.774a1.5 1.5 0 0 0-.97-1.352 11 11 0 0 0-6.486.132"/><path d="M18 5a4 3 0 0 1 4 3 2 2 0 0 1-2 2 10 10 0 0 0-5.139 1.42"/><path d="M5 18a3 4 0 0 0 3 4 2 2 0 0 0 2-2 10 10 0 0 1 1.42-5.14"/><path d="M8.709 2.554a10 10 0 0 0-6.155 6.155 1.5 1.5 0 0 0 .676 1.626l9.807 5.42a2 2 0 0 0 2.718-2.718l-5.42-9.807a1.5 1.5 0 0 0-1.626-.676"/>'],
  ['egg', 'たまご', 'orange', '<path d="M12 2C8 2 4 8 4 14a8 8 0 0 0 16 0c0-6-4-12-8-12"/>'],
  ['egg-fried', 'めだまやき', 'amber', '<circle cx="11.5" cy="12.5" r="3.5"/><path d="M3 8c0-3.5 2.5-6 6.5-6 5 0 4.83 3 7.5 5s5 2 5 6c0 4.5-2.5 6.5-7 6.5-2.5 0-2.5 2.5-6 2.5s-7-2-7-5.5c0-3 1.5-3 1.5-5C3.5 10 3 9 3 8Z"/>'],
  ['wheat', 'お米', 'green', '<path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/>'],
  ['banana', 'バナナ', 'amber', '<path d="M4 13c3.5-2 8-2 10 2a5.5 5.5 0 0 1 8 5"/><path d="M5.15 17.89c5.52-1.52 8.65-6.89 7-12C11.55 4 11.5 2 13 2c3.22 0 5 5.5 5 8 0 6.5-4.2 12-10.49 12C5.11 22 2 22 2 20c0-1.5 1.14-1.55 3.15-2.11Z"/>'],
  ['apple', 'りんご', 'red', '<path d="M12 6.528V3a1 1 0 0 1 1-1h0"/><path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21"/>'],
  ['citrus', 'みかん', 'orange', '<path d="M21.66 17.67a1.08 1.08 0 0 1-.04 1.6A12 12 0 0 1 4.73 2.38a1.1 1.1 0 0 1 1.61-.04z"/><path d="M19.65 15.66A8 8 0 0 1 8.35 4.34"/><path d="m14 10-5.5 5.5"/><path d="M14 17.85V10H6.15"/>'],
  ['grape', 'ぶどう', 'purple', '<path d="M22 5V2l-5.89 5.89"/><circle cx="16.6" cy="15.89" r="3"/><circle cx="8.11" cy="7.4" r="3"/><circle cx="12.35" cy="11.65" r="3"/><circle cx="13.91" cy="5.85" r="3"/><circle cx="18.15" cy="10.09" r="3"/><circle cx="6.56" cy="13.2" r="3"/><circle cx="10.8" cy="17.44" r="3"/><circle cx="5" cy="19" r="3"/>'],
  ['cherry', 'さくらんぼ', 'red', '<path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z"/><path d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z"/><path d="M7 14c3.22-2.91 4.29-8.75 5-12 1.66 2.38 4.94 9 5 12"/><path d="M22 9c-4.29 0-7.14-2.33-10-7 5.71 0 10 4.67 10 7Z"/>'],
  ['carrot', 'にんじん', 'orange', '<path d="M15 16a1 1 0 0 0-7-7q-4 4-5.987 12.385a.5.5 0 0 0 .602.602Q11 20 15 16l-3-3"/><path d="M15 9q4 4 7 0-3-4-7 0 4-4 0-7-4 3 0 7"/><path d="m8 15-2.58-2.58"/>'],
  ['leafy-green', 'はっぱの やさい', 'green', '<path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22"/><path d="M2 22 17 7"/>'],
  ['salad', 'サラダ', 'green', '<path d="M19.496 12a2.5 2.5 0 00.399-2.214A2 2 0 0020.32 6.5 2 2 0 0019 3a2 2 0 00-1.5.68 2 2 0 00-3.287.424 2.5 2.5 0 00-3.189 2.06A3 3 0 0012 12l4-4"/><path d="M4 12a1 1 0 00-.99 1.133A9 9 0 0012 21a9 9 0 008.99-7.867A1 1 0 0020 12z"/><path d="M7 21h10"/><path d="M9.85 6.907A3.5 3.5 0 005.05 12"/>'],
  ['bean', 'まめ', 'brown', '<path d="M10.165 6.598C9.954 7.478 9.64 8.36 9 9c-.64.64-1.521.954-2.402 1.165A6 6 0 0 0 8 22c7.732 0 14-6.268 14-14a6 6 0 0 0-11.835-1.402Z"/><path d="M5.341 10.62a4 4 0 1 0 5.279-5.28"/>'],
  ['nut', 'ナッツ', 'brown', '<path d="M16.847 5.847 20 9a7.23 7.23 0 011.551 7.516C21.241 17.352 21 17.932 21 19v1a1 1 0 01-1 1h-1c-1.069 0-1.648.242-2.485.552A7.2 7.2 0 019.002 20l-3.155-3.153"/><path d="M18.21 5.43c-1.71.69-5.07 1.07-6.71 1.07.46 1.38.91 2.74.61 4.88a.88.88 0 01-.73.74c-1.78.28-3.54-.17-4.88-.62 0 1.64-.38 5-1.07 6.71-.21.52-.82.55-1.17.12A10 10 0 0118.33 4.26c.43.35.4.97-.12 1.17"/><path d="M4.93 4.93 3 3a.7.7 0 010-1"/>'],
  ['fish', 'さかな', 'blue', '<path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/><path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4"/><path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98"/>'],
  ['shrimp', 'えび', 'orange', '<path d="M10 2a3.28 3.28 0 003.227 1.798l6.17-.561A1 1 0 1119.614 8H8.5a6.44 6.44 0 00-5.63 9.75A6.5 6.5 0 008.5 21c1.38 0 2-.5 2.5-1"/><path d="M10 8a8.5 8.5 0 000 8"/><path d="M11 22c-.5-.5-1.12-1-2.5-1a1 1 0 010-5H12a7 7 0 007-7V8"/><path d="M13 12h.01"/><path d="M8 16c-2 0-4.5-4-4-6"/>'],
  ['beef', 'お肉', 'red', '<path d="M16.4 13.7A6.5 6.5 0 1 0 6.28 6.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3"/><path d="m18.5 6 1.754 3.5a6.48 6.48 0 0 1-1.854 8.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5"/><circle cx="12.5" cy="8.5" r="2.5"/>'],
  ['drumstick', 'とり肉', 'brown', '<path d="M15.4 15.63a7.875 6 135 1 1 6.23-6.23 4.5 3.43 135 0 0-6.23 6.23"/><path d="m8.29 12.71-2.6 2.6a2.5 2.5 0 1 0-1.65 4.65A2.5 2.5 0 1 0 8.7 18.3l2.59-2.59"/>'],
  ['ham', 'ハム', 'pink', '<path d="M13.144 21.144A7.274 10.445 45 1 0 2.856 10.856"/><path d="M13.144 21.144A7.274 4.365 45 0 0 2.856 10.856a7.274 4.365 45 0 0 10.288 10.288"/><path d="M16.565 10.435 18.6 8.4a2.501 2.501 0 1 0 1.65-4.65 2.5 2.5 0 1 0-4.66 1.66l-2.024 2.025"/><path d="m8.5 16.5-1-1"/>'],
  ['soup', 'スープ・めん', 'orange', '<path d="M11.248 3c.273.1.808.53.747 1.36-.05.83-.938 1.2-.989 2.02-.06.78.333 1.24.727 1.62"/><path d="M16.252 3c.268.1.794.53.745 1.36-.06.83-.923 1.2-.993 2.02-.05.78.338 1.24.725 1.62"/><path d="M19.5 12 22 6"/><path d="M4 12a1 1 0 00-.99 1.133A9 9 0 0012 21a9 9 0 008.99-7.867A1 1 0 0020 12z"/><path d="M6.252 3c.268.1.794.53.745 1.36-.06.83-.923 1.2-.993 2.02-.05.78.338 1.24.735 1.62"/><path d="M7 21h10"/>'],
  ['utensils', 'おかず', 'gray', '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>'],
  ['cooking-pot', 'なべ', 'gray', '<path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/>'],
  ['pizza', 'ピザ', 'orange', '<path d="m12 14-1 1"/><path d="m13.75 18.25-1.25 1.42"/><path d="M17.775 5.654a15.68 15.68 0 0 0-12.121 12.12"/><path d="M18.8 9.3a1 1 0 0 0 2.1 7.7"/><path d="M21.964 20.732a1 1 0 0 1-1.232 1.232l-18-5a1 1 0 0 1-.695-1.232A19.68 19.68 0 0 1 15.732 2.037a1 1 0 0 1 1.232.695z"/>'],
  ['cookie', 'おせんべい', 'brown', '<path d="M11 17h.01"/><path d="M11.496 2c.324-.016.558.292.529.615a4 4 0 004.235 4.368.713.713 0 01.758.757 4 4 0 004.366 4.237c.323-.03.63.204.614.527a10 10 0 01-2.915 6.566A1 1 0 114.93 4.918 10 10 0 0111.496 2"/><path d="M12 12h.01"/><path d="M16 16h.01"/><path d="M16 3h.01"/><path d="M21 4h.01"/><path d="M21 8h.01"/><path d="M7 14h.01"/><path d="M9 8h.01"/>'],
  ['cake-slice', 'ケーキ', 'pink', '<path d="M16 13H3"/><path d="M16 17H3"/><path d="m7.2 7.9-3.388 2.5A2 2 0 0 0 3 12.01V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8.654c0-2-2.44-6.026-6.44-8.026a1 1 0 0 0-1.082.057L10.4 5.6"/><circle cx="9" cy="7" r="2"/>'],
  ['donut', 'ドーナツ', 'pink', '<path d="M20.5 10a2.5 2.5 0 0 1-2.4-3H18a2.95 2.95 0 0 1-2.6-4.4 10 10 0 1 0 6.3 7.1c-.3.2-.8.3-1.2.3"/><circle cx="12" cy="12" r="3"/>'],
  ['ice-cream-cone', 'アイス', 'pink', '<path d="m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11"/><path d="M17 7A5 5 0 0 0 7 7"/><path d="M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4"/>'],
  ['candy', 'あめ', 'pink', '<path d="M10 7v10.9"/><path d="M14 6.1V17"/><path d="M16 7V3a1 1 0 0 1 1.707-.707 2.5 2.5 0 0 0 2.152.717 1 1 0 0 1 1.131 1.131 2.5 2.5 0 0 0 .717 2.152A1 1 0 0 1 21 8h-4"/><path d="M16.536 7.465a5 5 0 0 0-7.072 0l-2 2a5 5 0 0 0 0 7.07 5 5 0 0 0 7.072 0l2-2a5 5 0 0 0 0-7.07"/><path d="M8 17v4a1 1 0 0 1-1.707.707 2.5 2.5 0 0 0-2.152-.717 1 1 0 0 1-1.131-1.131 2.5 2.5 0 0 0-.717-2.152A1 1 0 0 1 3 16h4"/>'],
  ['popcorn', 'おかし', 'amber', '<path d="M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4"/><path d="M10 22 9 8"/><path d="m14 22 1-14"/><path d="M20 8c.5 0 .9.4.8 1l-2.6 12c-.1.5-.7 1-1.2 1H7c-.6 0-1.1-.4-1.2-1L3.2 9c-.1-.6.3-1 .8-1Z"/>'],
  ['can', 'かんづめ', 'gray', '<path d="M21 10.5a9 2.5 0 01-18 0v8a9 2.5 0 0018 0z"/><path d="M21 10.5A9 2.5 25.32 004.59 3.47 9 2.5 25.32 0021 10.5"/><path d="M3 10.5a9 2.5 0 016.527-2.405"/><path d="M9 16.858a31 31 0 006 0"/>'],
  ['milk', '牛乳', 'blue', '<path d="M8 2h8"/><path d="M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2"/><path d="M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0"/>'],
  ['coffee', 'お茶', 'green', '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>'],
  ['cup-soda', 'ジュース', 'red', '<path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"/><path d="M5 8h14"/><path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"/><path d="m12 8 1-6h2"/>'],
  ['beer', 'ビール', 'amber', '<path d="M17 11h1a3 3 0 0 1 0 6h-1"/><path d="M9 12v6"/><path d="M13 12v6"/><path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 2 11 2s2 1.5 3 1.5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z"/><path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"/>'],
  ['wine', 'ワイン', 'purple', '<path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/>'],
  ['bottle-wine', 'お酒', 'purple', '<path d="M10 3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a6 6 0 0 0 1.2 3.6l.6.8A6 6 0 0 1 17 13v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-8a6 6 0 0 1 1.2-3.6l.6-.8A6 6 0 0 0 10 5z"/><path d="M17 13h-4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h4"/>'],
  ['glass-water', 'コップの 水', 'blue', '<path d="M5.116 4.104A1 1 0 0 1 6.11 3h11.78a1 1 0 0 1 .994 1.105L17.19 20.21A2 2 0 0 1 15.2 22H8.8a2 2 0 0 1-2-1.79z"/><path d="M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0"/>'],
  ['droplet', '水', 'teal', '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>'],
  ['snowflake', 'こおり', 'teal', '<path d="m10 20-1.25-2.5L6 18"/><path d="M10 4 8.75 6.5 6 6"/><path d="m14 20 1.25-2.5L18 18"/><path d="m14 4 1.25 2.5L18 6"/><path d="m17 21-3-6h-4"/><path d="m17 3-3 6 1.5 3"/><path d="M2 12h6.5L10 9"/><path d="m20 10-1.5 2 1.5 2"/><path d="M22 12h-6.5L14 15"/><path d="m4 10 1.5 2L4 14"/><path d="m7 21 3-6-1.5-3"/><path d="m7 3 3 6h4"/>'],
  ['toilet', 'トイレ', 'teal', '<path d="M7 12h13a1 1 0 0 1 1 1 5 5 0 0 1-5 5h-.598a.5.5 0 0 0-.424.765l1.544 2.47a.5.5 0 0 1-.424.765H5.402a.5.5 0 0 1-.424-.765L7 18"/><path d="M8 18a5 5 0 0 1-5-5V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8"/>'],
  ['box', 'はこ', 'pink', '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>'],
  ['washing-machine', 'せんたく', 'blue', '<path d="M3 6h3"/><path d="M17 6h.01"/><rect width="18" height="20" x="3" y="2" rx="2"/><circle cx="12" cy="13" r="5"/><path d="M12 18a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5"/>'],
  ['soap-dispenser-droplet', 'せんざい', 'green', '<path d="M10.5 2v4"/><path d="M14 2H7a2 2 0 0 0-2 2"/><path d="M19.29 14.76A6.67 6.67 0 0 1 17 11a6.6 6.6 0 0 1-2.29 3.76c-1.15.92-1.71 2.04-1.71 3.19 0 2.22 1.8 4.05 4 4.05s4-1.83 4-4.05c0-1.16-.57-2.26-1.71-3.19"/><path d="M9.607 21H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h7V7a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>'],
  ['shower-head', 'シャンプー', 'purple', '<path d="m4 4 2.5 2.5"/><path d="M13.5 6.5a4.95 4.95 0 0 0-7 7"/><path d="M15 5 5 15"/><path d="M14 17v.01"/><path d="M10 16v.01"/><path d="M13 13v.01"/><path d="M16 10v.01"/><path d="M11 20v.01"/><path d="M17 14v.01"/><path d="M20 11v.01"/>'],
  ['bath', 'おふろ', 'blue', '<path d="M10 4 8 6"/><path d="M17 19v2"/><path d="M2 12h20"/><path d="M7 19v2"/><path d="M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>'],
  ['spray-can', 'スプレー', 'teal', '<path d="M3 3h.01"/><path d="M7 5h.01"/><path d="M11 7h.01"/><path d="M3 7h.01"/><path d="M7 9h.01"/><path d="M3 11h.01"/><rect width="4" height="4" x="15" y="5"/><path d="m19 9 2 2v10c0 .6-.4 1-1 1h-6c-.6 0-1-.4-1-1V11l2-2"/><path d="m13 14 8-2"/><path d="m13 19 8-2"/>'],
  ['toothbrush', 'はブラシ', 'teal', '<path d="M15 11c-2 2-4 2-6 4l-7 7"/><path d="m22 4-7.414 7.414-2-2A2 2 0 0114 6c0-.512.196-1.024.586-1.414A2 2 0 0116 4a2 2 0 013.262-1.552l2.152 2.138"/>'],
  ['trash-2', 'ごみ袋', 'gray', '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'],
  ['broom', 'そうじ', 'brown', '<path d="M13.5 10.5 22 2"/><path d="M14.734 13.841a2 2 0 00-.314-2.42L12.58 9.58a2 2 0 00-2.421-.314l-7.657 4.461A1 1 0 002.3 15.3l6.403 6.403a1 1 0 001.571-.204z"/><path d="m5 18 2-2"/><path d="m7.699 10.7 5.602 5.601"/>'],
  ['battery-full', '電池', 'green', '<path d="M10 10v4"/><path d="M14 10v4"/><path d="M22 14v-4"/><path d="M6 10v4"/><rect x="2" y="6" width="16" height="12" rx="2"/>'],
  ['lightbulb', '電球', 'amber', '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>'],
  ['bandage', 'ばんそうこう', 'orange', '<path d="M10 10.01h.01"/><path d="M10 14.01h.01"/><path d="M14 10.01h.01"/><path d="M14 14.01h.01"/><path d="M18 6v12"/><path d="M6 6v12"/><rect x="2" y="6" width="20" height="12" rx="2"/>'],
  ['pill', 'くすり', 'red', '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>'],
  ['shirt', 'ふく', 'blue', '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>'],
  ['flower', 'お花', 'pink', '<circle cx="12" cy="12" r="3"/><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"/><path d="M12 7.5V9"/><path d="M7.5 12H9"/><path d="M16.5 12H15"/><path d="M12 16.5V15"/><path d="m8 8 1.88 1.88"/><path d="M14.12 9.88 16 8"/><path d="m8 16 1.88-1.88"/><path d="M14.12 14.12 16 16"/>'],
  ['flower-2', 'さくら', 'pink', '<path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1"/><circle cx="12" cy="8" r="2"/><path d="M12 10v12"/><path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z"/><path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z"/>'],
  ['sprout', 'なえ', 'green', '<path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3"/><path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4"/><path d="M5 21h14"/>'],
  ['newspaper', '新聞', 'gray', '<path d="M15 18h-5"/><path d="M18 14h-8"/><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="10" y="6" rx="1"/>'],
  ['mail', 'はがき', 'blue', '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>'],
  ['dog', 'いぬ', 'brown', '<path d="M11.25 16.25h1.5L12 17z"/><path d="M16 14v.5"/><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309"/><path d="M8 14v.5"/><path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"/>'],
  ['cat', 'ねこ', 'orange', '<path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/>'],
  ['paw-print', 'ペット', 'brown', '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>'],
  ['gift', 'プレゼント', 'red', '<path d="M12 7v14"/><path d="M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5"/><rect x="3" y="7" width="18" height="4" rx="1"/>'],
  ['package', 'にもつ', 'brown', '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>'],
  ['shopping-bag', 'ふくろ', 'green', '<path d="M16 10a4 4 0 0 1-8 0"/><path d="M3.103 6.034h17.794"/><path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"/>'],
];
const PIC = Object.fromEntries(PICS.map(p => [p[0], p]));
// 1.4 and before gave items an emoji, which varied from phone to phone; each becomes its nearest drawing once,
// and an emoji with none (a tomato, an onion…) gives way to the name's first letter
const FROM_EMOJI = { '🍞': 'sandwich', '🥚': 'egg', '🌾': 'wheat', '🍚': 'wheat', '🍌': 'banana', '🍎': 'apple', '🍊': 'citrus', '🍇': 'grape', '🥕': 'carrot', '🥬': 'leafy-green', '🥦': 'leafy-green', '🐟': 'fish', '🦐': 'shrimp', '🥩': 'beef', '🍗': 'drumstick', '🥓': 'ham', '🍜': 'soup', '🍱': 'utensils', '🥟': 'utensils', '🍘': 'cookie', '🍪': 'cookie', '🍰': 'cake-slice', '🍦': 'ice-cream-cone', '🍫': 'candy', '🍬': 'candy', '🥫': 'can', '🥛': 'milk', '🍵': 'coffee', '☕': 'coffee', '🧃': 'cup-soda', '🍺': 'beer', '🍶': 'bottle-wine', '💧': 'droplet', '🧊': 'snowflake', '🧻': 'toilet', '🤧': 'box', '🧺': 'washing-machine', '🧽': 'soap-dispenser-droplet', '🧼': 'soap-dispenser-droplet', '🧴': 'shower-head', '🪥': 'toothbrush', '🗑️': 'trash-2', '🧹': 'broom', '🔋': 'battery-full', '💡': 'lightbulb', '🩹': 'bandage', '💊': 'pill', '👕': 'shirt', '💐': 'flower', '🌸': 'flower-2', '📰': 'newspaper', '✉️': 'mail', '🐶': 'dog', '🐱': 'cat', '🎁': 'gift', '📦': 'package' };
// items keep an emoji beside their drawing, so a window still running 1.4 (left open on the phone) shows it,
// and what that window saves comes back as the same drawing
const TO_EMOJI = {};
for (const [e, n] of Object.entries(FROM_EMOJI)) TO_EMOJI[n] = TO_EMOJI[n] || e;
// name, picture, unit, genre, and the catalog that brought it (none: the first one; 2: 1.14; 3: 1.15, a hundred
// everyday things from a supermarket, none of them a maker's product; 4: 1.16, ten more drinks; 5: 1.20, 大トロ and
// パルミジャーノレッジャーノ, asked for by name; 6: 1.21, ごぼう and カレールー for the starting sets; 7: 1.22, what the twenty
// dishes' sets needed that the list didn't have). Each size is an item of its own, so the parent is never asked which one.
const DEFAULT_ITEMS = [
  ['食パン 6枚切り', 'sandwich', '袋', 'staple'],
  ['食パン 8枚切り', 'sandwich', '袋', 'staple'],
  ['ロールパン', 'croissant', '袋', 'staple', 3],
  ['お米 2kg', 'wheat', '袋', 'staple'],
  ['お米 5kg', 'wheat', '袋', 'staple'],
  ['パックごはん', '', 'パック', 'staple', 3],
  ['もち', '', '袋', 'staple', 3],
  ['うどん', 'soup', '袋', 'staple', 2],
  ['そば', '', '袋', 'staple', 3],
  ['そうめん', '', '袋', 'staple', 3],
  ['ラーメン', '', '袋', 'staple', 3],
  ['焼きそば', '', '袋', 'staple', 3],
  ['スパゲッティ', '', '袋', 'staple', 3],
  ['トマト', '', '個', 'veg'],
  ['ミニトマト', '', 'パック', 'veg', 3],
  ['たまねぎ', '', '個', 'veg'],
  ['にんじん', 'carrot', '本', 'veg', 2],
  ['じゃがいも', '', '袋', 'veg', 2],
  ['キャベツ', 'leafy-green', '個', 'veg', 2],
  ['白菜', '', '個', 'veg', 3],
  ['レタス', 'salad', '個', 'veg', 3],
  ['大根', '', '本', 'veg', 3],
  ['ごぼう', '', '本', 'veg', 6],
  ['れんこん', '', 'パック', 'veg', 7],
  ['ねぎ', '', '本', 'veg', 3],
  ['にら', '', 'たば', 'veg', 7],
  ['きゅうり', '', '本', 'veg', 3],
  ['なす', '', '本', 'veg', 3],
  ['ピーマン', '', '袋', 'veg', 3],
  ['ほうれんそう', '', 'たば', 'veg', 3],
  ['もやし', '', '袋', 'veg', 3],
  ['ブロッコリー', '', '個', 'veg', 3],
  ['かぼちゃ', '', '個', 'veg', 3],
  ['さつまいも', '', '本', 'veg', 3],
  ['しいたけ', '', 'パック', 'veg', 3],
  ['しょうが', '', '個', 'veg', 3],
  ['にんにく', '', '個', 'veg', 3],
  ['バナナ', 'banana', 'ふさ', 'fruit'],
  ['りんご', 'apple', '個', 'fruit', 2],
  ['みかん', 'citrus', '袋', 'fruit', 2],
  ['いちご', '', 'パック', 'fruit', 3],
  ['ぶどう', 'grape', 'ふさ', 'fruit', 3],
  ['なし', '', '個', 'fruit', 3],
  ['かき', '', '個', 'fruit', 3],
  ['もも', '', '個', 'fruit', 3],
  ['キウイ', '', '個', 'fruit', 3],
  ['メロン', '', '個', 'fruit', 3],
  ['レモン', '', '個', 'fruit', 3],
  ['お肉', 'beef', 'g', 'meat'],
  ['ぶた肉', '', 'g', 'meat', 3],
  ['牛肉', '', 'g', 'meat', 3],
  ['とり肉', 'drumstick', 'g', 'meat', 2],
  ['ささみ', '', 'パック', 'meat', 3],
  ['ひき肉', '', 'g', 'meat', 3],
  ['ハム', 'ham', 'パック', 'meat', 2],
  ['ソーセージ', '', '袋', 'meat', 3],
  ['ベーコン', '', 'パック', 'meat', 3],
  ['おさかな', 'fish', 'パック', 'fish'],
  ['さけ', '', 'パック', 'fish', 3],
  ['さば', '', 'パック', 'fish', 3],
  ['あじ', '', 'パック', 'fish', 3],
  ['ぶり', '', 'パック', 'fish', 3],
  ['さしみ', '', 'パック', 'fish', 3],
  ['大トロ', '', 'パック', 'fish', 5],
  ['いか', '', 'パック', 'fish', 3],
  ['えび', 'shrimp', 'パック', 'fish', 3],
  ['あさり', '', 'パック', 'fish', 3],
  ['しらす', '', 'パック', 'fish', 3],
  ['ちくわ', '', '袋', 'fish', 3],
  ['たまご', 'egg', 'パック', 'chilled'],
  ['とうふ', '', '丁', 'chilled', 2],
  ['なっとう', 'bean', 'パック', 'chilled', 2],
  ['あぶらあげ', '', '袋', 'chilled', 3],
  ['厚あげ', '', 'パック', 'chilled', 3],
  ['こんにゃく', '', '個', 'chilled', 3],
  ['しらたき', '', '袋', 'chilled', 7],
  ['ぎょうざの皮', '', '袋', 'chilled', 7],
  ['ヨーグルト', '', '個', 'chilled', 2],
  ['チーズ', '', '個', 'chilled', 3],
  ['パルミジャーノレッジャーノ', '', '個', 'chilled', 5],
  ['バター', '', '個', 'chilled', 3],
  ['マーガリン', '', '個', 'chilled', 3],
  ['つけもの', '', 'パック', 'chilled', 3],
  ['うめぼし', '', 'パック', 'chilled', 3],
  ['しょうゆ', '', '本', 'season', 2],
  ['みそ', '', '個', 'season', 2],
  ['さとう', '', '袋', 'season', 3],
  ['塩', '', '袋', 'season', 3],
  ['お酢', '', '本', 'season', 3],
  ['みりん', '', '本', 'season', 3],
  ['サラダ油', '', '本', 'season', 3],
  ['マヨネーズ', '', '本', 'season', 3],
  ['ケチャップ', '', '本', 'season', 3],
  ['ソース', '', '本', 'season', 3],
  ['めんつゆ', '', '本', 'season', 3],
  ['だし', '', '袋', 'season', 3],
  ['こしょう', '', '本', 'season', 3],
  ['小麦粉', '', '袋', 'season', 3],
  ['おせんべい', 'cookie', '袋', 'snack'],
  ['クッキー', '', '箱', 'snack', 3],
  ['チョコレート', '', '箱', 'snack', 3],
  ['ポテトチップス', '', '袋', 'snack', 3],
  ['あめ', 'candy', '袋', 'snack', 3],
  ['ようかん', '', '本', 'snack', 3],
  ['だいふく', '', '個', 'snack', 3],
  ['まんじゅう', '', '個', 'snack', 3],
  ['プリン', '', '個', 'snack', 3],
  ['ゼリー', '', '個', 'snack', 3],
  ['アイス', 'ice-cream-cone', '個', 'snack', 3],
  ['お弁当', 'utensils', '個', 'deli', 3],
  ['おにぎり', '', '個', 'deli', 3],
  ['おすし', '', 'パック', 'deli', 3],
  ['からあげ', '', 'パック', 'deli', 3],
  ['コロッケ', '', '個', 'deli', 3],
  ['天ぷら', '', 'パック', 'deli', 3],
  ['ぎょうざ', '', 'パック', 'deli', 3],
  ['冷凍うどん', '', '袋', 'deli', 3],
  ['ツナ缶', 'can', '個', 'dry', 3],
  ['さば缶', '', '個', 'dry', 3],
  ['カレールー', '', '箱', 'dry', 6],
  ['シチュールー', '', '箱', 'dry', 7],
  ['麻婆豆腐の素', '', '箱', 'dry', 7],
  ['レトルトカレー', '', '箱', 'dry', 3],
  ['インスタントみそしる', '', '袋', 'dry', 3],
  ['のり', '', '袋', 'dry', 3],
  ['わかめ', '', '袋', 'dry', 3],
  ['かつおぶし', '', '袋', 'dry', 3],
  ['ごま', '', '袋', 'dry', 3],
  ['牛乳 1L', 'milk', '本', 'drink'],
  ['牛乳 500ml', 'milk', '本', 'drink'],
  ['とうにゅう', '', '本', 'drink', 3],
  ['飲むヨーグルト', '', '本', 'drink', 4],
  ['乳酸菌飲料', '', '本', 'drink', 4],
  ['お茶', 'coffee', '本', 'drink'],
  ['ほうじ茶', '', '本', 'drink', 4],
  ['ウーロン茶', '', '本', 'drink', 4],
  ['むぎちゃ', '', '袋', 'drink', 3],
  ['こうちゃ', '', '箱', 'drink', 3],
  ['コーヒー', '', '本', 'drink', 3],
  ['ココア', '', '袋', 'drink', 4],
  ['お水', 'droplet', '本', 'drink'],
  ['たんさんすい', 'glass-water', '本', 'drink', 3],
  ['スポーツドリンク', '', '本', 'drink', 4],
  ['ジュース', 'cup-soda', '本', 'drink', 2],
  ['やさいジュース', '', '本', 'drink', 3],
  ['トマトジュース', '', '本', 'drink', 4],
  ['サイダー', '', '本', 'drink', 4],
  ['ビール', 'beer', '本', 'drink', 2],
  ['日本酒', 'bottle-wine', '本', 'drink', 4],
  ['ワイン', 'wine', '本', 'drink', 4],
  ['トイレットペーパー', 'toilet', 'パック', 'daily'],
  ['ティッシュ', 'box', '箱', 'daily'],
  ['せんたく洗剤', 'washing-machine', '個', 'daily'],
  ['台所洗剤', 'soap-dispenser-droplet', '本', 'daily'],
  ['シャンプー', 'shower-head', '本', 'daily'],
  ['ハンドソープ', '', '本', 'daily', 2],
  ['はみがき粉', 'toothbrush', '本', 'daily', 2],
  ['ごみ袋', 'trash-2', '袋', 'daily'],
  ['キッチンペーパー', '', 'パック', 'daily', 2],
  ['ラップ', '', '本', 'daily', 2],
  ['マスク', '', '箱', 'daily', 2],
  ['電池', 'battery-full', 'パック', 'other'],
  ['電球', 'lightbulb', '個', 'other', 2],
  ['ばんそうこう', 'bandage', '箱', 'other', 2],
  ['新聞', 'newspaper', '部', 'other', 2],
  ['お花', 'flower', 'たば', 'other'],
];
// the newest catalog: a phone keeps which one its list has had (catalog), and a list from before gets the rest
const CATALOG = Math.max(...DEFAULT_ITEMS.map(d => d[4] || 1));
// the sets made at first (1.21: two; 1.22: twenty dishes, in the order the family asked for them): each line a starting
// item's name, how many, and how many grams when it goes by g; then the catalog that brought the set, and the name it
// had in 1.21. A set holds what goes into the dish: しょうゆ, みそ, oil, flour and the like are at home already, and would
// be put in each time. The family changes them, or makes more, in 設定.
const DEFAULT_SETS = [
  ['カレーライス', [['じゃがいも', 1], ['にんじん', 1], ['たまねぎ', 2], ['ぶた肉', 1, 300], ['カレールー', 1]], 6, 'カレーセット'],
  ['肉じゃが', [['牛肉', 1, 200], ['じゃがいも', 1], ['にんじん', 1], ['たまねぎ', 1], ['しらたき', 1]], 7],
  ['豚の生姜焼き', [['ぶた肉', 1, 300], ['たまねぎ', 1], ['しょうが', 1], ['キャベツ', 1]], 7],
  ['鶏の唐揚げ', [['とり肉', 1, 300], ['しょうが', 1], ['にんにく', 1]], 7],
  ['ハンバーグ', [['ひき肉', 1, 300], ['たまねぎ', 1], ['たまご', 1]], 7],
  ['餃子', [['ひき肉', 1, 200], ['キャベツ', 1], ['にら', 1], ['ぎょうざの皮', 1]], 7],
  ['麻婆豆腐', [['とうふ', 1], ['ひき肉', 1, 100], ['ねぎ', 1], ['麻婆豆腐の素', 1]], 7],
  ['野菜炒め', [['ぶた肉', 1, 200], ['キャベツ', 1], ['もやし', 1], ['にんじん', 1], ['ピーマン', 1]], 7],
  ['焼き鮭', [['さけ', 1]], 7],
  ['さばの味噌煮', [['さば', 1], ['しょうが', 1], ['ねぎ', 1]], 7],
  ['親子丼', [['とり肉', 1, 200], ['たまねぎ', 1], ['たまご', 1]], 7],
  ['筑前煮', [['とり肉', 1, 200], ['ごぼう', 1], ['れんこん', 1], ['にんじん', 1], ['こんにゃく', 1], ['しいたけ', 1]], 7],
  ['きんぴらごぼう', [['ごぼう', 1], ['にんじん', 1]], 7],
  ['卵焼き', [['たまご', 1]], 7],
  ['ほうれん草のおひたし', [['ほうれんそう', 1]], 7],
  ['味噌汁', [['とうふ', 1], ['わかめ', 1], ['ねぎ', 1]], 7],
  ['豚汁', [['ぶた肉', 1, 200], ['大根', 1], ['にんじん', 1], ['ごぼう', 1], ['こんにゃく', 1], ['ねぎ', 1]], 6, '豚汁セット'],
  ['クリームシチュー', [['とり肉', 1, 300], ['じゃがいも', 1], ['にんじん', 1], ['たまねぎ', 1], ['ブロッコリー', 1], ['牛乳 1L', 1], ['シチュールー', 1]], 7],
  ['オムライス', [['とり肉', 1, 200], ['たまねぎ', 1], ['たまご', 1]], 7],
  ['チャーハン', [['たまご', 1], ['ハム', 1], ['ねぎ', 1]], 7],
];

let seq = 0;
const uid = () => Date.now().toString(36) + (seq++).toString(36) + Math.random().toString(36).slice(2, 5);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
// long enough to be felt by older fingers, whose touch is less sensitive
const buzz = () => { try { navigator.vibrate && navigator.vibrate(25); } catch (e) {} };

// M3 ripple: a circle grows from the finger, so every press shows that it landed
const calm = matchMedia('(prefers-reduced-motion: reduce)');
document.addEventListener('pointerdown', e => {
  const el = e.target.closest('.sl');
  if (!el || calm.matches || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
  const r = el.getBoundingClientRect(), d = Math.hypot(r.width, r.height) * 2;
  const s = document.createElement('span');
  s.className = 'ripple';
  s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  el.appendChild(s);
  s.addEventListener('animationend', () => s.remove());
}, { passive: true });

// Chrome on Android turns a press of about half a second into a long press and drops the tap, and older fingers
// press slowly: a long press on a button counts as pressing it (ひらく in the 設定 question keeps its own hold)
let longPress = null;
document.addEventListener('contextmenu', e => {
  if (e.pointerType && e.pointerType !== 'touch') return;
  const el = e.target.closest('button, a.btn');
  if (!el) return;
  e.preventDefault();
  if (el.classList.contains('hold') || el.disabled || el.closest('[hidden]')) return;
  longPress = { el, t: performance.now() };
  el.click();
});
document.addEventListener('click', e => {
  // should the browser still send its own click after that long press, it is the same press
  if (longPress && e.isTrusted && longPress.el.contains(e.target) && performance.now() - longPress.t < 1500) {
    e.preventDefault(); e.stopPropagation(); longPress = null;
  }
}, true);

/* ---------- storage (this phone only) ---------- */
// small things (the list, the cart, settings) live in localStorage; photos, recordings and the copy kept before
// a file is read in live in IndexedDB, which has far more room, so photos can never crowd out the list
const unsaved = new Set();
function load(name, fallback) {
  try { const s = localStorage.getItem(KEY + name); return s == null ? fallback : JSON.parse(s); }
  catch (e) { return fallback; }
}
// a failed save stays on screen (the bar at the top) until a later save of the same thing goes through;
// items and the sent lists are saved whole, so when another window saved them after this one last read them
// (before its storage event arrived), that version is kept as a copy before this one goes over it
const seen = {};
function save(name, value) {
  try {
    const raw = JSON.stringify(value);
    if ((name === 'items' || name === 'history') && name in seen) {
      const cur = localStorage.getItem(KEY + name);
      if (cur !== null && cur !== seen[name] && cur !== raw) { const other = rawNow(); autoCopy('conflict', other).catch(() => noteTrouble('copy')); }
    }
    localStorage.setItem(KEY + name, raw);
    seen[name] = raw;
    if (unsaved.delete(name)) paintSaveBar();
    return true;
  } catch (e) { unsaved.add(name); paintSaveBar(); return false; }
}
// 3: something kept in IndexedDB (a copy, the bin, a photo) could not be saved: the family is told
function noteTrouble(kind) { save('trouble', { at: Date.now(), kind }); }
function drop(name) { try { localStorage.removeItem(KEY + name); unsaved.delete(name); } catch (e) {} }
function paintSaveBar() {
  const bar = document.getElementById('saveBar');
  if (bar) bar.hidden = !unsaved.size;
}

function okItem(x) { return x && typeof x === 'object' && String(x.name || '').trim() !== ''; }
// 1.10: an item with sizes to pick from (お米: 2kg・5kg) becomes one item for each size (お米 2kg, お米 5kg), so the
// parent presses the one they want and is never asked which. The new id is the old one with the size, so the list
// being picked, the sent lists and the copies made before all still find it.
const sizeId = (id, size) => id + '~' + size.replace(/\|/g, '/');
const withSize = (name, size) => name.slice(0, 59 - size.length) + ' ' + size;
function fixItem(x) {
  const icon = typeof x.icon === 'string' ? (PIC[x.icon] ? x.icon : '') : (FROM_EMOJI[x.emoji] || '');
  return {
    id: String(x.id || uid()),
    // names and notes have room for a size joined to them (1.10)
    name: String(x.name).trim().slice(0, 60),
    icon,
    emoji: TO_EMOJI[icon] || '',
    unit: String(x.unit || '個').slice(0, 8),
    group: GROUPS.some(g => g.key === x.group) ? x.group : 'other',
    // read only to split what 1.9 and before kept (splitSizes); empty from then on, and kept for a window still on 1.9
    sizes: Array.isArray(x.sizes) ? [...new Set(x.sizes.map(s => String(s).trim().slice(0, 12)).filter(Boolean))].slice(0, 8) : [],
    note: String(x.note || '').slice(0, 60),
    gset: Math.max(1, Math.min(GSET, +x.gset || 1)),
    photo: !!x.photo,
    count: Math.max(0, +x.count || 0),
    lastAt: Math.max(0, +x.lastAt || 0),
  };
}
function fixCart(c) {
  c = c && typeof c === 'object' ? c : {};
  const lines = {};
  // 1.9 and before kept an amount picked under a size as id|size: it belongs to the item of that size now
  if (c.lines && typeof c.lines === 'object') for (const [k, v] of Object.entries(c.lines).slice(0, MAX_ITEMS * 2)) if (+v > 0) {
    const i = k.indexOf('|'), key = (i < 0 ? k : sizeId(k.slice(0, i), k.slice(i + 1))).slice(0, 80);
    lines[key] = Math.max(lines[key] || 0, Math.min(+v, 9900));
  }
  // an extra is typed words, or a recording kept in IndexedDB under its id (at: when it was recorded)
  const extras = Array.isArray(c.extras) ? c.extras.filter(x => x && (x.voice || String(x.text || '').trim())).slice(0, MAX_EXTRAS)
    .map(x => x.voice ? { id: String(x.id || uid()), voice: true, sec: Math.max(0, +x.sec || 0), at: +x.at || Date.now() } : { id: String(x.id || uid()), text: String(x.text).slice(0, 200) }) : [];
  return { lines, extras, when: WHEN.includes(c.when) ? c.when : '' };
}
function okHist(h) { return h && typeof h === 'object' && +h.at > 0 && Array.isArray(h.lines); }
function fixHist(h) {
  return {
    at: +h.at,
    // a size picked in 1.9 and before is the item of that size now; size stays in each line, empty, for a window still on 1.9
    lines: h.lines.filter(l => l && l.name).slice(0, MAX_LINES).map(l => {
      const id = String(l.id || '').slice(0, 80), name = String(l.name).slice(0, 60), size = String(l.size || '').trim().slice(0, 12);
      return { id: size && id ? sizeId(id, size) : id, name: size ? withSize(name, size) : name, size: '', unit: String(l.unit || '').slice(0, 8), qty: Math.min(Math.max(1, +l.qty || 1), 9900) };
    }),
    extras: Array.isArray(h.extras) ? h.extras.map(String).filter(Boolean).slice(0, MAX_EXTRAS).map(t => t.slice(0, 200)) : [],
    when: String(h.when || '').slice(0, 20),
  };
}
// 1.21: a set is a name and the items it puts into the list, each with its amount in the item's own unit
function okSet(s) { return s && typeof s === 'object' && String(s.name || '').trim() !== '' && Array.isArray(s.lines); }
function fixSet(s) {
  const ids = new Set();
  return {
    id: String(s.id || uid()).slice(0, 40),
    name: String(s.name).trim().slice(0, 20),
    lines: s.lines.filter(l => l && l.id && !ids.has(String(l.id)) && ids.add(String(l.id))).slice(0, MAX_SET_LINES)
      .map(l => ({ id: String(l.id).slice(0, 80), qty: Math.min(Math.max(1, Math.round(+l.qty) || 1), 9900) })),
  };
}
// made gets each new item's id and the old one's, for its photo; a single size moves into くわしく, where it showed already
function splitSizes(list, made = new Map()) {
  const out = [];
  for (const it of list) {
    if (it.sizes.length < 2) { out.push(it.sizes.length ? { ...it, sizes: [], note: [it.sizes[0], it.note].filter(Boolean).join('・').slice(0, 60) } : it); continue; }
    for (const size of it.sizes) {
      const n = { ...it, id: sizeId(it.id, size), name: withSize(it.name, size), sizes: [], count: 0, lastAt: 0 };
      made.set(n.id, it.id);
      out.push(n);
    }
  }
  return out;
}
// a split item's count and last day: from the sent lists kept, size by size
function statsFor(list, made, h = hist) {
  if (!made.size) return;
  const st = statsOf(h);
  for (const it of list) if (made.has(it.id)) Object.assign(it, st.get(it.id) || { count: 0, lastAt: 0 });
}
const freshItems = (from = 0) => DEFAULT_ITEMS.filter(d => (d[4] || 1) > from).map(([name, icon, unit, group]) => fixItem({ name, icon, unit, group, gset: GSET }));
// a name as the family may have typed it: りんご and リンゴ, or ハム and ﾊﾑ, are one item
const nameKey = s => String(s).normalize('NFKC').replace(/\s/g, '').replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
// 1.15: an item under たべもの from before goes to the genre of the starting item of its name (食パン and お米, kept
// whole from before their sizes, too); one with another name stays, as ほかの たべもの. Each item is sorted once
// (gset), so one the family puts back under ほかの たべもの later stays there. Returns how many were sorted now.
const DEFAULT_GROUP = new Map([...DEFAULT_ITEMS.map(d => [nameKey(d[0]), d[3]]), [nameKey('食パン'), 'staple'], [nameKey('お米'), 'staple']]);
function regroup(list) {
  let n = 0;
  for (const it of list) {
    if (it.gset >= GSET) continue;
    if (it.group === 'food') it.group = DEFAULT_GROUP.get(nameKey(it.name)) || 'food';
    it.gset = GSET;
    n++;
  }
  return n;
}

// a recording never sent is kept a week (how long sent lists stay is the family's choice, settings.keep)
const VOICE_DAYS = 7;
// the most stored data (or a damaged one) can bring in, so the list always fits in this phone's room for it
const MAX_ITEMS = 500, MAX_LINES = 100, MAX_EXTRAS = 30, MAX_SETS = 50, MAX_SET_LINES = 30;
// to: the family member's name as LINE shows it; keep: how long sent lists stay (one: only the newest);
// copyDays: how long the automatic copies stay
const defaultSettings = () => ({ size: 'm', to: '', keep: 'three', copyDays: 60 });
const KEEP_DAYS = { month: 30, three: 90 };
// stored data that can't be read (all of it, or some entries) is noted here, kept aside at start, and never
// written over in silence
const broken = new Set();
// items split by size as they were read (new id → old id): saved, each with its own copy of the photo, only once the
// copy taken on an update is made (finishSplit)
const splitMade = new Map();
// items moved out of たべもの as they were read: saved once the copy taken on an update is made
let regrouped = 0;
const loadItems = () => {
  const v = load('items', null);
  if (!Array.isArray(v)) { if (RAW.items != null) broken.add('items'); return null; }
  const ok = v.filter(okItem);
  if (ok.length < v.length) broken.add('items');
  const list = splitSizes(ok.map(fixItem), splitMade);
  regrouped += regroup(list);
  return list;
};
const loadHist = () => {
  const v = load('history', []);
  if (!Array.isArray(v)) { if (RAW.history != null) broken.add('history'); return []; }
  const ok = v.filter(okHist);
  if (ok.length < v.length) broken.add('history');
  return ok.map(fixHist);
};
// null when there have never been any (the starting sets are made then); sets that can't be read are noted, and none
// of it is saved over till the family changes the sets
const loadSets = () => {
  let raw = null;
  try { raw = localStorage.getItem(KEY + 'sets'); } catch (e) {}
  const v = load('sets', null);
  if (!Array.isArray(v)) { if (raw != null) { broken.add('sets'); return []; } return null; }
  const ok = v.filter(okSet);
  if (ok.length < v.length) broken.add('sets');
  return ok.slice(0, MAX_SETS).map(fixSet);
};
// the starting sets (of the catalogs after from), made of the items of those names on the list now: a name the list
// doesn't have is left out, and a set left with nothing isn't made
function startSets(from = 0) {
  const byName = new Map();
  for (const it of items) if (!byName.has(nameKey(it.name))) byName.set(nameKey(it.name), it);
  return DEFAULT_SETS.filter(d => d[2] > from).map(([name, lines]) => fixSet({ name, lines: lines.map(([n, count, grams]) => {
    const it = byName.get(nameKey(n));
    return it && { id: it.id, qty: it.unit === 'g' ? grams || 100 : count };
  }).filter(Boolean) })).filter(s => s.lines.length);
}
// 1.22: sets kept from an earlier catalog get the dishes that came after it, once: each goes after the nearest dish
// before it that the list has (or before the nearest one after it, or at the end), so the dishes keep the order they
// were asked for in and the family's own sets stay where they are. カレーセット and 豚汁セット take their dishes' names. A
// dish the list has a set of by that name already is left out.
function addNewSets(had) {
  const key = s => nameKey(s.name), order = DEFAULT_SETS.map(d => nameKey(d[0]));
  for (const [name, , , old] of DEFAULT_SETS) {
    const s = old && sets.find(x => key(x) === nameKey(old));
    if (s && !sets.some(x => key(x) === nameKey(name))) s.name = name;
  }
  const where = k => sets.findIndex(x => key(x) === order[k]);
  for (const s of startSets(had)) {
    if (sets.length >= MAX_SETS) break;
    if (sets.some(x => key(x) === key(s))) continue;
    const k = order.indexOf(key(s));
    let at = -1;
    for (let j = k - 1; j >= 0 && at < 0; j--) { const p = where(j); if (p >= 0) at = p + 1; }
    for (let j = k + 1; j < order.length && at < 0; j++) at = where(j);
    sets.splice(at < 0 ? sets.length : at, 0, s);
  }
}
// what was stored when this version started, before anything here rewrote it: the copy taken on an update
const RAW_KEYS = ['items', 'history', 'settings', 'sets'];
const rawNow = () => { const r = {}; for (const n of RAW_KEYS) { try { r[n] = localStorage.getItem(KEY + n); } catch (e) { r[n] = null; } } return r; };
const RAW = rawNow(), lastVer = load('ver', null);
let items = loadItems();
// with nothing readable stored, the starting items show, but are saved only once the stored list has been kept aside
if (!items) { items = freshItems(); if (RAW.items == null) { save('items', items); save('catalog', CATALOG); } }
let cart = fixCart(load('cart', null));
let hist = loadHist();
let sets = loadSets();
// a first start makes the starting sets at once; a list kept from before gets them at start, once its new items are in
if (sets === null && RAW.items == null) { sets = startSets(); save('sets', sets); }
statsFor(items, splitMade);
const loadSettings = () => {
  const v = load('settings', null);
  if (v === null || typeof v !== 'object' || Array.isArray(v)) { if (RAW.settings != null) broken.add('settings'); return defaultSettings(); }
  // 1.18 always sends through LINE and always shows the light colours, and has no backups: those choices stay behind
  const { send, theme, lock, ...rest } = v;
  return Object.assign(defaultSettings(), rest);
};
let settings = loadSettings();
// what this window last read or wrote, for the check in save()
for (const n of ['items', 'history']) seen[n] = RAW[n];
let pending = load('pending', null);
if (pending && !(Date.now() - (+pending.at || 0) < 3 * DAY)) { pending = null; drop('pending'); }
// 1.17 and before kept a note of the last backup, and an offer to read one in after a first start
drop('backup'); drop('welcome');
const saveCart = () => save('cart', cart);
// the phone's clock decides what is old enough to go; when it looks wrong (two days or more from the server's time,
// or, with no server to ask, more than 400 days past the latest time this app has seen), nothing goes by date
let clockOK = true;
async function checkClock() {
  const now = Date.now(), seen = +load('clock', 0);
  let server = 0;
  try { server = Date.parse((await fetch('manifest.webmanifest', { method: 'HEAD', cache: 'no-store' })).headers.get('date') || '') || 0; } catch (e) {}
  clockOK = server ? Math.abs(now - server) < 2 * DAY : !(seen && now - seen > 400 * DAY);
  if (clockOK && now > seen) save('clock', now);
}
// what stays of the sent lists under the family's choice: the newest only, or the last month or three
function keptHist(list) {
  if (settings.keep === 'one') return list.slice(0, 1);
  const days = KEEP_DAYS[settings.keep] || 90;
  return (clockOK ? list.filter(h => h.at >= Date.now() - days * DAY) : list).slice(0, 60);
}
function trimHist() {
  const n = hist.length;
  hist = keptHist(hist);
  if (hist.length !== n) save('history', hist);
  if (syncStats()) save('items', items);
}
// when the family keeps less than three months, each item's count and last day come from the lists still kept,
// so nothing older stays behind in the items
function syncStats() {
  if (settings.keep === 'three') return false;
  const st = statsOf(hist);
  let changed = false;
  for (const it of items) {
    const s = st.get(it.id) || { count: 0, lastAt: 0 };
    if (it.count !== s.count || it.lastAt !== s.lastAt) { it.count = s.count; it.lastAt = s.lastAt; changed = true; }
  }
  return changed;
}
function statsOf(list) {
  const st = new Map();
  for (const h of list) for (const id of new Set((h.lines || []).map(l => l.id))) {
    const s = st.get(id) || { count: 0, lastAt: 0 };
    s.count++;
    s.lastAt = Math.max(s.lastAt, +h.at || 0);
    st.set(id, s);
  }
  return st;
}

/* ---------- IndexedDB: photos, recordings, and the copy kept before reading a file in ---------- */
// the name is from 1.3, when it held recordings only; version 2 added photos and snaps
const DB_NAME = 'kaimono-voice', DB_VER = 2;
let dbp = null;
function db() {
  dbp = dbp || new Promise((res, rej) => {
    const q = indexedDB.open(DB_NAME, DB_VER);
    q.onupgradeneeded = () => { for (const s of ['clips', 'photos', 'snaps']) if (!q.result.objectStoreNames.contains(s)) q.result.createObjectStore(s); };
    // another window of the app gives way when this one needs a newer version (or wants to delete everything)
    q.onsuccess = () => { const d = q.result; d.onversionchange = () => { d.close(); dbp = null; }; res(d); };
    q.onerror = () => { dbp = null; rej(q.error); };
    q.onblocked = () => toast('かいものメモが ほかにも ひらいて います。そちらを とじて ください。');
  });
  return dbp;
}
const idbReq = req => new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });
const store = async (name, mode = 'readonly') => (await db()).transaction(name, mode).objectStore(name);
const idbGet = async (s, k) => idbReq((await store(s)).get(k));
const idbPut = async (s, k, v) => idbReq((await store(s, 'readwrite')).put(v, k));
const idbDel = async (s, k) => idbReq((await store(s, 'readwrite')).delete(k));
const idbKeys = async s => idbReq((await store(s)).getAllKeys());
async function idbAll(s) {
  const st = await store(s);
  const [keys, vals] = await Promise.all([idbReq(st.getAllKeys()), idbReq(st.getAll())]);
  return keys.map((k, i) => [k, vals[i]]);
}
async function idbReplace(s, entries) {
  const d = await db();
  await new Promise((res, rej) => {
    const tx = d.transaction(s, 'readwrite'), st = tx.objectStore(s);
    st.clear();
    for (const [k, v] of entries) st.put(v, k);
    tx.oncomplete = res;
    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error || new Error('abort'));
  });
}
const dataBlob = async url => (await fetch(url)).blob();
const okPhoto = p => typeof p === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p);

// photos: JPEG blobs in IndexedDB, shown through object URLs read once into memory
const photoURLs = new Map(), badPhotos = new Set();
let photosIn = false;
const photoOf = it => (it && it.photo && !badPhotos.has(it.id) && (photoURLs.get(it.id) || photoURLs.get(splitMade.get(it.id)))) || '';
async function loadPhotos() {
  try {
    const all = await idbAll('photos');
    for (const u of photoURLs.values()) URL.revokeObjectURL(u);
    photoURLs.clear();
    for (const [k, b] of all) if (b instanceof Blob) photoURLs.set(k, URL.createObjectURL(b));
  } catch (e) {}
  photosIn = true;
}
async function putPhoto(id, blob) {
  await idbPut('photos', id, blob);
  if (photoURLs.has(id)) URL.revokeObjectURL(photoURLs.get(id));
  photoURLs.set(id, URL.createObjectURL(blob));
  announce('photos');
}
async function delPhoto(id) {
  try { await idbDel('photos', id); } catch (e) {}
  if (photoURLs.has(id)) URL.revokeObjectURL(photoURLs.get(id));
  photoURLs.delete(id);
  announce('photos');
}
async function photoBlob(id) { try { return await idbGet('photos', id); } catch (e) { return null; } }
// an item just split by size has its photo in the old item's place until it is copied
const itemPhoto = async it => (await photoBlob(it.id)) || (splitMade.has(it.id) ? await photoBlob(splitMade.get(it.id)) : null);
// once the copy taken on an update is made: each item split by size gets its own copy of the old item's photo, the
// split is saved and the old photo goes. When a photo can't be copied (the phone is full) nothing is saved, and the
// next start tries again; till then the photo shows from its old place.
async function finishSplit() {
  if (!splitMade.size) return;
  try {
    for (const [to, from] of splitMade) {
      const it = byId(to);
      if (it && it.photo && !(await photoBlob(to))) { const b = await photoBlob(from); if (b) await idbPut('photos', to, b); }
    }
  } catch (e) { noteTrouble('photo'); return; }
  // what couldn't be read is kept aside and saved over only by the family's own changes
  if (!broken.size && save('items', items)) {
    save('history', hist); saveCart();
    for (const from of new Set(splitMade.values())) if (!byId(from)) { try { await idbDel('photos', from); } catch (e) {} }
  }
  splitMade.clear();
  announce('photos');
}
// a list kept from before a catalog of starting items gets that catalog's new items once, each at the end of its
// genre, so no row the parent knows moves within it. Left out: a name the list has already, and one taken off in the
// last 30 days (it is in the bin). Nothing is added to data that couldn't be read.
async function addNewItems() {
  const had = +load('catalog', 1) || 1;
  if (broken.size || had >= CATALOG) return;
  const have = new Set(items.map(it => nameKey(it.name)));
  try { for (const t of await trashList()) if (t.item) have.add(nameKey(t.item.name)); } catch (e) {}
  const add = freshItems(had).filter(it => !have.has(nameKey(it.name)));
  if (add.length) {
    items.push(...add);
    // when it can't be saved, the next start tries again
    if (!save('items', items)) return;
  }
  // 1.22: and the sets that came since, made of the items now on the list (a list with no sets yet gets all of them
  // at start)
  if (sets) { addNewSets(had); if (!save('sets', sets)) return; }
  save('catalog', CATALOG);
}
// photos saved by 1.3 and before sit in localStorage as data URLs; they move to IndexedDB once, one by one
async function movePhotos() {
  const keys = [];
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(KEY + 'photo:')) keys.push(k); } } catch (e) { return; }
  for (const k of keys) {
    const data = localStorage.getItem(k);
    try {
      if (okPhoto(data)) await idbPut('photos', k.slice(KEY.length + 6), await dataBlob(data));
      localStorage.removeItem(k);
    } catch (e) { return; }
  }
}

/* ---------- other windows ---------- */
// the home-screen app and a Chrome tab share this storage: when another window saves, this one reads it back
// and redraws, instead of writing its old copy over the new one
const chan = 'BroadcastChannel' in window ? new BroadcastChannel('kaimono') : null;
function announce(what) { try { if (chan) chan.postMessage(what); } catch (e) {} }
window.addEventListener('storage', e => {
  if (e.key === null) { location.reload(); return; }
  if (!e.key.startsWith(KEY)) return;
  const name = e.key.slice(KEY.length);
  if (name === 'cart') cart = fixCart(load('cart', null));
  else if (name === 'items') {
    items = loadItems() || items;
    seen.items = localStorage.getItem(e.key);
    // a window still on 1.9 saved an item with sizes
    if (splitMade.size) { statsFor(items, splitMade); finishSplit().then(loadPhotos).then(redraw); }
  }
  else if (name === 'history') { hist = loadHist(); seen.history = localStorage.getItem(e.key); }
  else if (name === 'settings') { settings = loadSettings(); applySize(); }
  else if (name === 'sets') sets = loadSets();
  else if (name === 'pending') pending = load('pending', null);
  else return;
  // what this window could not save is now what the other window saved
  if (unsaved.delete(name)) paintSaveBar();
  redraw();
});
if (chan) chan.onmessage = async e => {
  if (e.data === 'wiped' || e.data === 'reload') { location.reload(); return; }
  if (e.data === 'photos') { await loadPhotos(); redraw(); }
};
function redraw() {
  if (!$('#settings').hidden) renderSettings(); else renderHome();
  if (isOpen('sh-confirm')) renderConfirm();
}

/* ---------- items and the cart ---------- */
const byId = id => items.find(it => it.id === id);
const inGroup = key => items.filter(it => it.group === key);
const stepOf = it => it.unit === 'g' ? 100 : 1;
// how many of an item are on the list: the cart keeps an amount under each item's id
const qtyIn = (it, c = cart) => c.lines[it.id] || 0;
const cartCount = () => items.filter(it => qtyIn(it) > 0).length + cart.extras.length;
function change(it, dir) {
  const step = stepOf(it);
  const q = Math.max(0, Math.min(qtyIn(it) + dir * step, 99 * step));
  if (q) cart.lines[it.id] = q; else delete cart.lines[it.id];
  saveCart(); buzz();
}
const qtyHTML = (it, q) => `<b>${q}</b><small>${esc(it.unit)}</small>`;
function picHTML(it, cls = '', photo) {
  const p = photo === undefined ? photoOf(it) : photo;
  if (p) return `<span class="pic ${cls}"><img src="${esc(p)}" alt=""${photo === undefined ? ` data-pid="${esc(it.id)}"` : ''}></span>`;
  // until the photos are read in at start, a photo's place stays empty rather than flashing the drawing
  if (photo === undefined && it.photo && !photosIn) return `<span class="pic ${cls}" aria-hidden="true"></span>`;
  const d = PIC[it.icon];
  if (d) return `<span class="pic lu h-${d[2]} ${cls}" aria-hidden="true">${svgOf(d[3])}</span>`;
  return `<span class="pic ini ${cls}" aria-hidden="true">${esc([...(it.name || '？')][0])}</span>`;
}
// a stored photo that turns out to be damaged gives way to the item's drawing, and the family is told
document.addEventListener('error', e => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || !img.dataset.pid) return;
  badPhotos.add(img.dataset.pid);
  noteTrouble('photo');
  const it = byId(img.dataset.pid), pic = img.closest('.pic');
  if (it && pic) pic.outerHTML = picHTML(it, [...pic.classList].filter(c => c === 'sm' || c === 'big').join(' '));
}, true);
const notePic = (cls = '', icon = 'notebook-pen') => `<span class="pic memo ${cls}" aria-hidden="true">${ic(icon)}</span>`;
const VOICE_LABEL = '声の メッセージ';
const secText = s => `${Math.max(1, Math.round(s))}びょう`;
const hasVoice = (c = cart) => c.extras.some(x => x.voice);

/* ---------- dates ---------- */
const md = ts => { const d = new Date(ts); return `${d.getMonth() + 1}月${d.getDate()}日`; };
const hm = ts => { const d = new Date(ts); return `${d.getHours()}時${String(d.getMinutes()).padStart(2, '0')}分`; };
function ago(ts) {
  const a = new Date(); a.setHours(0, 0, 0, 0);
  const b = new Date(ts); b.setHours(0, 0, 0, 0);
  const days = Math.round((a - b) / DAY);
  if (days <= 0) return 'きょう';
  if (days === 1) return 'きのう';
  if (days < 14) return `${days}日まえ`;
  if (days < 60) return `${Math.floor(days / 7)}週間まえ`;
  return `${Math.floor(days / 30)}か月まえ`;
}

/* ---------- snackbar ---------- */
let toastTimer = 0;
function toast(msg, actLabel, act, ms) {
  const t = $('#toast');
  t.innerHTML = '<span class="tmsg"></span>' + (actLabel ? '<button type="button" class="tact sl"></button>' : '')
    + `<button type="button" class="tclose icon-btn sl" aria-label="とじる">${ic('x')}</button>`;
  $('.tmsg', t).textContent = msg;
  if (actLabel) {
    const b = $('.tact', t);
    b.textContent = actLabel;
    b.onclick = () => { hideToast(); act(); };
  }
  $('.tclose', t).onclick = hideToast;
  // hidden and shown again, so the rise-in plays for each new message
  t.classList.remove('two');
  t.hidden = true; void t.offsetWidth; t.hidden = false;
  if (actLabel) {
    const r = document.createRange();
    r.selectNodeContents($('.tmsg', t));
    if (new Set([...r.getClientRects()].map(x => Math.round(x.top))).size > 1) t.classList.add('two');
  }
  clearTimeout(toastTimer);
  // older readers need time: ten seconds, fifteen when there is something to undo, or until × is pressed;
  // ms for a message that should go sooner
  toastTimer = setTimeout(hideToast, ms || (actLabel ? 15000 : 10000));
}
function hideToast() { $('#toast').hidden = true; }

/* ---------- layers: sheets, dialogs and the settings page, each one step of the back button ---------- */
// Android's back gesture closes the top sheet instead of leaving the app
const layers = [];
let popWaiters = [];
history.scrollRestoration = 'manual';
function pushLayer(name, onClose) {
  layers.push({ name, onClose, from: document.activeElement, at: performance.now() });
  history.pushState({ kaimono: layers.length }, '');
}
function popLayer() {
  return new Promise(res => {
    if (!layers.length) { res(); return; }
    popWaiters.push(res);
    history.back();
  });
}
window.addEventListener('popstate', () => {
  const l = layers.pop();
  if (l) {
    l.onClose();
    if (l.from && document.contains(l.from) && !l.from.closest('[hidden]')) { try { l.from.focus({ preventScroll: true }); } catch (e) {} }
  }
  const w = popWaiters; popWaiters = [];
  w.forEach(f => f());
});
const isOpen = name => layers.some(l => l.name === name);
const sheetsOpen = () => layers.some(l => l.name.startsWith('sh-'));
function openSheet(id) {
  if (isOpen(id)) return;
  const el = $('#' + id);
  el.style.zIndex = 40 + layers.length;
  el.hidden = false;
  document.documentElement.classList.add('lock');
  el.getBoundingClientRect();
  el.classList.add('open');
  (el.querySelector('.sheet-body') || el.querySelector('.sheet') || el.querySelector('.drawer-panel')).scrollTop = 0;
  pushLayer(id, () => {
    el.classList.remove('open');
    el.hidden = true;
    if (!sheetsOpen()) document.documentElement.classList.remove('lock');
    el.dispatchEvent(new Event('closed'));
  });
  const h = $('h2', el) || $('.nm', el);
  if (h) { h.setAttribute('tabindex', '-1'); try { h.focus({ preventScroll: true }); } catch (e) {} }
}
const closeSheet = () => popLayer();
// the second tap of a trembling double tap must not close what the first one has just opened
const justOpened = () => layers.length > 0 && performance.now() - layers[layers.length - 1].at < 400;
document.addEventListener('click', e => { if (e.target.closest('[data-close]') && !justOpened()) closeSheet(); });

// gate: the safe answer is the filled button and comes first, and the other one has to be held for 1.5 seconds
function ask(title, text, okLabel, noLabel = 'やめる', { danger = false, gate = false, one = false } = {}) {
  return new Promise(res => {
    let answered = false;
    $('#askTitle').textContent = title;
    $('#askText').textContent = text;
    const ok = $('#askOk'), no = $('#askNo'), sh = $('#sh-ask');
    ok.textContent = okLabel; no.textContent = noLabel;
    no.hidden = one;
    ok.className = 'btn big sl ' + (gate ? (danger ? 'outlined danger-o' : 'outlined') : danger ? 'danger' : 'filled');
    no.className = 'btn big sl ' + (gate ? 'filled' : 'outlined');
    sh.classList.toggle('gate', gate);
    // one answer only: a second one would close whatever lies under the question
    const answer = v => async () => { if (answered) return; answered = true; await closeSheet(); res(v); };
    ok.onpointerdown = ok.onpointerup = ok.onpointercancel = ok.onpointerleave = null;
    if (gate) holdToConfirm(ok, 1500, answer(true), danger ? 'けすときは' : 'ひらくときは'); else ok.onclick = answer(true);
    no.onclick = answer(false);
    sh.addEventListener('closed', () => { if (!answered) res(false); }, { once: true });
    openSheet('sh-ask');
  });
}
// a parent who presses the coloured button out of habit stays where they were: this one opens only after a hold
function holdToConfirm(btn, ms, done, when) {
  let timer = 0, fired = false;
  btn.classList.add('hold');
  btn.style.setProperty('--hold', ms + 'ms');
  btn.onpointerdown = () => {
    fired = false;
    clearTimeout(timer);
    btn.classList.add('holding');
    timer = setTimeout(() => {
      btn.classList.remove('holding');
      // the question may have been closed with the back button while the finger was still down
      if (btn.closest('[hidden]')) return;
      fired = true; buzz(); done();
    }, ms);
  };
  btn.onpointerup = btn.onpointercancel = btn.onpointerleave = () => { clearTimeout(timer); btn.classList.remove('holding'); };
  btn.onclick = e => {
    if (fired) return;
    // Enter or the space bar has no hold to give
    if (e.detail === 0) { done(); return; }
    toast(`${when}、ボタンを 押したまま 2びょう まって ください。`);
  };
}

/* ---------- home ---------- */
const groupsEl = $('#groups');
let shownDay = new Date().toDateString();
function renderHome() {
  shownDay = new Date().toDateString();
  renderExtras();
  renderSets();
  const frag = document.createDocumentFragment();
  for (const g of GROUPS) {
    const list = inGroup(g.key);
    if (!list.length) continue;
    const sec = document.createElement('section');
    // the genre menu takes the list here
    sec.id = 'g-' + g.key;
    sec.dataset.g = g.key;
    sec.innerHTML = `<h2 class="gh">${g.label}</h2><ul class="rows"></ul>`;
    const ul = sec.lastElementChild;
    list.forEach(it => ul.appendChild(rowEl(it, g)));
    frag.appendChild(sec);
  }
  groupsEl.replaceChildren(frag);
  $('#emptyItems').hidden = items.length > 0;
  renderBar();
}
function rowEl(it, g) {
  const li = document.createElement('li');
  li.className = 'row';
  li.dataset.id = it.id;
  const subs = [];
  if (it.note) subs.push(`<span class="sub">${esc(it.note)}</span>`);
  if (g.showLast && it.lastAt) subs.push(`<span class="sub last">前回 ${ago(it.lastAt)}</span>`);
  const nm = esc(it.name);
  li.innerHTML = `<button type="button" class="hit sl" tabindex="-1" aria-hidden="true"></button>`
    + `<span class="picbox">${picHTML(it)}<span class="selmark">${ic('check')}</span></span>`
    + `<span class="txt"><span class="nm">${nm}</span>${subs.join('')}</span>`
    + `<span class="step"><button type="button" class="minus icon-btn sl" aria-label="${nm}を へらす">${ic('minus')}</button>`
    + `<span class="n"></span><button type="button" class="plus icon-btn sl" aria-label="${nm}を ふやす">${ic('plus')}<span class="pl">入れる</span></button></span>`;
  paintRow(li, it);
  return li;
}
function paintRow(li, it) {
  const q = qtyIn(it), on = q > 0;
  li.classList.toggle('sel', on);
  const minus = $('.minus', li), n = $('.n', li);
  minus.hidden = n.hidden = !on;
  n.innerHTML = on ? qtyHTML(it, q) : '';
}
// a trembling finger can land twice in a row; a second tap on the same button within 350 ms is dropped
let lastTap = { el: null, t: 0 };
function tooFast(el) {
  const t = performance.now(), fast = lastTap.el === el && t - lastTap.t < 350;
  lastTap = { el, t };
  return fast;
}
// a touch on the row itself only points at the buttons: looking at a row, or starting to scroll, never adds anything
function nudge(li) {
  const p = $('.plus', li);
  if (p) { p.classList.remove('nudge'); void p.offsetWidth; p.classList.add('nudge'); }
  // the words go after a second, as the family asked (1.12); the ＋ moving shows where to press
  toast(li.classList.contains('sel') ? '数を かえるときは、−・＋ を 押してください。' : '入れるときは「＋ 入れる」を 押してください。', '', null, 1000);
}
groupsEl.addEventListener('click', e => {
  const b = e.target.closest('button');
  const li = b && b.closest('.row');
  const it = li && byId(li.dataset.id);
  if (!it || tooFast(b)) return;
  if (b.classList.contains('hit')) { nudge(li); return; }
  if (b.classList.contains('minus')) { change(it, -1); paintRow(li, it); renderBar(); return; }
  change(it, 1);
  paintRow(li, it);
  renderBar();
});

function renderExtras() {
  $('#extrasSec').hidden = !cart.extras.length;
  $('#extrasList').innerHTML = cart.extras.map(x => {
    const name = x.voice ? VOICE_LABEL : x.text;
    return `<li class="row sel" data-x="${esc(x.id)}"><span class="picbox">${notePic('', x.voice ? 'mic' : 'notebook-pen')}</span>`
      + `<span class="txt"><span class="nm">${esc(name)}</span>${x.voice ? `<span class="sub">${secText(x.sec)}</span>` : ''}</span><span class="step">`
      + (x.voice ? `<button type="button" class="play icon-btn sl" aria-label="${VOICE_LABEL}を 聞く">${ic('play')}</button>` : '')
      + `<button type="button" class="del btn outlined sl" aria-label="${esc(name)}を けす">${ic('trash-2')}けす</button></span></li>`;
  }).join('');
}
$('#extrasList').addEventListener('click', async e => {
  const b = e.target.closest('.del, .play');
  if (!b) return;
  const id = b.closest('[data-x]').dataset.x;
  const i = cart.extras.findIndex(x => x.id === id);
  if (i < 0) return;
  const x = cart.extras[i];
  if (b.classList.contains('play')) {
    if (playing && playing.btn === b) { stopPlay(); return; }
    const blob = await clipGet(id);
    if (blob) playBlob(blob, b, ic('play'), ic('square')); else toast('声が 見つかりませんでした。');
    return;
  }
  stopPlay();
  cart.extras.splice(i, 1);
  saveCart(); renderExtras(); renderBar();
  // a recording stays in IndexedDB until no list refers to it, so もとに もどす can bring it back
  toast(`${x.voice ? VOICE_LABEL : `「${x.text}」`}を けしました`, 'もとに もどす', () => { cart.extras.splice(i, 0, x); saveCart(); renderExtras(); renderBar(); });
  setTimeout(pruneClips, 16000);
});

/* ---------- セット: the items of a set go into the list with one press (1.21) ---------- */
// each item goes in at the set's amount, and one in at that amount or more already stays as it is, so pressing again
// (or a trembling second press) adds nothing
const setPic = (cls = '') => `<span class="pic lu h-orange ${cls}" aria-hidden="true">${svgOf(PIC['cooking-pot'][3])}</span>`;
// an amount the family set, fitted to the item's unit as it is now (g goes by 100)
const setQty = (it, q) => { const s = stepOf(it); return Math.min(Math.max(Math.round(q / s) * s, s), 99 * s); };
// a set's items still on the list, with their amounts
const setItems = s => s.lines.map(l => ({ it: byId(l.id), qty: l.qty })).filter(x => x.it).map(x => ({ it: x.it, qty: setQty(x.it, x.qty) }));
// (a name and its amount, or the two words of a name like 牛乳 1L, never part at the end of a line)
const setLabel = ({ it, qty }) => it.name.replace(/ /g, '\u00a0') + (it.unit === 'g' || qty > 1 ? `\u00a0${qty}${it.unit}` : '');
const setIn = s => { const xs = setItems(s); return xs.length > 0 && xs.every(x => qtyIn(x.it) >= x.qty); };
// 1.22: the parent's screen has one row for them, which opens the sets (twenty rows would push the items far down,
// a screen's height for each at 特大)
function renderSets() {
  const list = (sets || []).filter(s => setItems(s).length);
  $('#g-set').hidden = !list.length;
  const names = list.slice(0, 3).map(s => s.name).join('・') + (list.length > 3 ? ` など ${list.length}こ` : '');
  $('#setOpen').innerHTML = `<li class="row setrow setopen"><button type="button" class="hit sl" tabindex="-1" aria-hidden="true"></button>`
    + `<span class="picbox">${setPic()}</span><span class="txt"><span class="nm">料理を えらぶ</span></span><span class="sub">${esc(names)}</span>`
    + `<span class="step"><button type="button" class="open btn tonal sl" aria-haspopup="dialog" aria-controls="sh-sets" aria-label="料理を えらぶ（${esc(names)}）">ひらく${ic('chevron-right')}</button></span></li>`;
  $('#setList').innerHTML = list.map(s => `<li class="row setrow" data-set="${esc(s.id)}"><button type="button" class="hit sl" tabindex="-1" aria-hidden="true"></button>`
    + `<span class="picbox">${setPic()}<span class="selmark">${ic('check')}</span></span>`
    + `<span class="txt"><span class="nm">${esc(s.name)}</span></span><span class="sub">${esc(setItems(s).map(setLabel).join('・'))}</span>`
    + `<span class="step"><button type="button" class="put btn sl"></button></span></li>`).join('');
}
// a set whose items are all in looks like a picked row
function paintSets() {
  for (const li of $$('#setList [data-set]')) {
    const s = (sets || []).find(x => x.id === li.dataset.set), on = !!s && setIn(s), b = $('.put', li);
    li.classList.toggle('sel', on);
    b.innerHTML = on ? `${ic('check')}入っています` : `${ic('plus')}ぜんぶ 入れる`;
    if (s) b.setAttribute('aria-label', on ? `${s.name}は ぜんぶ 入っています` : `${s.name}の 品物を ぜんぶ 入れる`);
  }
}
function putSet(s) {
  const before = [];
  for (const { it, qty } of setItems(s)) {
    const q = qtyIn(it);
    if (q >= qty) continue;
    before.push([it, q]);
    cart.lines[it.id] = qty;
  }
  if (!before.length) { toast(`「${s.name}」の 品物は、もう ぜんぶ 入って います。`, '', null, 4000); return; }
  saveCart(); buzz();
  for (const [it] of before) { const li = $(`#groups [data-id="${CSS.escape(it.id)}"]`); if (li) paintRow(li, it); }
  renderBar();
  // short, so it covers little of the screen at 特大: the set's row (now picked) and its line already name the items
  toast(`${s.name}の 品物を ${before.length}こ 入れました。`, 'もとに もどす', () => {
    for (const [it, q] of before) { if (q) cart.lines[it.id] = q; else delete cart.lines[it.id]; }
    saveCart(); renderHome();
  });
}
// a touch anywhere on the row opens them: nothing goes in until a set's own button is pressed
const openSets = () => { paintSets(); openSheet('sh-sets'); };
$('#setOpen').addEventListener('click', e => { if (e.target.closest('button')) openSets(); });
$('#setList').addEventListener('click', e => {
  const b = e.target.closest('button');
  const li = b && b.closest('[data-set]');
  const s = li && (sets || []).find(x => x.id === li.dataset.set);
  // the second tap of a trembling double tap on the row that opened them may land on a set's button
  if (!s || tooFast(b) || justOpened()) return;
  if (b.classList.contains('hit')) {
    const p = $('.put', li);
    p.classList.remove('nudge'); void p.offsetWidth; p.classList.add('nudge');
    toast(li.classList.contains('sel') ? '数を かえるときは、とじてから 品物の −・＋ を 押してください。' : '入れるときは「＋ ぜんぶ 入れる」を 押してください。', '', null, 1000);
    return;
  }
  putSet(s);
});

function renderBar() {
  const n = cartCount();
  $('#sendBtn').setAttribute('aria-disabled', n ? 'false' : 'true');
  $('#sendN').hidden = !n;
  $('#sendN').textContent = n;
  paintSets();
}
const bar = $('#bar');
new ResizeObserver(() => { if (bar.offsetHeight) document.documentElement.style.setProperty('--barH', bar.offsetHeight + 'px'); }).observe(bar);

/* ---------- ジャンル: a drawer from the top left; each genre takes the list to its place ---------- */
// a drawing for each genre, from the item pictures
const NAV_PICS = { staple: 'wheat', veg: 'carrot', fruit: 'apple', meat: 'beef', fish: 'fish', chilled: 'egg', season: 'cooking-pot', snack: 'cookie',
  deli: 'egg-fried', dry: 'can', food: 'utensils', drink: 'coffee', daily: 'spray-can', other: 'package' };
const appbar = $('#appbar');
// the top bar stays at the top, and takes the bottom bar's colour once the list goes under it
const liftBar = () => appbar.classList.toggle('lifted', window.scrollY > 2);
addEventListener('scroll', liftBar, { passive: true });
function renderNav() {
  // the genre now at the top of the screen is marked, so the parent sees where they are
  const below = appbar.getBoundingClientRect().bottom + 40;
  let cur = '';
  for (const sec of $$('#g-set:not([hidden]), #groups section')) if (sec.getBoundingClientRect().top <= below) cur = sec.dataset.g;
  // the sets (1.21) come first, as on the screen
  const list = [...($('#g-set').hidden ? [] : [{ key: 'set', label: 'セット', pic: setPic() }]), ...GROUPS.filter(g => inGroup(g.key).length).map(g => {
    const [, , hue, d] = PIC[NAV_PICS[g.key]];
    return { ...g, pic: `<span class="pic lu h-${hue}" aria-hidden="true">${svgOf(d)}</span>` };
  })];
  $('#navList').innerHTML = list.length ? list.map(g => `<li><button type="button" class="navitem sl" data-g="${g.key}"${g.key === cur ? ' aria-current="true"' : ''}>`
    + `${g.pic}<span class="nl">${g.label}</span></button></li>`).join('') : '<li class="note">品物が ありません。</li>';
}
$('#navBtn').addEventListener('click', () => {
  renderNav();
  openSheet('sh-nav');
  // with many genres the list scrolls: the one marked as where the parent is comes into view
  const cur = $('#navList [aria-current]');
  if (cur) cur.scrollIntoView({ block: 'nearest' });
  $('#navBtn').setAttribute('aria-expanded', 'true');
});
$('#sh-nav').addEventListener('closed', () => $('#navBtn').setAttribute('aria-expanded', 'false'));
$('#navList').addEventListener('click', async e => {
  const b = e.target.closest('[data-g]');
  if (!b || justOpened()) return;
  await closeSheet();
  jumpTo(b.dataset.g);
  // セット opens the sets too, over the top of the list where their row is
  if (b.dataset.g === 'set') openSets();
});
// the genre's heading comes up at once just under the top bar (no gliding past rows on the way), and takes the focus
// (for a screen reader)
function jumpTo(key) {
  const h = $(`#g-${key} .gh`);
  if (!h) return;
  const top = h.getBoundingClientRect().top + window.scrollY - appbar.offsetHeight - 8;
  window.scrollTo(0, Math.max(0, top));
  liftBar();
  h.tabIndex = -1;
  try { h.focus({ preventScroll: true }); } catch (e) {}
}

/* ---------- 声で たのむ ---------- */
// LINE's own voice messages can only be recorded inside LINE, so the parent's voice is recorded here and goes to LINE
// as a sound file next to the list. It is WAV, which every phone plays (the family's iPhone included).
const canRecord = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
const VOICE_MAX = 60;
const REC_ERRORS = {
  NotAllowedError: 'マイクが 許可されていません。ご家族に「設定」の「ためしに 録音してみる」を 押してもらって ください。',
  NotFoundError: 'マイクが 見つかりませんでした。',
  NotReadableError: 'マイクを 使えませんでした。ほかの アプリを 閉じてから、もういちど 押して ください。',
};

// recordings wait in IndexedDB until they are sent, so closing the app does not lose them
const clipPut = (id, blob) => idbPut('clips', id, blob);
async function clipGet(id) { try { return await idbGet('clips', id); } catch (e) { return null; } }
async function clipDel(id) { try { await idbDel('clips', id); } catch (e) {} }
// recordings that no list refers to any more (sent, or taken out and not brought back) are thrown away
async function pruneClips() {
  try {
    const keep = new Set([...cart.extras, ...(pending ? fixCart(pending.cart).extras : [])].filter(x => x.voice).map(x => x.id));
    for (const k of await idbKeys('clips')) if (!keep.has(k)) await clipDel(k);
  } catch (e) {}
}
// a recording never sent is not kept for ever: after VOICE_DAYS it leaves the list and the phone
async function dropOldVoices() {
  if (!clockOK) return;
  const cut = Date.now() - VOICE_DAYS * DAY;
  const old = cart.extras.filter(x => x.voice && x.at < cut);
  if (!old.length) return;
  cart.extras = cart.extras.filter(x => !old.includes(x));
  saveCart();
  toast(`${VOICE_DAYS}日 送らなかった ${VOICE_LABEL}を けしました。`);
  await pruneClips();
  redraw();
}

// the browser decodes the recording, mixes it down to one 16 kHz channel (plenty for a voice) and it is written as WAV
async function toWav(blob) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  let audio;
  try { audio = await ctx.decodeAudioData(await blob.arrayBuffer()); } finally { ctx.close().catch(() => {}); }
  const rate = 16000;
  const off = new OfflineAudioContext(1, Math.max(1, Math.ceil(audio.duration * rate)), rate);
  const src = off.createBufferSource();
  src.buffer = audio; src.connect(off.destination); src.start();
  const f = (await off.startRendering()).getChannelData(0);
  const pcm = new Int16Array(f.length);
  for (let i = 0; i < f.length; i++) { const v = Math.max(-1, Math.min(1, f[i])); pcm[i] = v < 0 ? v * 0x8000 : v * 0x7fff; }
  return { blob: wavOf([pcm]), sec: audio.duration };
}
function wavOf(parts, rate = 16000) {
  const n = parts.reduce((s, p) => s + p.length, 0);
  const h = new DataView(new ArrayBuffer(44));
  const str = (o, s) => { for (let i = 0; i < s.length; i++) h.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); h.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
  h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, 1, true); h.setUint32(24, rate, true);
  h.setUint32(28, rate * 2, true); h.setUint16(32, 2, true); h.setUint16(34, 16, true);
  str(36, 'data'); h.setUint32(40, n * 2, true);
  return new Blob([h, ...parts], { type: 'audio/wav' });
}
// several recordings go as one file, with a short pause between them
async function joinWavs(blobs) {
  const gap = new Int16Array(9600);
  const parts = [];
  for (const [i, b] of blobs.entries()) { if (i) parts.push(gap); parts.push(new Int16Array((await b.arrayBuffer()).slice(44))); }
  return wavOf(parts);
}

let recorder = null;
function watchLevel(stream, bar) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const an = ctx.createAnalyser();
    an.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(an);
    const data = new Uint8Array(an.fftSize);
    let raf = 0;
    const tick = () => {
      an.getByteTimeDomainData(data);
      let peak = 0;
      for (const v of data) peak = Math.max(peak, Math.abs(v - 128));
      bar.style.width = Math.min(100, peak * 1.6) + '%';
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); ctx.close().catch(() => {}); bar.style.width = '0'; };
  } catch (e) { return () => {}; }
}
async function recStart({ bar, onTick, onMax }) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  const mr = new MediaRecorder(stream);
  const r = { stream, mr, chunks: [], t0: Date.now() };
  mr.ondataavailable = e => { if (e.data && e.data.size) r.chunks.push(e.data); };
  r.stopped = new Promise(res => { mr.onstop = res; });
  r.unwatch = bar ? watchLevel(stream, bar) : () => {};
  r.timer = setInterval(() => { const s = (Date.now() - r.t0) / 1000; if (onTick) onTick(s); if (s >= VOICE_MAX && onMax) onMax(); }, 250);
  mr.start(250);
  recorder = r;
}
// gives { blob, sec } as WAV, or null when nothing (or under 0.7 seconds) was recorded
async function recStop(discard) {
  const r = recorder;
  if (!r) return null;
  recorder = null;
  clearInterval(r.timer);
  r.unwatch();
  if (r.mr.state !== 'inactive') { r.mr.stop(); await r.stopped; }
  r.stream.getTracks().forEach(t => t.stop());
  if (discard || !r.chunks.length || Date.now() - r.t0 < 700) return null;
  return toWav(new Blob(r.chunks, { type: r.mr.mimeType || 'audio/webm' }));
}

// one player for every 聞く button
const player = new Audio();
let playing = null;
function playBlob(blob, btn, idleHTML, busyHTML) {
  stopPlay();
  const url = URL.createObjectURL(blob);
  playing = { btn, url, idleHTML };
  btn.innerHTML = busyHTML;
  player.src = url;
  player.play().catch(() => stopPlay());
}
function stopPlay() {
  if (!playing) return;
  player.pause();
  URL.revokeObjectURL(playing.url);
  playing.btn.innerHTML = playing.idleHTML;
  playing = null;
}
player.addEventListener('ended', stopPlay);

// the sheet: press to record, press again to finish, listen back, then put it on the list
const REC_IDLE = `${ic('mic')}<span>押して 録音する</span>`;
const recBusy = s => `<span class="dot"></span><span>おわる（${secText(s)}）</span>`;
const playIdle = sec => `${ic('play')}<span>聞いてみる（${secText(sec)}）</span>`;
const PLAY_BUSY = `${ic('square')}<span>とめる</span>`;
let voiceTake = null, voiceBusy = false;
const voiceSay = m => { $('#voiceMsg').textContent = m; };
function voiceState(state) {
  const rb = $('#recBtn');
  rb.hidden = state === 'done' || state === 'nomic';
  rb.classList.toggle('on', state === 'rec');
  if (state !== 'rec') rb.innerHTML = REC_IDLE;
  $('#recLevel').hidden = state !== 'rec';
  $('#recDone').hidden = state !== 'done';
  if (state === 'done') $('#recPlay').innerHTML = playIdle(voiceTake.sec);
}
$('#voiceBtn').addEventListener('click', () => {
  voiceTake = null;
  $('#voiceText').value = '';
  $('#typeBox').hidden = canRecord;
  $('#typeToggle').hidden = !canRecord;
  voiceState(canRecord ? 'idle' : 'nomic');
  voiceSay(canRecord ? '下の ボタンを 押して、ほしいものを 話して ください。話し おわったら、もう一度 押します。'
    : 'この スマホでは 録音できません。下に 文字で 入れて ください。');
  openSheet('sh-voice');
});
async function recordToggle() {
  if (voiceBusy) return;
  if (recorder) { await finishTake(); return; }
  voiceBusy = true;
  stopPlay();
  try {
    await recStart({ bar: $('#recLevel span'), onTick: s => { $('#recBtn').innerHTML = recBusy(s); }, onMax: () => finishTake('1ぷん たったので、録音を おわりました。') });
  } catch (e) {
    voiceSay(REC_ERRORS[e && e.name] || '録音を はじめられませんでした。');
    $('#typeBox').hidden = false;
    $('#typeToggle').hidden = true;
    return;
  } finally { voiceBusy = false; }
  voiceState('rec');
  $('#recBtn').innerHTML = recBusy(0);
  voiceSay('録音中です。話し おわったら、上の ボタンを 押して ください。');
  buzz();
}
async function finishTake(note) {
  if (voiceBusy || !recorder) return;
  voiceBusy = true;
  voiceSay('まとめています…');
  let take = null;
  try { take = await recStop(); } catch (e) { take = null; }
  voiceBusy = false;
  if (!take) { voiceState('idle'); voiceSay('声が 入りませんでした。もういちど 押して、話して ください。'); return; }
  voiceTake = take;
  voiceState('done');
  voiceSay(note || '録音 できました。「聞いてみる」で たしかめて、よければ「リストに 入れる」を 押して ください。');
  buzz();
}
// a second, trembling tap must not stop the recording it has just started
$('#recBtn').addEventListener('click', e => { if (!tooFast(e.currentTarget)) recordToggle(); });
$('#recPlay').addEventListener('click', () => {
  if (playing) { stopPlay(); return; }
  if (voiceTake) playBlob(voiceTake.blob, $('#recPlay'), playIdle(voiceTake.sec), PLAY_BUSY);
});
$('#recAgain').addEventListener('click', () => { stopPlay(); voiceTake = null; voiceState('idle'); recordToggle(); });
$('#typeToggle').addEventListener('click', () => { $('#typeBox').hidden = false; $('#typeToggle').hidden = true; $('#voiceText').focus(); });
function stopVoice() { stopPlay(); if (recorder) recStop(true); }
$('#sh-voice').addEventListener('closed', stopVoice);
$('#voiceAdd').addEventListener('click', async () => {
  if (recorder) await finishTake();
  const t = $('#voiceText').value.replace(/\s+/g, ' ').trim();
  if (!voiceTake && !t) { voiceSay(canRecord ? 'まだ 録音して いません。上の ボタンを 押して、話して ください。' : 'まだ 何も 入って いません。'); return; }
  stopPlay();
  const added = [];
  if (voiceTake) {
    const id = uid();
    try { await clipPut(id, voiceTake.blob); }
    catch (e) { voiceSay('声を 保存できませんでした。スマホの 空きが 足りないかもしれません。'); return; }
    cart.extras.push({ id, voice: true, sec: Math.round(voiceTake.sec * 10) / 10, at: Date.now() });
    added.push(VOICE_LABEL);
  }
  if (t) { cart.extras.push({ id: uid(), text: t.slice(0, 200) }); added.push(`「${t}」`); }
  voiceTake = null;
  saveCart();
  await closeSheet();
  renderHome();
  $('#extrasSec').scrollIntoView({ block: 'center' });
  toast(`${added.join('と ')}を 入れました`);
});

/* ---------- 送る ---------- */
function buildText(c = cart) {
  const out = [`🛒 かいものリスト（${md(Date.now())}）`];
  const itemLines = [];
  for (const g of GROUPS) for (const it of inGroup(g.key)) {
    const q = qtyIn(it, c);
    if (q) itemLines.push(`・${it.name}${it.note ? `（${it.note}）` : ''} ${q}${it.unit}`);
  }
  out.push(...itemLines);
  const texts = c.extras.filter(x => !x.voice);
  if (texts.length) {
    if (itemLines.length) out.push('', 'ほかに');
    texts.forEach(x => out.push(`・${x.text}`));
  }
  if (hasVoice(c)) out.push('', '🎤 声の メッセージも あります（いっしょに 届いた 音声ファイルを 押すと 聞けます）');
  if (c.when) out.push('', `いつ：${c.when}`);
  return out.join('\n');
}
const lineURL = text => 'https://line.me/R/share?text=' + encodeURIComponent(text);
$('#sendBtn').addEventListener('click', () => {
  if (!cartCount()) { toast('先に、ほしいものの「＋ 入れる」を 押してください。'); return; }
  renderConfirm();
  openSheet('sh-confirm');
});
function renderConfirm() {
  const rows = [];
  for (const g of GROUPS) for (const it of inGroup(g.key)) {
    const q = qtyIn(it);
    if (q) rows.push(`<li>${picHTML(it, 'sm')}<span class="cn">${esc(it.name)}${it.note ? `<small>${esc(it.note)}</small>` : ''}</span><span class="cq">${qtyHTML(it, q)}</span></li>`);
  }
  cart.extras.forEach(x => rows.push(x.voice
    ? `<li>${notePic('sm', 'mic')}<span class="cn">${VOICE_LABEL}<small>${secText(x.sec)}・音声ファイルで 送ります</small></span></li>`
    : `<li>${notePic('sm')}<span class="cn">${esc(x.text)}</span></li>`));
  $('#clist').innerHTML = rows.join('');
  renderWhen();
  renderSteps();
  prepareVoice();
}
// navigator.share has to get the file at the moment of the tap, so it is put together as soon as the sheet opens
let voiceFile = null, voiceFileFor = '';
async function prepareVoice() {
  const ids = cart.extras.filter(x => x.voice).map(x => x.id), key = ids.join(',');
  if (key === voiceFileFor && (voiceFile || !ids.length)) return;
  voiceFile = null; voiceFileFor = key;
  if (!ids.length) return;
  const blobs = (await Promise.all(ids.map(clipGet))).filter(Boolean);
  if (voiceFileFor !== key || !blobs.length) return;
  voiceFile = new File([await joinWavs(blobs)], `声のメッセージ（${md(Date.now())}）.wav`, { type: 'audio/wav' });
}
// LINE's own screens are new to the parent, so the sheet says beforehand what to press there, with the name to look for
function renderSteps() {
  const who = settings.to ? `「${esc(settings.to)}」を 押す` : '送る相手を 押す';
  // a recording can only go through the phone's share menu (the LINE link carries text alone)
  const viaShare = hasVoice();
  const steps = viaShare ? ['「LINE」を 押す', who, '「送信」を 押す'] : [who, '「送信」を 押す'];
  $('#stepsT').textContent = viaShare ? 'つぎの 画面で：' : 'LINEが ひらいたら：';
  $('#steps').innerHTML = steps.map((s, i) => `<li><b>${i + 1}</b>${s}</li>`).join('');
}
function chipHTML(on, attr, label) {
  return `<button type="button" class="chip sl${on ? ' on' : ''}" aria-pressed="${on}" ${attr}>${on ? ic('check') : ''}${label}</button>`;
}
function renderWhen() {
  $('#whenChips').innerHTML = WHEN.map(w => chipHTML(cart.when === w, `data-w="${w}"`, w)).join('');
  $('#lineSend').href = lineURL(buildText());
}
$('#whenChips').addEventListener('click', e => {
  const b = e.target.closest('[data-w]');
  if (!b) return;
  cart.when = cart.when === b.dataset.w ? '' : b.dataset.w;
  saveCart(); renderWhen(); buzz();
});

// whether the message really went out is only known to the parent, so the app asks once they come back
let wentAway = false, askTimer = 0;
function markPending(text) {
  // the list is kept (the message text says the same in more words, so it isn't)
  pending = { at: Date.now(), cart: clone(cart) };
  save('pending', pending);
  wentAway = false;
  clearTimeout(askTimer);
  // if LINE never opened, the question still comes
  askTimer = setTimeout(() => { if (pending && !wentAway && document.visibilityState === 'visible') askSent(); }, 4000);
}
function clearPending() { pending = null; drop('pending'); clearTimeout(askTimer); }
function shareNow(data, text) {
  markPending(text);
  navigator.share(data).then(() => {
    setTimeout(() => { if (pending && document.visibilityState === 'visible') askSent(); }, 500);
  }).catch(err => {
    clearPending();
    toast(err && err.name === 'AbortError' ? '送るのを やめました。' : '送れませんでした。もういちど 押してください。');
  });
}
$('#lineSend').addEventListener('click', e => {
  const text = buildText();
  if (hasVoice()) {
    e.preventDefault();
    if (!voiceFile) { toast('声を 用意しています。もういちど 押して ください。'); prepareVoice(); return; }
    const data = { files: [voiceFile], text };
    if (!navigator.canShare || !navigator.canShare(data)) { toast('この スマホでは 声を いっしょに 送れません。声を けして、文字で 送って ください。'); return; }
    shareNow(data, text);
    return;
  }
  e.currentTarget.href = lineURL(text);
  markPending(text);
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { hiddenAt = Date.now(); if (pending) wentAway = true; return; }
  if (isOpen('settings')) {
    if (hiddenAt && Date.now() - hiddenAt > SET_AWAY && hiddenAt - outsideAt > 5000) leaveSettings();
    else setTouch = Date.now();
  }
  dropOldVoices();
  maybeWeekCopy();
  if (pending && wentAway) { wentAway = false; setTimeout(askSent, 300); }
  else if (new Date().toDateString() !== shownDay && $('#settings').hidden && !sheetsOpen()) renderHome();
});
async function askSent() {
  if (!pending || isOpen('sh-sent')) return;
  clearTimeout(askTimer);
  while (layers.length && layers[layers.length - 1].name !== 'settings') await popLayer();
  if (!pending || isOpen('sh-sent')) return;
  openSheet('sh-sent');
}
let sentAnswered = false;
$('#sh-sent').addEventListener('closed', () => {
  // closed with the back button: treated as not sent, the list stays
  if (!sentAnswered) { clearPending(); toast('リストは そのまま 残っています。'); }
  sentAnswered = false;
});
$('#sentYes').addEventListener('click', async () => { sentAnswered = true; await closeSheet(); markSent(); });
$('#sentNo').addEventListener('click', async () => { sentAnswered = true; await closeSheet(); clearPending(); toast('リストは そのまま 残っています。'); });
function markSent() {
  const c = pending ? fixCart(pending.cart) : cart;
  const now = Date.now();
  const lines = [];
  for (const g of GROUPS) for (const it of inGroup(g.key)) { const q = qtyIn(it, c); if (q) lines.push({ id: it.id, name: it.name, size: '', unit: it.unit, qty: q }); }
  const before = { cart: clone(cart), hist: hist.slice(), stats: items.map(it => [it.id, it.count, it.lastAt]) };
  // a recording is never kept in the history
  hist.unshift({ at: now, lines, extras: c.extras.filter(x => !x.voice).map(x => x.text), when: c.when });
  trimHist();
  save('history', hist);
  const ids = new Set(lines.map(l => l.id));
  items.forEach(it => { if (ids.has(it.id)) { it.count++; it.lastAt = now; } });
  syncStats();
  save('items', items);
  cart = fixCart(null);
  saveCart();
  clearPending();
  renderHome();
  window.scrollTo(0, 0);
  setTimeout(pruneClips, 16000);
  toast('送りました。おつかれさまでした。', 'もとに もどす', () => {
    cart = fixCart(before.cart); saveCart();
    hist = before.hist; save('history', hist);
    before.stats.forEach(([id, count, lastAt]) => { const it = byId(id); if (it) { it.count = count; it.lastAt = lastAt; } });
    save('items', items);
    renderHome();
  });
}
$('#clearAll').addEventListener('click', async () => {
  if (!(await ask('ぜんぶ けしますか？', 'えらんだものが 空に なります。', 'ぜんぶ けす', 'やめる', { danger: true }))) return;
  const before = clone(cart);
  cart = fixCart(null);
  saveCart(); clearPending();
  await closeSheet();
  renderHome();
  setTimeout(pruneClips, 16000);
  toast('ぜんぶ けしました。', 'もとに もどす', () => { cart = fixCart(before); saveCart(); renderHome(); });
});

/* ---------- 設定 ---------- */
let homeScroll = 0;
$('#openSettings').addEventListener('click', async () => {
  if (await ask('ご家族用の 設定です', '品物の 登録や、送り方の 設定を します。ご家族の方は「ひらく」を 押したまま 2びょう まって ください。', 'ひらく（押したまま）', 'もどる', { gate: true }) && await pinOK()) openSettings();
});
/* ---------- この スマホの チェック: what this phone can do, tried on the spot, nothing kept ---------- */
$('#selfCheck').addEventListener('click', async () => {
  const out = [];
  // the advice shows only for what isn't working
  const row = (ok, name, hint = '') => out.push(`<li class="${ok === true ? 'ok' : ok === false ? 'ng' : 'mid'}"><b>${ok === true ? '○' : ok === false ? '×' : '△'} ${name}</b>${hint && ok !== true ? `<small>${hint}</small>` : ''}</li>`);
  const tryIt = async f => { try { return !!(await f()); } catch (e) { return false; } };
  $('#checkList').innerHTML = '<li><b>ためして います…</b></li>';
  row(!PLACE, 'いつもの ブラウザで ひらいて いる', PLACE ? 'LINE の 中などでは データが 別に なります。ホーム画面の アイコンから ひらいて ください。' : '');
  row(await tryIt(async () => { localStorage.setItem(KEY + 'selftest', '1'); const ok = localStorage.getItem(KEY + 'selftest') === '1'; localStorage.removeItem(KEY + 'selftest'); return ok; }), '品物や 記録を 保存できる', 'スマホの 空きを ふやして ください。');
  row(await tryIt(async () => { await idbPut('snaps', 'selftest', { at: Date.now() }); const ok = !!(await idbGet('snaps', 'selftest')); await idbDel('snaps', 'selftest'); return ok; }), '写真・録音・控えを 保存できる', 'スマホの 空きを ふやして ください。');
  row(await tryIt(async () => { const c = document.createElement('canvas'); c.width = c.height = 8; const b = await new Promise(r => c.toBlob(r, 'image/jpeg')); (await createImageBitmap(b)).close(); return true; }), '写真を 小さく して 保存できる');
  const shareOK = await tryIt(async () => navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.txt', { type: 'text/plain' })] }));
  row(shareOK || null, '共有メニューで ファイルを 渡せる', shareOK ? '' : '声の メッセージは 送れません。文字で 送って ください。');
  let mic = canRecord ? 'prompt' : 'none';
  try { if (canRecord && navigator.permissions) mic = (await navigator.permissions.query({ name: 'microphone' })).state; } catch (e) {}
  row(mic === 'granted' ? true : mic === 'denied' || mic === 'none' ? false : null, '声を 録音できる',
    mic === 'granted' ? '' : mic === 'denied' ? 'Chrome の「サイトの 設定」で マイクを 許可して ください。' : mic === 'none' ? 'この ブラウザでは 録音できません。' : 'はじめて 録音する ときに「許可」を 押して ください。');
  const kept = await tryIt(async () => navigator.storage && navigator.storage.persisted && navigator.storage.persisted());
  row(kept || null, 'データが 消えにくく なって いる', kept ? '' : '「データの 扱い」の 下の「消えにくく する」を 押して ください。');
  let room = null;
  try { const est = await navigator.storage.estimate(); room = est.quota ? est.quota - est.usage : null; } catch (e) {}
  row(room == null ? null : room > 50 * 1048576, 'スマホの 空きが じゅうぶん ある', room != null && room <= 50 * 1048576 ? 'いらない 写真や アプリを けして、空きを ふやして ください。' : '');
  row(clockOK, 'スマホの 時計が 合って いる', clockOK ? '' : 'スマホの 設定で 日付と 時刻を 合わせて ください。');
  $('#checkList').innerHTML = out.join('');
});

/* ---------- the family's PIN (kept apart from the copies, so going back to one never brings it back) ---------- */
const PIN_ITER = 200000;
async function pinHash(v, salt, iter) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(v), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: unb64(salt), iterations: iter, hash: 'SHA-256' }, base, 256));
}
// asked after the hold when one is set; five wrong tries wait a minute
// wrong tries are kept (pinTry), so opening the app again starts no fresh count; from the fifth, each one waits
// twice as long as the last (1 minute, 2, 4 … up to a day)
async function pinOK() {
  const pin = load('pin', null);
  if (!pin || !pin.hash) return true;
  for (let text = '設定の 暗証番号を 入れて ください。'; ;) {
    const t = load('pinTry', { fails: 0, until: 0 });
    if (Date.now() < t.until) { toast(`まちがいが 続いたので、${Math.ceil((t.until - Date.now()) / 60000)}分 ほど 待ってから ためして ください。`); return false; }
    const v = await askPass('暗証番号', text, false);
    if (v == null) return false;
    if (await pinHash(v, pin.salt, pin.iter || PIN_ITER) === pin.hash) { drop('pinTry'); return true; }
    const fails = (+t.fails || 0) + 1;
    save('pinTry', { fails, until: fails >= 5 ? Date.now() + Math.min(60000 * 2 ** (fails - 5), DAY) : 0 });
    text = '暗証番号が ちがいます。もう一度 入れて ください。';
  }
}
function paintPin() {
  const on = !!load('pin', null);
  $('#pinState').textContent = on
    ? 'つけて います。設定を ひらく ときに 聞きます。忘れると、Chrome の 設定で この サイトの データを けす ほか なく、品物や 写真も 消えます。'
    : 'つけると、設定を ひらく ときに 暗証番号を 聞きます（親の 画面は 今までどおり）。スマホを ほかの 人が さわる ことが あるときに。';
  $('.lbl', $('#pinSet')).textContent = on ? '暗証番号を かえる' : '暗証番号を つける';
  $('#pinOff').hidden = !on;
}
$('#pinSet').addEventListener('click', async () => {
  const v = await askPass('暗証番号を きめて ください', '設定を ひらく ときに 聞きます。忘れると データを ぜんぶ けす ことに なるので、紙に 書いて しまって おいて ください。', true);
  if (v == null) return;
  const salt = b64(crypto.getRandomValues(new Uint8Array(16)));
  save('pin', { salt, iter: PIN_ITER, hash: await pinHash(v, salt, PIN_ITER) });
  paintPin();
  toast('暗証番号を つけました。');
});
$('#pinOff').addEventListener('click', async () => {
  if (!(await ask('暗証番号を はずしますか？', '設定を ひらく ときに、暗証番号を 聞かなく なります。', 'はずす'))) return;
  drop('pin');
  paintPin();
  toast('暗証番号を はずしました。');
});
function openSettings() {
  homeScroll = window.scrollY;
  renderSettings();
  $('#home').hidden = bar.hidden = true;
  $('#settings').hidden = false;
  document.documentElement.classList.add('insettings');
  window.scrollTo(0, 0);
  pushLayer('settings', () => {
    stopVoice();
    testRecReset();
    $('#settings').hidden = true;
    document.documentElement.classList.remove('insettings');
    $('#home').hidden = bar.hidden = false;
    renderHome();
    window.scrollTo(0, homeScroll);
    clearInterval(setTimer);
  });
  setTouch = Date.now();
  clearInterval(setTimer);
  setTimer = setInterval(() => {
    if (document.visibilityState === 'visible' && Date.now() - setTouch > (sheetsOpen() ? SET_IDLE_SHEET : SET_IDLE)) leaveSettings();
  }, 15000);
}
// the family may hand the phone back with this page still open: untouched for three minutes (ten in a sheet), or
// back after more than a minute away, it returns to the parent's screen; a picker, the share menu or LINE taking
// the page away for a while is the family at work, not the phone handed back
const SET_IDLE = 3 * 60000, SET_IDLE_SHEET = 10 * 60000, SET_AWAY = 60000;
let setTouch = 0, setTimer = 0, hiddenAt = 0, outsideAt = 0, quietClose = false;
['pointerdown', 'keydown', 'input', 'scroll', 'wheel'].forEach(t => document.addEventListener(t, () => { setTouch = Date.now(); }, { capture: true, passive: true }));
document.addEventListener('click', e => {
  if (e.target.closest && e.target.closest('input[type=file],#testSend,#testVoiceSend,#photoTake,#fPhoto')) outsideAt = Date.now();
}, true);
async function leaveSettings() {
  if (!isOpen('settings')) return;
  quietClose = true;
  while (isOpen('settings')) await popLayer();
  quietClose = false;
}
$('#closeSettings').addEventListener('click', () => popLayer());

function sline(it) {
  const a = [it.unit];
  if (it.note) a.push(it.note);
  a.push(it.lastAt ? `前回 ${md(it.lastAt)}・${it.count}回` : 'まだ たのまれていない');
  return a.join('／');
}
function renderSettings() {
  $('#sItems').innerHTML = GROUPS.filter(g => g.key !== 'food' || inGroup('food').length).map(g => {
    const list = inGroup(g.key);
    const rows = list.map((it, i) => `<li class="srow" data-id="${esc(it.id)}"><button type="button" class="sedit sl">${picHTML(it, 'sm')}`
      + `<span class="stx"><b>${esc(it.name)}</b><small>${esc(sline(it))}</small></span></button><span class="mv">`
      + `<button type="button" class="up icon-btn sl" aria-label="${esc(it.name)}を 上へ"${i === 0 ? ' disabled' : ''}>${ic('arrow-up')}</button>`
      + `<button type="button" class="down icon-btn sl" aria-label="${esc(it.name)}を 下へ"${i === list.length - 1 ? ' disabled' : ''}>${ic('arrow-down')}</button></span></li>`).join('');
    return `<section class="sgrp"><h3>${g.label}<span>${list.length}こ</span></h3>${list.length ? `<ul class="slist">${rows}</ul>` : '<p class="note">まだ ありません。</p>'}</section>`;
  }).join('');
  renderSetList();
  renderRecent();
  setSeg('#sizeSeg', settings.size);
  $('#toName').value = settings.to || '';
  $('#testSend').href = lineURL(TEST_TEXT);
  $('#recNote').textContent = canRecord
    ? '親が 話した 声を 録音して、LINE に 音声ファイルとして 送ります。はじめて 録音するとき「マイクの 使用を 許可しますか？」と 出たら「許可」を 押して ください。ここで いちど 録音して、「この声を ためしに 送る」で LINE に 文と 声の ファイルが 両方 届くか たしかめて おくと 安心です。'
    : 'この ブラウザでは 録音できません。Android の Chrome で ひらいて ください。';
  $('#testRec').hidden = !canRecord;
  if (!recorder) $('#testRec').innerHTML = TEST_REC;
  const keepText = settings.keep === 'one' ? 'いちばん 新しい 1回分だけ 残します。' : `${settings.keep === 'month' ? '1か月' : '3か月'}より 前の ものは 自動で けします。`;
  $('#histState').textContent = (hist.length ? `送った 記録：${hist.length}回分（${md(hist[hist.length - 1].at)}から）。` : '送った 記録は ありません。') + keepText;
  $('#factKeep').textContent = `送った記録は ${settings.keep === 'one' ? '1回分だけ 残し' : settings.keep === 'month' ? '1か月' : '3か月'}、送らなかった 録音は 7日で、自動で けします。`;
  setSeg('#keepSeg', settings.keep);
  setSeg('#copyDaysSeg', String(settings.copyDays || 60));
  $('#factCopies').textContent = `この スマホの 中には、自動の 控え（週の 控え 3つと、新しく なる 前の 控え 2つ。${settings.copyDays || 60}日まで）、けした 品物（30日）も 残ります。「送った記録を けす」は 控えの 中の 記録も けします。「データを ぜんぶ けす」は これらも ぜんぶ けします。`;
  paintPin();
  paintTrouble();
  $('#clearHist').hidden = !hist.length && !items.some(it => it.count || it.lastAt);
  renderUsage();
  paintPersist();
  paintTrash();
  paintCopies();
  paintBroken();
  $('#clockNote').hidden = clockOK;
}
// how much the app keeps (IndexedDB included), and the recordings still waiting to be sent
async function renderUsage() {
  let clips = [];
  try { clips = await idbAll('clips'); } catch (e) {}
  const kb = Math.max(1, Math.round(clips.reduce((s, [, b]) => s + ((b && b.size) || 0), 0) / 1024));
  // IndexedDB and the offline copy, plus this app's localStorage (about 2 bytes a character)
  let used = '';
  try {
    let b = (await navigator.storage.estimate()).usage || 0;
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(KEY)) b += (k.length + (localStorage.getItem(k) || '').length) * 2; }
    used = b < 1048576 ? `約 ${Math.max(1, Math.round(b / 1024))} KB` : `約 ${(b / 1048576).toFixed(1)} MB`;
  } catch (e) {}
  $('#usage').textContent = `この スマホで 使っている 量：${used || 'わかりません'}（写真 ${photoURLs.size}まい・録音 ${clips.length}件）`;
  $('#voiceState').textContent = (clips.length ? `いま 残っている 録音：${clips.length}件（約 ${kb}KB）。` : 'いま 残っている 録音は ありません。')
    + `送らなかった 録音は ${VOICE_DAYS}日で 自動で けします。`;
  $('#clearVoices').hidden = !clips.length;
}
// whether the browser has promised not to clear this storage when the phone runs short of space
async function paintPersist() {
  const note = $('#persistNote'), btn = $('#persistBtn');
  if (!navigator.storage || !navigator.storage.persisted) { note.hidden = btn.hidden = true; return; }
  const on = await navigator.storage.persisted().catch(() => false);
  note.hidden = false;
  note.textContent = on ? '消えにくく する 設定：有効です（スマホの 空きが 少なく なっても、この データは 消されません）。'
    : '消えにくく する 設定：まだ 有効では ありません。「消えにくく する」を 押すと、有効に なる ことが あります。';
  btn.hidden = on;
}
$('#persistBtn').addEventListener('click', async () => {
  const on = await navigator.storage.persist().catch(() => false);
  paintPersist();
  toast(on ? '消えにくく しました。' : 'いまは 有効に できませんでした。しばらく 使ってから、もう一度 ためして ください。');
});
function setSeg(sel, v) { $$(sel + ' button').forEach(b => { const on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); }
$('#sizeSeg').addEventListener('click', e => {
  const b = e.target.closest('[data-v]');
  if (!b) return;
  settings.size = b.dataset.v;
  save('settings', settings); applySize(); setSeg('#sizeSeg', settings.size);
});
// the preview shows an item name at the size the parent's rows will use (1.2rem of 20, 23 or 26px)
const SIZE_PX = { m: 20, l: 23, xl: 26 };
function applySize() {
  const s = SIZE_PX[settings.size] ? settings.size : 'm';
  document.documentElement.dataset.size = s;
  $('#sizePrev').style.fontSize = Math.round(SIZE_PX[s] * 1.2) + 'px';
}
$('#keepSeg').addEventListener('click', async e => {
  const b = e.target.closest('[data-v]');
  if (!b || b.dataset.v === settings.keep) return;
  const before = settings.keep;
  settings.keep = b.dataset.v;
  const gone = hist.length - keptHist(hist).length;
  if (gone > 0 && !(await ask('送った 記録を へらしますか？', `${gone}回分の 記録を けします。この スマホの 中の 控えに ある 記録も、同じように けします。`, 'けす', 'やめる', { danger: true }))) { settings.keep = before; setSeg('#keepSeg', before); return; }
  save('settings', settings);
  trimHist();
  scrubHistory(keptHist, settings.keep === 'three' ? 'keep' : 'sync');
  renderSettings();
});
$('#copyDaysSeg').addEventListener('click', async e => {
  const b = e.target.closest('[data-v]');
  if (!b || +b.dataset.v === +settings.copyDays) return;
  const days = +b.dataset.v;
  const gone = (await copiesList().catch(() => [])).filter(c => clockOK && Date.now() - c.at > days * DAY).length;
  if (gone && !(await ask('控えを へらしますか？', `${days}日より 前の 控え（${gone}つ）を けします。`, 'けす', 'やめる', { danger: true }))) return;
  settings.copyDays = days;
  save('settings', settings);
  await pruneCopies().catch(() => {});
  renderSettings();
});
$('#toName').addEventListener('input', e => { settings.to = e.target.value.trim().slice(0, 20); save('settings', settings); });
const TEST_TEXT = 'かいものメモの ためしです。\nこれが 届いたら、送り方は だいじょうぶです。';
// the family's check: record, hear it back, and send it once to see how LINE receives the list and the sound file
const TEST_REC = `${ic('mic')}<span>ためしに 録音してみる</span>`;
let testTake = null, testBusy = false;
const testSay = m => { $('#testRecMsg').textContent = m; };
function testRecReset() {
  $('#testRec').classList.remove('on');
  $('#testRec').innerHTML = TEST_REC;
}
$('#testRec').addEventListener('click', async () => {
  const btn = $('#testRec');
  if (testBusy) return;
  testBusy = true;
  try {
    if (recorder) {
      testRecReset();
      testSay('まとめています…');
      testTake = await recStop().catch(() => null);
      if (!testTake) { testSay('声が 入りませんでした。もういちど ためして ください。'); return; }
      testSay(`録音 できました（${secText(testTake.sec)}）。聞こえるか たしかめて ください。`);
      $('#testRecDone').hidden = false;
      playBlob(testTake.blob, $('#testRecPlay'), playIdle(testTake.sec), PLAY_BUSY);
      return;
    }
    stopPlay();
    try { await recStart({ onTick: s => { btn.innerHTML = recBusy(s); }, onMax: () => btn.click() }); }
    catch (e) { testSay(REC_ERRORS[e && e.name] || '録音を はじめられませんでした。'); return; }
    btn.classList.add('on');
    btn.innerHTML = recBusy(0);
    testSay('録音中です。なにか 話して、もう一度 押して ください。');
  } finally { testBusy = false; }
});
$('#testRecPlay').addEventListener('click', () => {
  if (playing) { stopPlay(); return; }
  if (testTake) playBlob(testTake.blob, $('#testRecPlay'), playIdle(testTake.sec), PLAY_BUSY);
});
$('#testVoiceSend').addEventListener('click', () => {
  if (!testTake) return;
  const data = { files: [new File([testTake.blob], 'ためしの声.wav', { type: 'audio/wav' })], text: TEST_TEXT + '\n🎤 声の ファイルも いっしょに 届いて いれば、声の 送り方も だいじょうぶです。' };
  if (!navigator.canShare || !navigator.canShare(data)) { toast('この スマホでは 声を 送れません。'); return; }
  navigator.share(data).catch(() => {});
});

$('#sItems').addEventListener('click', e => {
  const b = e.target.closest('button');
  const row = b && b.closest('[data-id]');
  const it = row && byId(row.dataset.id);
  if (!it) return;
  if (b.classList.contains('sedit')) { openEdit(it); return; }
  const up = b.classList.contains('up');
  const list = inGroup(it.group), i = list.indexOf(it), j = up ? i - 1 : i + 1;
  if (j < 0 || j >= list.length) return;
  const a = items.indexOf(it), c = items.indexOf(list[j]);
  [items[a], items[c]] = [items[c], items[a]];
  save('items', items);
  renderSettings();
  const nb = $(`#sItems [data-id="${CSS.escape(it.id)}"] .${up ? 'up' : 'down'}`);
  if (nb && !nb.disabled) nb.focus();
});
$('#sortFreq').addEventListener('click', () => {
  const before = items.slice();
  for (const g of GROUPS) {
    const list = inGroup(g.key);
    const slots = list.map(it => items.indexOf(it));
    const sorted = list.slice().sort((x, y) => (y.count - x.count) || (list.indexOf(x) - list.indexOf(y)));
    slots.forEach((s, k) => { items[s] = sorted[k]; });
  }
  save('items', items);
  renderSettings();
  toast('よく 頼む順に ならべました。', 'もとに もどす', () => { items = before; save('items', items); renderSettings(); });
});

/* ---------- セット in 設定: made, changed and taken away by the family ---------- */
function renderSetList() {
  const list = sets || [];
  $('#sSets').innerHTML = list.length ? list.map((s, i) => {
    const xs = setItems(s);
    return `<li class="srow" data-set="${esc(s.id)}"><button type="button" class="sedit sl">${setPic('sm')}`
      + `<span class="stx"><b>${esc(s.name)}</b><small>${xs.length ? esc(xs.map(setLabel).join('・')) : '品物が ありません（親の 画面には 出ません）'}</small></span></button><span class="mv">`
      + `<button type="button" class="up icon-btn sl" aria-label="${esc(s.name)}を 上へ"${i === 0 ? ' disabled' : ''}>${ic('arrow-up')}</button>`
      + `<button type="button" class="down icon-btn sl" aria-label="${esc(s.name)}を 下へ"${i === list.length - 1 ? ' disabled' : ''}>${ic('arrow-down')}</button></span></li>`;
  }).join('') : '<li class="srow empty">まだ ありません。</li>';
}
$('#sSets').addEventListener('click', e => {
  const b = e.target.closest('button');
  const row = b && b.closest('[data-set]');
  const i = row && sets ? sets.findIndex(s => s.id === row.dataset.set) : -1;
  if (i < 0) return;
  if (b.classList.contains('sedit')) { openSetEdit(sets[i]); return; }
  const up = b.classList.contains('up'), j = up ? i - 1 : i + 1;
  if (j < 0 || j >= sets.length) return;
  [sets[i], sets[j]] = [sets[j], sets[i]];
  save('sets', sets);
  renderSetList();
  const nb = $(`#sSets [data-set="${CSS.escape(sets[j].id)}"] .${up ? 'up' : 'down'}`);
  if (nb && !nb.disabled) nb.focus();
});
// the set being made or changed, saved only with 保存する
let setDraft = null;
$('#addSet').addEventListener('click', () => openSetEdit(null));
function openSetEdit(s) {
  setDraft = s ? { id: s.id, name: s.name, lines: setItems(s).map(({ it, qty }) => ({ id: it.id, qty })) } : { id: uid(), name: '', lines: [] };
  $('#setEditTitle').textContent = s ? 'セットを なおす' : 'セットを ふやす';
  $('#setName').value = setDraft.name;
  $('#setDelete').hidden = !s;
  paintSetLines();
  openSheet('sh-set');
}
function paintSetLines() {
  const xs = setDraft.lines.map(l => ({ it: byId(l.id), qty: l.qty })).filter(x => x.it);
  $('#setLines').innerHTML = xs.length ? xs.map(({ it, qty }) => {
    const nm = esc(it.name);
    return `<li class="setline" data-id="${esc(it.id)}">${picHTML(it, 'sm')}<span class="lnm">${nm}</span><span class="q">`
      + `<button type="button" class="lminus icon-btn sl" aria-label="${nm}を へらす"${qty <= stepOf(it) ? ' disabled' : ''}>${ic('minus')}</button>`
      + `<span class="n">${qtyHTML(it, qty)}</span><button type="button" class="lplus icon-btn sl" aria-label="${nm}を ふやす"${qty >= 99 * stepOf(it) ? ' disabled' : ''}>${ic('plus')}</button></span>`
      + `<button type="button" class="ldel icon-btn sl" aria-label="${nm}を セットから はずす">${ic('x')}</button></li>`;
  }).join('') : '<li class="srow empty">まだ ありません。「品物を えらぶ」から 入れて ください。</li>';
}
$('#setLines').addEventListener('click', e => {
  const b = e.target.closest('button');
  const li = b && b.closest('[data-id]');
  const it = li && byId(li.dataset.id), i = it ? setDraft.lines.findIndex(l => l.id === it.id) : -1;
  if (i < 0) return;
  const cls = ['lplus', 'lminus'].find(c => b.classList.contains(c));
  if (cls) setDraft.lines[i].qty = setQty(it, setDraft.lines[i].qty + (cls === 'lplus' ? 1 : -1) * stepOf(it));
  else setDraft.lines.splice(i, 1);
  paintSetLines();
  // the focus stays where the finger was
  const nb = cls && $(`#setLines [data-id="${CSS.escape(it.id)}"] .${cls}`);
  (nb && !nb.disabled ? nb : $('#setPick')).focus();
});
// all the items, by genre, each picked or not with one press; a name can be looked for
$('#setPick').addEventListener('click', () => { $('#pickFind').value = ''; renderPick(); openSheet('sh-setpick'); });
function renderPick() {
  const on = new Set(setDraft.lines.map(l => l.id)), q = nameKey($('#pickFind').value);
  const html = GROUPS.map(g => {
    const list = inGroup(g.key).filter(it => !q || nameKey(it.name).includes(q));
    return list.length ? `<section class="sgrp"><h3>${g.label}</h3><ul class="slist">${list.map(it => `<li class="srow"><button type="button" class="sedit pick sl" data-id="${esc(it.id)}" aria-pressed="${on.has(it.id)}">`
      + `${picHTML(it, 'sm')}<span class="stx"><b>${esc(it.name)}</b></span><span class="pmark">${ic('check')}</span></button></li>`).join('')}</ul></section>` : '';
  }).join('');
  $('#pickList').innerHTML = html;
  $('#pickNone').hidden = !!html;
  paintPickCount();
}
const paintPickCount = () => { $('#pickCount').textContent = `えらんだ 品物：${setDraft.lines.length}こ`; };
$('#pickFind').addEventListener('input', renderPick);
$('#pickList').addEventListener('click', e => {
  const b = e.target.closest('[data-id]');
  const it = b && byId(b.dataset.id);
  if (!it) return;
  const i = setDraft.lines.findIndex(l => l.id === it.id);
  if (i < 0 && setDraft.lines.length >= MAX_SET_LINES) { toast(`1つの セットに 入る 品物は ${MAX_SET_LINES}こまで です。`); return; }
  if (i >= 0) setDraft.lines.splice(i, 1); else setDraft.lines.push({ id: it.id, qty: stepOf(it) });
  b.setAttribute('aria-pressed', i < 0);
  paintPickCount();
});
$('#sh-setpick').addEventListener('closed', paintSetLines);
$('#setSave').addEventListener('click', async () => {
  const name = $('#setName').value.trim();
  if (!name) { toast('なまえを 入れてください。'); $('#setName').focus(); return; }
  const lines = setDraft.lines.filter(l => byId(l.id));
  if (!lines.length) { toast('品物を 1つ 以上 えらんで ください。'); return; }
  if (!sets) sets = [];
  const s = fixSet({ ...setDraft, name, lines }), at = sets.findIndex(x => x.id === s.id);
  if (at < 0 && sets.length >= MAX_SETS) { toast(`セットは ${MAX_SETS}こまで です。`); return; }
  if (at >= 0) sets[at] = s; else sets.push(s);
  save('sets', sets);
  await closeSheet();
  renderSettings();
  toast(at < 0 ? `「${s.name}」を ふやしました。` : '保存しました。');
});
$('#setDelete').addEventListener('click', async () => {
  const s = (sets || []).find(x => x.id === setDraft.id);
  if (!s || !(await ask(`「${s.name}」を けしますか？`, '親の 画面から この セットが なくなります。品物は そのまま 残ります。', 'けす', 'やめる', { danger: true }))) return;
  await closeSheet();
  const i = sets.indexOf(s);
  if (i < 0) return;
  sets.splice(i, 1);
  save('sets', sets);
  renderSettings();
  toast(`「${s.name}」を けしました。`, 'もとに もどす', () => { sets.splice(Math.min(i, sets.length), 0, s); save('sets', sets); redraw(); });
});

function recentExtras() {
  const map = new Map();
  for (const h of hist) for (const t of h.extras) {
    const k = t.trim();
    if (!k || items.some(it => it.name === k)) continue;
    const m = map.get(k) || { text: k, times: 0, at: h.at };
    m.times++;
    map.set(k, m);
  }
  return [...map.values()].sort((a, b) => (b.times - a.times) || (b.at - a.at)).slice(0, 15);
}
function renderRecent() {
  const list = recentExtras();
  $('#sExtras').innerHTML = list.length
    ? list.map((x, i) => `<li class="srow"><span class="stx"><b>${esc(x.text)}</b><small>${x.times}回・前回 ${md(x.at)}</small></span><button type="button" class="btn tonal sl" data-i="${i}">ボタンにする</button></li>`).join('')
    : '<li class="srow empty">まだ ありません。</li>';
  $('#sExtras').onclick = e => { const b = e.target.closest('[data-i]'); if (b) openEdit(null, list[+b.dataset.i].text); };
}

/* ---------- item editor ---------- */
// copyOf: the item a new one is being made from (この品物を もとに ふやす), which it goes in right after
let editing = null, draft = null, copyOf = null;
$('#addItem').addEventListener('click', () => openEdit(null));
function openEdit(it, name = '') {
  editing = it;
  copyOf = null;
  dropPreview();
  draft = it ? { ...it }
    : { id: uid(), name, icon: '', unit: '個', group: 'food', note: '', photo: false, count: 0, lastAt: 0, gset: GSET };
  // newPhoto: a photo picked in this sheet, saved only with 保存する; preview: the picture the sheet shows
  draft.newPhoto = null;
  draft.preview = photoOf(it);
  draft.ownURL = false;
  draft.photo = !!draft.preview;
  $('#editTitle').textContent = it ? '品物を なおす' : '品物を ふやす';
  $('#fName').value = draft.name;
  $('#fNote').value = draft.note;
  $('#fDelete').hidden = $('#fCopyBox').hidden = !it;
  // a new item takes the first letter of its name for a picture, so adding one is only typing its name;
  // a drawing or a photo is picked when an item is opened again (なおす)
  $('#fPicT').textContent = it ? '絵・写真' : '絵';
  $('#fAutoNote').hidden = !!it;
  $('#fPhoto').hidden = $('#fPhotoHint').hidden = $('#fPics').hidden = !it;
  $('#fPics').innerHTML = `<button type="button" class="sl" data-p="" aria-label="絵なし（名前の 1文字目）" title="絵なし"><span class="ini"></span></button>`
    + PICS.map(([n, label, hue, d]) => `<button type="button" class="sl h-${hue}" data-p="${n}" aria-label="${label}" title="${label}">${svgOf(d)}</button>`).join('');
  paintEdit(); paintUnits(); paintGroup();
  openSheet('sh-edit');
  const grid = $('#fPics'), on = $('.on', grid);
  grid.scrollTop = on ? on.getBoundingClientRect().top - grid.getBoundingClientRect().top + grid.scrollTop - 8 : 0;
}
function paintEdit() {
  $('#fPicBox').innerHTML = picHTML({ ...draft, name: draft.name || '？' }, '', draft.photo ? draft.preview : '');
  $('#fNoPhoto').hidden = $('#fPhotoNote').hidden = !draft.photo;
  $('#fPics .ini').textContent = [...(draft.name || '？')][0];
  $$('#fPics button').forEach(b => { const on = b.dataset.p === draft.icon; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
}
function paintUnits() {
  $('#fUnits').innerHTML = UNITS.map(u => chipHTML(draft.unit === u, `data-u="${esc(u)}"`, esc(u))).join('');
  $('#fUnitOther').value = UNITS.includes(draft.unit) ? '' : draft.unit;
  $('#fUnitNote').hidden = draft.unit !== 'g';
}
function paintGroup() {
  $('#fGroup').innerHTML = GROUPS.map(g => chipHTML(draft.group === g.key, `data-g="${g.key}"`, g.label)).join('');
}
$('#fName').addEventListener('input', e => { draft.name = e.target.value.trim(); paintEdit(); });
$('#fPics').addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (b) { draft.icon = b.dataset.p; paintEdit(); } });
$('#fUnits').addEventListener('click', e => { const b = e.target.closest('[data-u]'); if (b) { draft.unit = b.dataset.u; paintUnits(); } });
$('#fUnitOther').addEventListener('input', e => {
  const v = e.target.value.trim();
  draft.unit = v || '個';
  if (v) $('#fUnits').innerHTML = UNITS.map(u => chipHTML(false, `data-u="${esc(u)}"`, esc(u))).join('');
  else paintUnits();
  $('#fUnitNote').hidden = draft.unit !== 'g';
});
$('#fGroup').addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (b) { draft.group = b.dataset.g; paintGroup(); } });
// another size or kind: the sheet becomes a new item with what it shows (picture, photo, unit, note, group), and the
// item it was opened for stays as it was saved
$('#fCopy').addEventListener('click', async () => {
  const from = editing;
  if (!from) return;
  const photo = draft.newPhoto || (draft.photo ? await itemPhoto(from) : null);
  editing = null; copyOf = from;
  Object.assign(draft, { id: uid(), name: $('#fName').value.trim(), note: $('#fNote').value.trim(), count: 0, lastAt: 0, newPhoto: photo, photo: !!photo });
  if (!photo) { dropPreview(); draft.preview = ''; }
  $('#editTitle').textContent = '品物を ふやす';
  $('#fDelete').hidden = $('#fCopyBox').hidden = true;
  paintEdit();
  const f = $('#fName');
  f.focus();
  f.setSelectionRange(f.value.length, f.value.length);
  toast('写しました。なまえを なおして、保存して ください。');
});
$('#fPhoto').addEventListener('click', () => $('#fPhotoFile').click());
// a preview made for a photo picked in the sheet is let go when the sheet closes or another photo is picked
function dropPreview() { if (draft && draft.ownURL) { URL.revokeObjectURL(draft.preview); draft.ownURL = false; } }
$('#sh-edit').addEventListener('closed', dropPreview);
$('#fNoPhoto').addEventListener('click', () => { dropPreview(); draft.photo = false; draft.newPhoto = null; draft.preview = ''; paintEdit(); });
$('#fPhotoFile').addEventListener('change', async e => {
  const f = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    const b = await shrink(f);
    dropPreview();
    Object.assign(draft, { newPhoto: b, preview: URL.createObjectURL(b), ownURL: true, photo: true });
    paintEdit();
  } catch (err) { toast('写真を 読みこめませんでした。'); }
});
// a square of 240px is enough for an 85px picture on a sharp screen, and keeps each photo near 12KB.
// Drawing it again also leaves behind what the camera wrote into the file, such as where it was taken.
function shrink(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      try {
        const S = 240, w = img.naturalWidth, h = img.naturalHeight, m = Math.min(w, h);
        const c = document.createElement('canvas');
        c.width = c.height = S;
        const x = c.getContext('2d');
        x.fillStyle = '#fff'; x.fillRect(0, 0, S, S);
        x.drawImage(img, (w - m) / 2, (h - m) / 2, m, m, 0, 0, S, S);
        c.toBlob(b => b ? res(b) : rej(new Error('blob')), 'image/jpeg', 0.8);
      } catch (e) { rej(e); }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('load')); };
    img.src = url;
  });
}
$('#fSave').addEventListener('click', async () => {
  const name = $('#fName').value.trim();
  if (!name) { toast('なまえを 入れてください。'); $('#fName').focus(); return; }
  if (copyOf && name === copyOf.name && $('#fNote').value.trim() === copyOf.note) { toast('もとの 品物と 同じ なまえです。なまえか くわしくを なおして ください。'); $('#fName').focus(); return; }
  draft.name = name;
  draft.note = $('#fNote').value.trim();
  try {
    if (draft.photo && draft.newPhoto) await putPhoto(draft.id, draft.newPhoto);
    if (!draft.photo && editing && editing.photo) await delPhoto(draft.id);
  } catch (e) { toast('写真を 保存できませんでした。スマホの 空きが 足りないかもしれません。'); return; }
  const { newPhoto, preview, ownURL, ...rest } = draft;
  const item = fixItem(rest);
  const at = editing ? items.indexOf(editing) : -1;
  if (at >= 0) items[at] = item;
  else if (copyOf && items.includes(copyOf)) items.splice(items.indexOf(copyOf) + 1, 0, item);
  else items.push(item);
  save('items', items);
  const isNew = !editing;
  await closeSheet();
  renderSettings();
  toast(isNew ? `「${item.name}」を ふやしました。` : '保存しました。');
});
$('#fDelete').addEventListener('click', async () => {
  const it = editing;
  if (!it) return;
  // (it stays in its sets, out of sight, so it is back in them if it comes back from けした 品物)
  // (たまねぎ is in seven of the starting sets: past three, how many)
  const named = (sets || []).filter(s => s.lines.some(l => l.id === it.id)).map(s => `「${s.name}」`);
  const inSets = named.length > 3 ? `${named.slice(0, 3).join('')}など ${named.length}つの セット` : named.join('');
  if (!(await ask(`「${it.name}」を けしますか？`, '親の 画面から この ボタンが なくなります。' + (inSets ? `${inSets}からも はずれます。` : ''), 'けす', 'やめる', { danger: true }))) return;
  await closeSheet();
  const idx = items.indexOf(it), photo = it.photo ? await itemPhoto(it) : null;
  const keys = Object.entries(cart.lines).filter(([k]) => k === it.id);
  // kept in けした 品物 for 30 days, photo and all, in case it was the wrong one
  try { await idbPut('snaps', 'trash:' + it.id, { at: Date.now(), item: clone(it), idx, photo }); } catch (e) { noteTrouble('trash'); }
  items.splice(idx, 1);
  delPhoto(it.id);
  keys.forEach(([k]) => { delete cart.lines[k]; });
  save('items', items); saveCart();
  renderSettings();
  toast(`「${it.name}」を けしました。`, 'もとに もどす', () => {
    idbDel('snaps', 'trash:' + it.id).catch(() => {});
    items.splice(Math.min(idx, items.length), 0, it);
    if (photo) putPhoto(it.id, photo).then(renderSettings, () => {});
    keys.forEach(([k, v]) => { cart.lines[k] = v; });
    save('items', items); saveCart();
    renderSettings();
  });
});

/* ---------- 写真で そろえる ---------- */
// the family photographs the real things one after another: a photo is clearer than any drawing
let photoQueue = [], photoAt = 0;
$('#photoAll').addEventListener('click', () => {
  const order = GROUPS.flatMap(g => inGroup(g.key));
  photoQueue = [...order.filter(it => !it.photo), ...order.filter(it => it.photo)].map(it => it.id);
  photoAt = 0;
  renderPhotoStep();
  openSheet('sh-photo');
});
function renderPhotoStep() {
  const it = byId(photoQueue[photoAt]);
  if (!it) { closeSheet().then(() => toast('写真を そろえ おわりました。')); return; }
  $('#photoCount').textContent = `${photoAt + 1} / ${photoQueue.length}（写真が まだのものから 出ます）`;
  $('#photoStep').innerHTML = `${picHTML(it, 'big')}<span class="nm">${esc(it.name)}</span>`;
  $('#photoTake .lbl').textContent = it.photo ? '写真を とりなおす' : '写真を とる';
  // once the photo is there, going on is the likely next step, so that button takes the colour
  $('#photoTake').className = 'btn big sl ' + (it.photo ? 'outlined' : 'filled');
  $('#photoNext').className = 'btn big sl ' + (it.photo ? 'filled' : 'outlined');
}
$('#photoTake').addEventListener('click', () => $('#photoFile').click());
$('#photoNext').addEventListener('click', () => { photoAt++; renderPhotoStep(); });
$('#photoFile').addEventListener('change', async e => {
  const f = e.target.files && e.target.files[0];
  e.target.value = '';
  const it = byId(photoQueue[photoAt]);
  if (!f || !it) return;
  let blob;
  try { blob = await shrink(f); } catch (err) { toast('写真を 読みこめませんでした。'); return; }
  try { await putPhoto(it.id, blob); } catch (err) { toast('写真を 保存できませんでした。スマホの 空きが 足りないかもしれません。'); return; }
  it.photo = true;
  save('items', items);
  renderPhotoStep();
  toast(`「${it.name}」の 写真を 保存しました。`);
});
$('#sh-photo').addEventListener('closed', () => renderSettings());

/* ---------- Chrome's own install banner ---------- */
// never shown: it would ask the parent about something they don't know
window.addEventListener('beforeinstallprompt', e => e.preventDefault());

/* ---------- asking for the PIN ---------- */
const b64 = buf => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
// twice when it is being set (4 to 8 digits), once to open 設定 (any length, so older ones still work);
// null when the family gives up
function askPass(title, text, twice) {
  return new Promise(res => {
    let done = false;
    const a = $('#passIn'), b = $('#passAgain'), msg = $('#passMsg');
    $('#passTitle').textContent = title;
    $('#passText').textContent = text;
    $('#passHint').textContent = twice ? '4〜8けたの 数字' : '';
    a.value = b.value = '';
    msg.textContent = '';
    $('#passAgainBox').hidden = !twice;
    $('#passOk').onclick = async () => {
      const p = a.value;
      const bad = !p ? '暗証番号を 入れて ください。' : twice && !/^\d{4,8}$/.test(p) ? '4〜8けたの 数字に して ください。' : '';
      if (bad) { msg.textContent = bad; return; }
      if (twice && p !== b.value) { msg.textContent = '2つの 暗証番号が ちがいます。'; return; }
      if (done) return;
      done = true;
      a.value = b.value = '';
      await closeSheet();
      res(p);
    };
    a.onkeydown = b.onkeydown = e => { if (e.key === 'Enter') $('#passOk').click(); };
    $('#sh-pass').addEventListener('closed', () => { a.value = b.value = ''; if (!done) { done = true; res(null); } }, { once: true });
    openSheet('sh-pass');
    setTimeout(() => { try { a.focus(); } catch (e) {} }, 60);
  });
}

// at start, what has had its time goes: items in the bin, unreadable data kept aside, old copies
async function pruneSnap() {
  try {
    // 1.17 and before kept, for a week, what there was before a file was read in; 1.18 reads no files
    await idbDel('snaps', 'beforeImport');
    if (clockOK) {
      for (const t of await trashList()) if (Date.now() - t.at > TRASH_DAYS * DAY) await idbDel('snaps', t.key);
      for (const b of await snapsOf('broken')) if (Date.now() - b.at > COPY_DAYS * DAY) await idbDel('snaps', b.key);
    }
    await pruneCopies();
  } catch (e) {}
}

/* ---------- automatic copies, and the items taken off the list ---------- */
// before a new version changes how things are kept, and once a week: what is stored, just as it is stored, so going
// back is putting it back and starting again; the newest three are kept, none longer than 60 days
const COPY_KEEP = 3, UPDATE_KEEP = 2, COPY_DAYS = 60, TRASH_DAYS = 30;
async function autoCopy(why, raw, from = '') {
  const photos = await idbAll('photos');
  const sig = photos.map(([k, b]) => k + ':' + ((b && b.size) || 0)).sort().join(',');
  await idbPut('snaps', 'auto:' + Date.now(), { at: Date.now(), why, from, to: APP_VER, ls: raw, photos, sig });
  await pruneCopies();
}
const snapsOf = async kind => (await idbAll('snaps')).filter(([k]) => String(k).startsWith(kind + ':')).map(([key, v]) => ({ key, ...v })).sort((a, b) => b.at - a.at);
const copiesList = () => snapsOf('auto');
const trashList = () => snapsOf('trash');
// the copies made before an update are kept apart, so weekly ones never push them out
async function pruneCopies() {
  const list = await copiesList();
  for (const [group, keep] of [[list.filter(c => c.why === 'update'), UPDATE_KEEP], [list.filter(c => c.why !== 'update'), COPY_KEEP]]) {
    for (const [i, c] of group.entries()) if (i >= keep || (clockOK && Date.now() - c.at > (+settings.copyDays || COPY_DAYS) * DAY)) await idbDel('snaps', c.key);
  }
}
// once a week, and only when something changed since the newest copy (photos included)
async function maybeWeekCopy() {
  try {
    const last = (await copiesList())[0];
    if (Date.now() - Math.max(last ? last.at : 0, +load('copyCheck', 0)) < 7 * DAY) return;
    save('copyCheck', Date.now());
    const raw = rawNow(), sig = (await idbAll('photos')).map(([k, b]) => k + ':' + ((b && b.size) || 0)).sort().join(',');
    if (last && RAW_KEYS.every(n => (last.ls || {})[n] === raw[n]) && last.sig === sig) return;
    await autoCopy('week', raw);
  } catch (e) { noteTrouble('copy'); }
}
async function paintCopies() {
  let list = [];
  try { list = await copiesList(); } catch (e) {}
  $('#copyList').innerHTML = list.length ? list.map(c => {
    let n = 0;
    try { n = splitSizes((JSON.parse(c.ls.items) || []).filter(okItem).map(fixItem)).length; } catch (e) {}
    const what = c.why === 'update' ? `${esc(c.to || '')} に なる 前` : c.why === 'restore' ? '戻す 前の 状態' : c.why === 'conflict' ? 'ほかの 窓が 保存した 状態' : '週の 控え';
    return `<li class="srow"><span class="stx"><b>${md(c.at)} ${hm(c.at)}</b><small>${what}・品物 ${n}こ・写真 ${(c.photos || []).length}まい</small></span>`
      + `<button type="button" class="btn text sl" data-peek="${esc(c.key)}">中身</button><button type="button" class="btn tonal sl" data-k="${esc(c.key)}">もどす</button></li>`;
  }).join('') : '<li class="srow empty">まだ ありません。</li>';
  $('#clearCopies').hidden = !list.length;
}
$('#copyList').addEventListener('click', async e => {
  const pk = e.target.closest('[data-peek]');
  if (pk) {
    const c = await idbGet('snaps', pk.dataset.peek).catch(() => null);
    if (!c) return;
    let its = [];
    const made = new Map();
    try { its = splitSizes((JSON.parse(c.ls.items) || []).filter(okItem).map(fixItem), made); regroup(its); } catch (e2) {}
    try { statsFor(its, made, (JSON.parse(c.ls.history) || []).filter(okHist).map(fixHist)); } catch (e2) {}
    const ph = new Map(c.photos || []);
    openPeek('控えの 中身', `${md(c.at)} ${hm(c.at)}の 控えです。品物を 1つずつ 戻せます（いまの ものは「けした 品物」に 入ります）。`, its.map(it => ({ item: it, photo: it.photo ? ph.get(it.id) || ph.get(made.get(it.id)) || null : null })));
    return;
  }
  const b = e.target.closest('[data-k]');
  if (!b) return;
  const c = await idbGet('snaps', b.dataset.k).catch(() => null);
  if (c && await ask('この 控えに もどしますか？', `品物・写真・設定・送った記録が、${md(c.at)} ${hm(c.at)}の 状態に 戻ります。いまの 状態も 控えに 残るので、あとから 戻せます。`, 'もどす')) restoreCopy(b.dataset.k);
});
async function restoreCopy(key) {
  const c = await idbGet('snaps', key).catch(() => null);
  if (!c) { toast('その 控えが 見つかりませんでした。'); return; }
  // what there is now becomes a copy too, so going back can itself be undone
  try { await autoCopy('restore', rawNow()); } catch (e) { toast('いまの 状態を 取っておけないため、やめました。スマホの 空きを たしかめて ください。'); return; }
  try {
    // a copy from before 1.21 has no sets: the sets stay as they are
    for (const n of RAW_KEYS) { if (!(n in (c.ls || {}))) continue; const v = c.ls[n]; if (v == null) localStorage.removeItem(KEY + n); else localStorage.setItem(KEY + n, v); }
    await idbReplace('photos', c.photos || []);
  } catch (e) { toast('戻せませんでした。スマホの 空きを たしかめて ください。'); return; }
  try { sessionStorage.setItem(KEY + 'note', `${md(c.at)} ${hm(c.at)}の 控えに 戻しました。`); } catch (e) {}
  // every window starts again from what is stored now
  announce('reload');
  location.reload();
}
async function paintTrash() {
  let list = [];
  try { list = await trashList(); } catch (e) {}
  // one that is back on the list already (from a copy or a file) leaves the bin
  const back = t => t.item && !t.replaced && splitSizes([fixItem(t.item)]).every(x => byId(x.id));
  for (const t of list.filter(back)) idbDel('snaps', t.key).catch(() => {});
  list = list.filter(t => !back(t));
  $('#trashBox').hidden = !list.length;
  $('#trashList').innerHTML = list.map(t => {
    const its = splitSizes([fixItem(t.item)]), it = its[0];
    return `<li class="srow"><span class="sedit">${picHTML({ ...it, photo: false }, 'sm')}<span class="stx"><b>${esc(its.map(x => x.name).join('・'))}</b><small>${md(t.at)}に けしました${t.photo ? '（写真も あります）' : ''}</small></span></span>`
      + `<button type="button" class="btn tonal sl" data-t="${esc(t.key)}">もどす</button></li>`;
  }).join('');
}
$('#trashList').addEventListener('click', async e => {
  const b = e.target.closest('[data-t]');
  if (!b) return;
  const t = await idbGet('snaps', b.dataset.t).catch(() => null);
  if (!t) return;
  const its = splitSizes([fixItem(t.item)]);
  regroup(its);
  for (const it of its) {
    if (byId(it.id)) it.id = uid();
    it.photo = false;
    if (t.photo) { try { await putPhoto(it.id, t.photo); it.photo = true; } catch (err) {} }
  }
  items.splice(Math.min(t.idx, items.length), 0, ...its);
  save('items', items);
  await idbDel('snaps', b.dataset.t).catch(() => {});
  renderSettings();
  toast(`「${its.map(it => it.name).join('」と「')}」を 戻しました。`);
});

// what could not be read, kept aside at start (once for each different content)
async function keepBroken() {
  try {
    const last = (await snapsOf('broken'))[0];
    if (last && RAW_KEYS.every(n => last.ls[n] === RAW[n])) return;
    await idbPut('snaps', 'broken:' + Date.now(), { at: Date.now(), what: [...broken], ls: RAW });
  } catch (e) { noteTrouble('broken'); }
}
async function paintBroken() {
  let b = null;
  try { b = (await snapsOf('broken')).find(x => !x.seen) || null; } catch (e) {}
  $('#brokenCard').hidden = !b;
  $('#brokenCard').dataset.k = b ? b.key : '';
  if (!b) return;
  const what = b.what.map(w => ({ items: '品物', settings: '設定', sets: 'セット' })[w] || '送った記録').join('と ');
  $('#brokenText').innerHTML = `<b>${what}の データの 一部が 読めませんでした</b>（${md(b.at)}）。読めなかった 元の データは、この スマホの 中に とって あります。前の 状態に 戻すときは「自動の 控え」から えらんで ください。`;
}
$('#brokenGo').addEventListener('click', () => { const h = $('#copyList').previousElementSibling.previousElementSibling; h.scrollIntoView({ block: 'start' }); window.scrollBy(0, -90); });
$('#brokenClose').addEventListener('click', async () => {
  const k = $('#brokenCard').dataset.k;
  try { const b = await idbGet('snaps', k); if (b) await idbPut('snaps', k, { ...b, seen: true }); } catch (e) {}
  paintBroken();
});
// a save into IndexedDB that went wrong (copies are skipped when nothing changed, so an old newest copy is no sign
// of trouble; a failed one is), and room running out (spaceLow, measured at start): both told in 設定
let spaceLow = false;
function paintTrouble() {
  const t = load('trouble', null);
  const kinds = { copy: '自動の 控え', trash: 'けした 品物', photo: '写真', broken: '読めなかった データの 取りおき' };
  const lines = [];
  if (t) lines.push(`<b>この スマホの 中の 保存で、うまく いかない ことが ありました</b>（${kinds[t.kind] || '保存'}・${md(t.at)}）。スマホの 空きを たしかめて ください。写真の ときは、とり直すと なおります。`);
  if (spaceLow) lines.push('<b>保存の 場所の 残りが 少なく なって います。</b>いらない 写真や アプリを けして、空きを ふやして ください。');
  $('#troubleCard').hidden = !lines.length;
  $('#troubleText').innerHTML = lines.join('<br>');
}
$('#troubleClose').addEventListener('click', () => { drop('trouble'); paintTrouble(); });

// the inside of a copy, with pictures; each item can come back alone (what is there now goes to the bin)
let peekURLs = [];
function openPeek(title, text, entries) {
  for (const u of peekURLs) URL.revokeObjectURL(u);
  peekURLs = [];
  $('#peekTitle').textContent = title;
  $('#peekText').textContent = text;
  $('#peekList').innerHTML = entries.length ? entries.map((x, i) => {
    let pic = picHTML({ ...x.item, photo: false }, 'sm');
    if (x.photo) { const u = URL.createObjectURL(x.photo); peekURLs.push(u); pic = picHTML(x.item, 'sm', u); }
    return `<li class="srow"><span class="sedit">${pic}<span class="stx"><b>${esc(x.item.name)}</b><small>${esc(sline(x.item))}${x.photo ? '・写真 あり' : ''}</small></span></span>`
      + `<button type="button" class="btn tonal sl" data-i="${i}">戻す</button></li>`;
  }).join('') : '<li class="srow empty">品物は ありません。</li>';
  $('#peekList').onclick = async e => {
    const b = e.target.closest('[data-i]');
    if (!b || b.disabled) return;
    if (await restoreOne(entries[+b.dataset.i])) { b.disabled = true; b.textContent = '戻しました'; }
  };
  openSheet('sh-peek');
}
$('#sh-peek').addEventListener('closed', () => { for (const u of peekURLs) URL.revokeObjectURL(u); peekURLs = []; renderSettings(); });
async function restoreOne({ item, photo }) {
  const it = fixItem(item), cur = byId(it.id);
  if (cur && !(await ask(`いまの「${cur.name}」を 入れかえますか？`, 'いまの ものは「けした 品物」に 入るので、あとから 戻せます。', '入れかえる'))) return false;
  if (cur) {
    // what is there now goes to the bin first, photo and all
    // (a replaced version keeps its place in the bin even though an item of the same id is back on the list)
    try { await idbPut('snaps', 'trash:' + cur.id + ':' + Date.now(), { at: Date.now(), item: clone(cur), idx: items.indexOf(cur), photo: cur.photo ? await itemPhoto(cur) : null, replaced: true }); } catch (e) { noteTrouble('trash'); }
  }
  it.photo = false;
  if (photo) { try { await putPhoto(it.id, photo); it.photo = true; } catch (e) { noteTrouble('photo'); } }
  else if (cur && cur.photo) await delPhoto(cur.id);
  if (cur) items[items.indexOf(cur)] = it; else items.push(it);
  save('items', items);
  toast(`「${it.name}」を 戻しました。`);
  return true;
}

/* ---------- 送った記録・録音・ぜんぶ けす ---------- */
$('#clearHist').addEventListener('click', async () => {
  if (!(await ask('送った記録を けしますか？', '送った リストと、品物ごとの「前回」の 日と 回数を けします。', 'けす', 'やめる', { danger: true }))) return;
  const before = { hist: hist.slice(), stats: items.map(it => [it.id, it.count, it.lastAt]) };
  hist = [];
  items.forEach(it => { it.count = 0; it.lastAt = 0; });
  save('history', hist); save('items', items);
  renderSettings();
  toast('送った記録を けしました。', 'もとに もどす', () => {
    hist = before.hist;
    before.stats.forEach(([id, count, lastAt]) => { const it = byId(id); if (it) { it.count = count; it.lastAt = lastAt; } });
    save('history', hist); save('items', items);
    renderSettings();
  });
  scrubHistory();
});
// the sent lists also go from the copies kept on this phone, with each item's count and last day
// counts: 'zero' (送った記録を けす), 'sync' (a shorter keep: counts from the lists kept), 'keep'
async function scrubHistory(keep = () => [], counts = 'zero') {
  const fix = (its, h) => !Array.isArray(its) || counts === 'keep' ? its : (() => {
    const st = counts === 'sync' ? statsOf(h || []) : new Map();
    return its.map(it => (it && typeof it === 'object' ? { ...it, count: (st.get(it.id) || {}).count || 0, lastAt: (st.get(it.id) || {}).lastAt || 0 } : it));
  })();
  try {
    for (const { key, ...c } of await copiesList()) {
      let h = null;
      try { h = JSON.parse(c.ls.history); } catch (e) {}
      const kept = Array.isArray(h) ? keep(h) : null;
      const ls = { ...c.ls, history: kept ? JSON.stringify(kept) : counts === 'zero' ? null : c.ls.history };
      try { ls.items = JSON.stringify(fix(JSON.parse(c.ls.items), kept)); } catch (e) {}
      await idbPut('snaps', key, { ...c, ls });
    }
    for (const { key, ...b } of await snapsOf('broken')) await idbPut('snaps', key, { ...b, ls: { ...b.ls, history: counts === 'zero' ? null : b.ls.history } });
  } catch (e) {}
}
$('#clearTrash').addEventListener('click', async () => {
  if (!(await ask('けした 品物を 完全に けしますか？', '写真も いっしょに 消えて、もう 戻せなく なります。この スマホの 中の 控えからも けします。', 'けす', 'やめる', { danger: true }))) return;
  const ids = new Set();
  // (a replaced version leaves the bin only: the item of that id is still on the list, and its copies stay)
  try { for (const t of await trashList()) { if (t.item && !t.replaced && !byId(t.item.id)) ids.add(t.item.id); await idbDel('snaps', t.key); } } catch (e) {}
  await scrubItems(ids);
  paintTrash();
  toast('けした 品物を 完全に けしました。');
});
// items gone for good leave the copies too, photos and all
async function scrubItems(ids) {
  if (!ids.size) return;
  const sigOf = photos => photos.map(([k, b]) => k + ':' + ((b && b.size) || 0)).sort().join(',');
  try {
    for (const { key, ...c } of await copiesList()) {
      let its = null;
      try { its = JSON.parse(c.ls.items); } catch (e) {}
      const photos = (c.photos || []).filter(([k]) => !ids.has(k));
      const left = Array.isArray(its) ? its.filter(i => !(i && ids.has(i.id))) : its;
      if (photos.length === (c.photos || []).length && (!Array.isArray(its) || left.length === its.length)) continue;
      await idbPut('snaps', key, { ...c, ls: { ...c.ls, items: Array.isArray(its) ? JSON.stringify(left) : c.ls.items }, photos, sig: sigOf(photos) });
    }
  } catch (e) {}
}
$('#clearCopies').addEventListener('click', async () => {
  if (!(await ask('控えを ぜんぶ けしますか？', 'この スマホの 中の 自動の 控えを ぜんぶ けします。けした 控えには 戻せなく なります。', 'けす', 'やめる', { danger: true }))) return;
  try { for (const c of await copiesList()) await idbDel('snaps', c.key); } catch (e) {}
  paintCopies();
  toast('控えを ぜんぶ けしました。');
});
$('#clearVoices').addEventListener('click', async () => {
  if (!(await ask('録音を ぜんぶ けしますか？', 'まだ 送って いない 声の メッセージも けします。けした 録音は 戻せません。', 'けす', 'やめる', { danger: true }))) return;
  stopVoice();
  cart.extras = cart.extras.filter(x => !x.voice);
  saveCart();
  try { await idbReplace('clips', []); } catch (e) {}
  renderSettings();
  toast('録音を ぜんぶ けしました。');
});
// for handing the phone on: every key of this app, and the IndexedDB database with photos, recordings and the
// copies; other windows reload, so none of them writes its old copy back
$('#wipeAll').addEventListener('click', async () => {
  if (!(await ask('データを ぜんぶ けしますか？', `品物・写真・送った記録・録音・設定を けして、はじめの 状態に 戻します。けした ものは 戻せません。けすときは「けす」を 押したまま 2びょう まって ください。`, 'けす（押したまま）', 'やめる', { gate: true, danger: true }))) return;
  stopVoice();
  try { for (const k of Object.keys(localStorage)) if (k.startsWith(KEY)) localStorage.removeItem(k); } catch (e) {}
  try { if (dbp) (await dbp).close(); } catch (e) {}
  dbp = null;
  await new Promise(res => { const q = indexedDB.deleteDatabase(DB_NAME); q.onsuccess = q.onerror = q.onblocked = () => res(); });
  announce('wiped');
  try { sessionStorage.setItem(KEY + 'note', 'データを ぜんぶ けしました。ホーム画面の アイコンも いらなければ、長押しして けして ください。マイクの 許可は Chrome の「サイトの 設定」で 消せます。'); } catch (e) {}
  location.replace(location.pathname);
});

/* ---------- a save that failed ---------- */
const canStore = () => { try { localStorage.setItem(KEY + 'probe', '1'); localStorage.removeItem(KEY + 'probe'); return true; } catch (e) { return false; } };
const current = { items: () => items, cart: () => cart, history: () => hist, settings: () => settings, sets: () => sets };
$('#saveRetry').addEventListener('click', () => {
  for (const n of [...unsaved]) {
    if (n === 'probe') { if (canStore()) unsaved.delete(n); }
    else if (n === 'pending') { if (pending) save('pending', pending); else drop('pending'); }
    else if (current[n]) save(n, current[n]());
  }
  paintSaveBar();
  toast(unsaved.size ? 'まだ 保存できません。スマホの 空きを ふやして、もう一度 ためして ください。' : '保存できました。');
});

/* ---------- start ---------- */
// another browser keeps its own storage, empty: inside LINE (or a browser other than Chrome on Android) the parent
// is pointed to the home-screen icon, where their list and photos are
const PLACE = /\bLine\//i.test(navigator.userAgent) ? 'line'
  : /Android/.test(navigator.userAgent) && /SamsungBrowser|Firefox|EdgA|OPR\/|YaBrowser|UCBrowser/.test(navigator.userAgent) ? 'other' : '';
function paintPlace() {
  const el = $('#placeNote');
  el.hidden = !PLACE;
  if (PLACE) el.textContent = (PLACE === 'line' ? 'いまは LINE の 中で ひらいて います。' : 'いつもと ちがう ブラウザで ひらいて います。')
    + 'ここでは いつもの 品物や 写真が 出ません。ホーム画面の「かいもの」の アイコンから ひらいて ください。';
}
applySize();
paintPlace();
if (!canStore()) { unsaved.add('probe'); paintSaveBar(); }
renderHome();
if (pending) setTimeout(askSent, 700);
(async () => {
  // what could not be read is kept aside before anything is saved over it
  if (broken.size) await keepBroken();
  // photos kept by 1.3 and before move out of localStorage first, then all of them are read in once
  await movePhotos();
  // a new version: a copy of what was stored, as it was, before this version saves anything over it
  if (lastVer !== APP_VER) {
    if (RAW.items == null) save('ver', APP_VER);
    else { try { await autoCopy('update', RAW, lastVer || ''); save('ver', APP_VER); } catch (e) { noteTrouble('copy'); } }
  }
  // 1.10: items with sizes, split as they were read, are saved only now, with their photos copied
  await finishSplit();
  // 1.15: what was moved out of たべもの is saved, also only after that copy
  if (regrouped && !broken.size) { save('items', items); regrouped = 0; }
  // 1.14: the starting items grew; a list from before gets the new ones, also only after that copy
  await addNewItems();
  // 1.21: and the starting sets, once, made of its items (new ones included); with data that couldn't be read they are
  // shown, and not saved
  if (sets === null) { sets = startSets(); if (!broken.size) save('sets', sets); }
  await loadPhotos();
  renderHome();
  // the clock is checked before anything is cleared by date
  await checkClock();
  trimHist();
  // a recording the phone has lost (its storage cleared) leaves the list, rather than being sent empty
  const lost = [];
  for (const x of cart.extras) if (x.voice && !(await clipGet(x.id))) lost.push(x.id);
  if (lost.length) { cart.extras = cart.extras.filter(x => !lost.includes(x.id)); saveCart(); renderHome(); }
  await dropOldVoices();
  pruneClips();
  await pruneSnap();
  // and a copy once a week
  await maybeWeekCopy();
  // room left: localStorage near its usual 5 MB, or the phone's storage nearly full
  try {
    let ls = 0;
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls += (k.length + (localStorage.getItem(k) || '').length) * 2; }
    const est = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate() : {};
    spaceLow = ls > 3.5 * 1048576 || !!(est.quota && est.quota - est.usage < 50 * 1048576);
  } catch (e) {}
})();
// after going back to a copy, the page starts again and says so
try { const note = sessionStorage.getItem(KEY + 'note'); if (note) { sessionStorage.removeItem(KEY + 'note'); setTimeout(() => toast(note), 400); } } catch (e) {}
if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(p => p || navigator.storage.persist()).catch(() => {});
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
