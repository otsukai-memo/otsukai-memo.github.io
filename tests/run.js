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
  async function value(store, key) {
    const db = await idb();
    try { return await new Promise(res => { const r = db.transaction(store).objectStore(store).get(key); r.onsuccess = () => res(r.result); }); } finally { db.close(); }
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
  // 1.10: an item with two sizes or more is shown as one item for each size
  const splitN = list => list.reduce((n, it) => n + ((it.sizes || []).length >= 2 ? it.sizes.length : 1), 0);
  // the starting items added to a list kept from before: 23 by 1.14 (none of them is in the fixtures) and a hundred
  // by 1.15 (おにぎり is in the 1.3 fixture)
  const ADDED = 23, ADDED3 = 100;
  const groupOf = id => ((stored('items') || []).find(it => it.id === id) || {}).group;
  const named = (f, name) => [...f.contentDocument.querySelectorAll('#groups .row')].find(r => r.querySelector('.nm').textContent === name);
  const giveFile = (f, input, text) => {
    const dt = new f.contentWindow.DataTransfer();
    dt.items.add(new f.contentWindow.File([text], 'kaimono-backup.json', { type: 'application/json' }));
    $in(f, input).files = dt.files;
    $in(f, input).dispatchEvent(new f.contentWindow.Event('change'));
  };
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
    // an item with sizes was always sent with one of them
    const line = it => ({ id: it.id, name: it.name, size: (it.sizes || []).length >= 2 ? it.sizes[0] : '', unit: it.unit, qty: 1 });
    localStorage.setItem(KEY + 'history', JSON.stringify(Array.from({ length: fx.history }, (_, i) => ({ at: Date.now() - (i + 1) * 3 * 864e5,
      lines: [line(fx.items[i % fx.items.length]), ...(i ? [] : fx.histSized || [])], extras: i ? [] : ['ふつうの メモ'], when: '' }))));
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
    check(rows(f) >= 146, `はじめて 開くと はじめの 品物が 出る（${rows(f)}行）`);
    check(!$in(f, '#appbar h1') && !/かいものメモ/.test($in(f, '#appbar').textContent), '上の 帯に「かいものメモ」の 文字が ない');
    check(!!named(f, 'お米 2kg') && !!named(f, 'お米 5kg') && (stored('items') || []).every(it => !it.sizes.length), 'はじめの 品物は 大きさごとに 分かれて いる');
    check($in(f, '.ver').textContent === 'かいものメモ ' + appVer, `表示の 版が ${appVer}`);
    check(stored('ver') === appVer, 'ver が 保存される');
    // 1.11: the genre menu at the top left lists the genres, and each one takes the list to its place
    $in(f, '#navBtn').click();
    await wait(700);
    const genres = [...f.contentDocument.querySelectorAll('#navList [data-g]')].map(b => b.dataset.g).join(',');
    check(!$in(f, '#sh-nav').hidden && genres === 'staple,veg,fruit,meat,fish,chilled,season,snack,deli,dry,drink,daily,other', `左上の メニューに ジャンルが 出る（${genres}）`);
    $in(f, '#navList [data-g="daily"]').click();
    await wait(600);
    const ghTop = Math.round($in(f, '#g-daily .gh').getBoundingClientRect().top), under = $in(f, '#appbar').offsetHeight + 8;
    check($in(f, '#sh-nav').hidden && Math.abs(ghTop - under) <= 2, `ジャンルを 押すと その 場所へ 飛ぶ（見出しが 上から ${ghTop}px、帯の 下が ${under}px）`);
    // 1.12: a touch on a row (not on ＋) shows how to put it in, for a second only
    named(f, 'たまご').querySelector('.hit').click();
    await wait(300);
    const hinted = !$in(f, '#toast').hidden && /入れるときは/.test($in(f, '#toast').textContent);
    await wait(1100);
    check(hinted && $in(f, '#toast').hidden, '行を さわったときの 案内は 1秒で 消える');
    // 1.13: the top of the parent's screen has no date, no まえと おなじ, no note for the family and no 「ほしいものの…」
    const top13 = $in(f, '#home').textContent;
    check(!$in(f, '#today') && !$in(f, '#sameBtn') && !$in(f, '#homeWelcome') && !/ほしいもの|ご家族の 方へ|まえと おなじ/.test(top13) && /えらび おわったら/.test(top13),
      '親の 画面に 日付・まえと おなじ・家族への 文が ない');

    // ---------- what 1.3 left ----------
    await clean();
    const f13 = FIXTURES['1.3'];
    put(f13);
    for (const [i, id] of f13.photos.entries()) localStorage.setItem(KEY + 'photo:' + id, await photoURL(i ? '#36c' : '#c63'));
    f = await openApp();
    check(rows(f) === splitN(f13.items) + ADDED + ADDED3 - 1, `1.3 の 品物が 大きさごとに ぜんぶ 出る（新しい 品物も 足して ${rows(f)}/${splitN(f13.items) + ADDED + ADDED3 - 1}）`);
    check(groupOf('a3') === 'deli' && groupOf('a1~6枚切り') === 'staple', '1.3 の たべものが それぞれの ジャンルに 移る（おにぎり → おそうざい）');
    const moved = await keys('photos');
    check(['a1~6枚切り', 'a1~8枚切り', 'a2'].every(id => moved.includes(id)) && !moved.includes('a1'), '1.3 の 写真が IndexedDB に 移る（分けた 品物には それぞれ）');
    check(!Object.keys(localStorage).some(k => k.startsWith(KEY + 'photo:')), '1.3 の 写真の 古い 置き場所は 空に なる');
    check(f.contentDocument.querySelectorAll('#groups .pic img').length === 3, '写真が 出る');
    const pic = $in(f, '#groups [data-id="a2"] .pic');
    check(!!pic, '絵文字の 品物が 出る');
    check((stored('cart') || {}).extras && stored('cart').extras.every(x => !x.voice), 'なくなった 録音は リストから 外れる');
    check((stored('history') || []).length === 1, '1.3 の 送った 記録が 残る');
    const auto13 = (await keys('snaps')).filter(k => k.startsWith('auto:')).sort().pop();
    check(!!auto13, '新しい 版の 前の 控えが 取られる');
    const copy13 = auto13 ? await value('snaps', auto13) : null;
    check(!!copy13 && (copy13.photos || []).some(p => p[0] === 'a1') && /"sizes":\["6枚切り"/.test(copy13.ls.items), '分ける 前の 品物と 写真が 控えに 残る');

    // ---------- what 1.8 left ----------
    await clean();
    const f18 = FIXTURES['1.8'];
    put(f18);
    f = await openApp();
    check(rows(f) === splitN(f18.items) + ADDED + ADDED3, `1.8 の 品物が 大きさごとに ぜんぶ 出る（新しい 品物も 足して ${rows(f)}/${splitN(f18.items) + ADDED + ADDED3}）`);
    check(groupOf('b1~8枚切り') === 'staple' && groupOf('b2') === 'chilled' && groupOf('b3') === 'veg' && groupOf('b4') === 'drink', '1.8 の たべものが それぞれの ジャンルに 移る（のみものは そのまま）');
    check((stored('history') || []).length === f18.history, '1.8 の 送った 記録が 残る');
    check(f.contentDocument.documentElement.dataset.size === 'l', '文字の 大きさの 設定が 残る');
    check((stored('cart') || {}).when === 'こんど来るとき', 'えらんで いる リストが 残る');
    check(((stored('cart') || {}).lines || {})['b1~6枚切り'] === 1 && named(f, '食パン 6枚切り').classList.contains('sel'), '大きさを えらんで いた 分は、その 大きさの 品物に 入る');
    const sent18 = ((stored('history') || [])[0] || { lines: [] }).lines.find(l => l.id === 'b1~8枚切り');
    check(!!sent18 && sent18.name === '食パン 8枚切り' && sent18.size === '' && ((stored('items') || []).find(it => it.id === 'b1~8枚切り') || {}).count === 1, '送った 記録の 大きさも その 品物に つく（回数も）');
    check(!$in(f, '#sh-size'), '大きさを 聞く 画面は ない');
    named(f, '食パン 8枚切り').querySelector('.plus').click();
    await wait(400);
    check(/^1/.test(named(f, '食パン 8枚切り').querySelector('.n').textContent) && ![...f.contentDocument.querySelectorAll('.layer')].some(l => !l.hidden), '＋ を 押すと すぐ 入る（どれか 聞かない）');
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
    check(file.items && file.items.length === splitN(f18.items) + ADDED + ADDED3 && typeof file.sum === 'string' && file.appVersion === appVer, '書き出した ファイルに 品物・版・印が 入る');
    await clean();
    f = await openApp();
    await openSettings(f);
    giveFile(f, '#importFile', text);
    await wait(800);
    $in(f, '#askOk').click();
    await wait(2000);
    const back = stored('items') || [];
    check(back.length === file.items.length && file.items.every(it => back.some(b => b.id === it.id && b.name === it.name && b.icon === it.icon)), 'バックアップを 読みこむと 同じ 品物に 戻る');
    check((stored('settings') || {}).to === 'ゆうこ', '送る 相手の 名前も 戻る');

    // ---------- a damaged file is refused ----------
    const bad = JSON.parse(text); bad.items[0].name += 'x';
    giveFile(f, '#verifyFile', JSON.stringify(bad));
    await wait(800);
    check(/こわれて/.test($in(f, '#askText').textContent), '中身が かわった ファイルは「こわれて います」と 断る');

    // ---------- 1.14: a list kept by 1.13 gets the new starting items once, but not one it has already ----------
    await clean();
    const kept = [
      { id: 'd1', name: 'たまご', icon: 'egg', unit: 'パック', group: 'food', sizes: [], note: '', photo: false, count: 2, lastAt: 0 },
      { id: 'd2', name: 'リンゴ', icon: 'apple', unit: '個', group: 'food', sizes: [], note: '', photo: false, count: 0, lastAt: 0 },
      { id: 'd3', name: '電池', icon: 'battery-full', unit: 'パック', group: 'other', sizes: [], note: '', photo: false, count: 0, lastAt: 0 },
      { id: 'd4', name: '手づくり つくだに', icon: '', unit: '個', group: 'food', sizes: [], note: '', photo: false, count: 0, lastAt: 0 },
    ];
    localStorage.setItem(KEY + 'items', JSON.stringify(kept));
    localStorage.setItem(KEY + 'ver', JSON.stringify('1.13'));
    f = await openApp();
    const grown = stored('items') || [];
    check(grown.length === kept.length + ADDED + ADDED3 - 1 && grown.filter(it => /りんご|リンゴ/.test(it.name)).length === 1, `1.13 の リストに 新しい 品物が 足される（${grown.length}こ。りんごは 1つの まま）`);
    check(groupOf('d1') === 'chilled' && groupOf('d2') === 'fruit' && groupOf('d3') === 'other' && groupOf('d4') === 'food' && /ほかの たべもの/.test($in(f, '#groups').textContent),
      'リンゴは くだものへ、名前の ちがう ものは「ほかの たべもの」に 残る');
    check(kept.every((it, i) => grown[i] && grown[i].id === it.id), 'もとの 品物の ならびは かわらない');
    f.remove();
    f = await openApp();
    check((stored('items') || []).length === grown.length && stored('catalog') === 3, 'もう一度 ひらいても 足すのは 1回だけ');

    // ---------- a backup made by 1.9, with sizes, looked at and read in ----------
    await clean();
    f = await openApp();
    await openSettings(f);
    const old = JSON.parse(JSON.stringify(FIXTURES['1.9 backup']));
    old.photos = Object.fromEntries(await Promise.all(old.photos.map(async id => [id, await photoURL('#3a3')])));
    old.history[0].at = Date.now() - 864e5;
    giveFile(f, '#verifyFile', JSON.stringify(old));
    await wait(800);
    const told = ($in(f, '#askText').textContent.match(/品物 \d+こ・写真 \d+まい/) || [''])[0];
    check(told === '品物 4こ・写真 2まい', `1.9 の バックアップは 大きさごとに 数える（${told}）`);
    $in(f, '#askNo').click();
    await wait(500);
    giveFile(f, '#importFile', JSON.stringify(old));
    await wait(800);
    $in(f, '#askOk').click();
    await wait(2000);
    const its = stored('items') || [];
    check(['お米 2kg', 'お米 5kg', 'たまご', 'ヨーグルト'].every(n => its.some(it => it.name === n)) && its.length === 4 && its.every(it => !it.sizes.length), '1.9 の バックアップを 読みこむと 大きさごとの 品物に なる');
    check((its.find(it => it.name === 'ヨーグルト') || {}).note === '400g・プレーン', '大きさが 1つの ものは「くわしく」に 入る');
    check(groupOf('c1~2kg') === 'staple' && groupOf('c2') === 'chilled', '1.9 の バックアップの たべものも ジャンルに 分かれる');
    const ph = await keys('photos');
    check(ph.includes('c1~2kg') && ph.includes('c1~5kg') && !ph.includes('c1'), 'その 写真も 大きさごとの 品物に つく');
    const lines19 = ((stored('history') || [])[0] || { lines: [] }).lines;
    check(lines19.some(l => l.id === 'c1~5kg' && l.name === 'お米 5kg') && (its.find(it => it.id === 'c1~5kg') || {}).count === 1, 'ファイルの 送った 記録も 大きさごとの 品物に つく');
    check(((stored('cart') || {}).lines || {})['c1~2kg'] === 2, 'ファイルの えらんで いた リストも 大きさごとの 品物に 入る');

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
