// The publish check's data tests (not published). Each scenario empties the app's storage, puts in what a version
// left, opens the app in a frame (same address, so it sees the same storage) and looks at what it did.
// Prints "ok" or "FAIL" per check and, at the end, "ALL OK" only when everything passed.
(async () => {
  'use strict';
  const out = document.getElementById('out');
  const log = s => { out.textContent += '\n' + s; };
  const KEY = 'kaimono:v1:';
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let fails = 0;
  const check = (ok, what) => { log((ok ? 'ok   ' : 'FAIL ') + what); if (!ok) fails++; };
  const appVer = ((await (await fetch('../app.js', { cache: 'no-store' })).text()).match(/APP_VER = '([^']+)'/) || [])[1];

  const idb = () => new Promise((res, rej) => { const q = indexedDB.open('kaimono-voice'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
  async function keys(store) {
    const db = await idb();
    try {
      if (!db.objectStoreNames.contains(store)) return [];
      return await new Promise(res => { const r = db.transaction(store).objectStore(store).getAllKeys(); r.onsuccess = () => res(r.result.map(String)); });
    } finally { db.close(); }
  }
  async function clean() {
    for (const f of document.querySelectorAll('iframe')) f.remove();
    await wait(300);
    for (const k of Object.keys(localStorage)) if (k.startsWith(KEY)) localStorage.removeItem(k);
    await new Promise(r => { const q = indexedDB.deleteDatabase('kaimono-voice'); q.onsuccess = q.onerror = q.onblocked = () => r(); });
  }
  async function openApp() {
    const f = document.createElement('iframe');
    f.width = 380; f.height = 800;
    f.src = '../index.html';
    document.body.appendChild(f);
    await new Promise(r => { f.onload = r; });
    await wait(2000);
    return f;
  }
  const $in = (f, s) => f.contentDocument.querySelector(s);
  const rows = f => f.contentDocument.querySelectorAll('#groups .row').length;
  const stored = name => { try { return JSON.parse(localStorage.getItem(KEY + name)); } catch (e) { return undefined; } };
  async function photoURL(color) {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'); g.fillStyle = color; g.fillRect(0, 0, 64, 64);
    return c.toDataURL('image/jpeg', 0.8);
  }
  function put(fx) {
    localStorage.setItem(KEY + 'items', JSON.stringify(fx.items));
    localStorage.setItem(KEY + 'cart', JSON.stringify(fx.cart));
    localStorage.setItem(KEY + 'settings', JSON.stringify(fx.settings));
    const line = it => ({ id: it.id, name: it.name, size: '', unit: it.unit, qty: 1 });
    localStorage.setItem(KEY + 'history', JSON.stringify(Array.from({ length: fx.history }, (_, i) => ({ at: Date.now() - (i + 1) * 3 * 864e5, lines: [line(fx.items[i % fx.items.length])], extras: i ? [] : ['ふつうの メモ'], when: '' }))));
    if (fx.backup) localStorage.setItem(KEY + 'backup', JSON.stringify(fx.backup));
    if (fx.ver) localStorage.setItem(KEY + 'ver', JSON.stringify(fx.ver));
  }
  async function openSettings(f) {
    $in(f, '#openSettings').click(); await wait(300);
    $in(f, '#askOk').click(); await wait(900);
  }

  try {
    // ---------- a first start ----------
    await clean();
    let f = await openApp();
    check(rows(f) >= 20, `はじめて 開くと はじめの 品物が 出る（${rows(f)}行）`);
    check($in(f, '.ver').textContent === 'かいものメモ ' + appVer, `表示の 版が ${appVer}`);
    check(stored('ver') === appVer, 'ver が 保存される');

    // ---------- what 1.3 left ----------
    await clean();
    const f13 = FIXTURES['1.3'];
    put(f13);
    for (const [i, id] of f13.photos.entries()) localStorage.setItem(KEY + 'photo:' + id, await photoURL(i ? '#36c' : '#c63'));
    f = await openApp();
    check(rows(f) === f13.items.length, `1.3 の 品物が ぜんぶ 出る（${rows(f)}/${f13.items.length}）`);
    const moved = await keys('photos');
    check(f13.photos.every(id => moved.includes(id)), '1.3 の 写真が IndexedDB に 移る');
    check(!Object.keys(localStorage).some(k => k.startsWith(KEY + 'photo:')), '1.3 の 写真の 古い 置き場所は 空に なる');
    check(f.contentDocument.querySelectorAll('#groups .pic img').length === f13.photos.length, '写真が 出る');
    const pic = $in(f, '#groups [data-id="a2"] .pic');
    check(!!pic, '絵文字の 品物が 出る');
    check((stored('cart') || {}).extras && stored('cart').extras.every(x => !x.voice), 'なくなった 録音は リストから 外れる');
    check((stored('history') || []).length === 1, '1.3 の 送った 記録が 残る');
    check((await keys('snaps')).some(k => k.startsWith('auto:')), '新しい 版の 前の 控えが 取られる');

    // ---------- what 1.8 left ----------
    await clean();
    const f18 = FIXTURES['1.8'];
    put(f18);
    f = await openApp();
    check(rows(f) === f18.items.length, `1.8 の 品物が ぜんぶ 出る（${rows(f)}/${f18.items.length}）`);
    check((stored('history') || []).length === f18.history, '1.8 の 送った 記録が 残る');
    check(f.contentDocument.documentElement.dataset.size === 'l', '文字の 大きさの 設定が 残る');
    check((stored('cart') || {}).when === 'こんど来るとき', 'えらんで いる リストが 残る');
    check(!!$in(f, '#groups [data-id="b2"] .pic.lu'), 'Lucide の 絵が 出る');
    check((await keys('snaps')).some(k => k.startsWith('auto:')), '新しい 版の 前の 控えが 取られる');

    // ---------- a backup out, then back into an empty app ----------
    await openSettings(f);
    let href = null;
    f.contentWindow.HTMLAnchorElement.prototype.click = function () { if (this.download) href = this.href; };
    $in(f, '#exportBtn').click();
    for (let i = 0; i < 40 && !href; i++) await wait(100);
    check(!!href, 'バックアップを 書き出せる');
    const text = href ? await (await f.contentWindow.fetch(href)).text() : '{}';
    const file = JSON.parse(text);
    check(file.items && file.items.length === f18.items.length && typeof file.sum === 'string' && file.appVersion === appVer, '書き出した ファイルに 品物・版・印が 入る');
    await clean();
    f = await openApp();
    await openSettings(f);
    const dt = new f.contentWindow.DataTransfer();
    dt.items.add(new f.contentWindow.File([text], 'kaimono-backup.json', { type: 'application/json' }));
    $in(f, '#importFile').files = dt.files;
    $in(f, '#importFile').dispatchEvent(new f.contentWindow.Event('change'));
    await wait(800);
    $in(f, '#askOk').click();
    await wait(2000);
    const back = stored('items') || [];
    check(back.length === f18.items.length && f18.items.every(it => back.some(b => b.id === it.id && b.name === it.name && b.icon === it.icon)), 'バックアップを 読みこむと 同じ 品物に 戻る');
    check((stored('settings') || {}).to === 'ゆうこ', '送る 相手の 名前も 戻る');

    // ---------- a damaged file is refused ----------
    const bad = JSON.parse(text); bad.items[0].name += 'x';
    const dt2 = new f.contentWindow.DataTransfer();
    dt2.items.add(new f.contentWindow.File([JSON.stringify(bad)], 'bad.json', { type: 'application/json' }));
    $in(f, '#verifyFile').files = dt2.files;
    $in(f, '#verifyFile').dispatchEvent(new f.contentWindow.Event('change'));
    await wait(800);
    check(/こわれて/.test($in(f, '#askText').textContent), '中身が かわった ファイルは「こわれて います」と 断る');

    // ---------- data that can't be read is kept, not written over ----------
    await clean();
    const broken = '[{"id":"x","name":"';
    localStorage.setItem(KEY + 'items', broken);
    f = await openApp();
    check(localStorage.getItem(KEY + 'items') === broken, '読めない 品物の データを 上書きしない');
    check((await keys('snaps')).some(k => k.startsWith('broken:')), '読めない データを 取って おく');
    check(rows(f) >= 20, 'その あいだは はじめの 品物で 使える');
    await clean();
  } catch (e) {
    check(false, 'テストの 途中で エラー: ' + (e && e.message));
  }
  log(fails ? `FAIL ${fails}` : 'ALL OK');
  document.title = 'done';
})();
