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
  // the starting items added to a list kept from before: 23 by 1.14 (none of them is in the fixtures), a hundred
  // by 1.15 (おにぎり is in the 1.3 fixture), ten drinks by 1.16, two by 1.20, two by 1.21 and six by 1.22
  const ADDED = 23, ADDED3 = 100, ADDED4 = 10, ADDED5 = 2, ADDED6 = 2, ADDED7 = 6;
  // 1.22: the starting sets, in the order the family asked for them
  const DISHES = 'カレーライス,肉じゃが,豚の生姜焼き,鶏の唐揚げ,ハンバーグ,餃子,麻婆豆腐,野菜炒め,焼き鮭,さばの味噌煮,親子丼,筑前煮,きんぴらごぼう,卵焼き,ほうれん草のおひたし,味噌汁,豚汁,クリームシチュー,オムライス,チャーハン';
  const namesIn = (f, key) => [...f.contentDocument.querySelectorAll(`#g-${key} .row .nm`)].map(n => n.textContent);
  const groupOf = id => ((stored('items') || []).find(it => it.id === id) || {}).group;
  const named = (f, name) => [...f.contentDocument.querySelectorAll('#groups .row')].find(r => r.querySelector('.nm').textContent === name);
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
  // something kept in IndexedDB, as an earlier version left it
  async function putSnap(key, v) {
    const db = await new Promise((res, rej) => {
      const q = indexedDB.open('kaimono-voice', 2);
      q.onupgradeneeded = () => { for (const s of ['clips', 'photos', 'snaps']) if (!q.result.objectStoreNames.contains(s)) q.result.createObjectStore(s); };
      q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error);
    });
    try { await new Promise((res, rej) => { const tx = db.transaction('snaps', 'readwrite'); tx.objectStore('snaps').put(v, key); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); } finally { db.close(); }
  }
  async function openSettings(f) {
    $in(f, '#openSettings').click(); await wait(300);
    $in(f, '#askOk').click(); await wait(900);
  }

  try {
    // ---------- a first start ----------
    await clean();
    let f = await openApp();
    check(rows(f) >= 160, `はじめて 開くと はじめの 品物が 出る（${rows(f)}行）`);
    // 1.20: 大トロ after さしみ, パルミジャーノレッジャーノ after チーズ, and still one まんじゅう (there since 1.15)
    const fish = namesIn(f, 'fish'), dairy = namesIn(f, 'chilled');
    check(fish.indexOf('大トロ') > 0 && fish.indexOf('大トロ') === fish.indexOf('さしみ') + 1 && dairy.indexOf('パルミジャーノレッジャーノ') > 0
      && dairy.indexOf('パルミジャーノレッジャーノ') === dairy.indexOf('チーズ') + 1 && namesIn(f, 'snack').filter(n => n === 'まんじゅう').length === 1,
      'はじめの 品物に 大トロ（さしみの 次）と パルミジャーノレッジャーノ（チーズの 次）。まんじゅうは 1つ');
    check(!$in(f, '#appbar h1') && !/かいものメモ/.test($in(f, '#appbar').textContent), '上の 帯に「かいものメモ」の 文字が ない');
    check(!!named(f, 'お米 2kg') && !!named(f, 'お米 5kg') && (stored('items') || []).every(it => !it.sizes.length), 'はじめの 品物は 大きさごとに 分かれて いる');
    check($in(f, '.ver').textContent === 'かいものメモ ' + appVer, `表示の 版が ${appVer}`);
    check(stored('ver') === appVer, 'ver が 保存される');
    // 1.21–1.22: the items the sets needed, each beside its kind
    const veg = namesIn(f, 'veg'), dry = namesIn(f, 'dry'), chill = namesIn(f, 'chilled');
    const next = (list, a, b) => list.indexOf(a) >= 0 && list.indexOf(b) === list.indexOf(a) + 1;
    check(next(veg, '大根', 'ごぼう') && next(veg, 'ごぼう', 'れんこん') && next(veg, 'ねぎ', 'にら') && next(chill, 'こんにゃく', 'しらたき') && next(chill, 'しらたき', 'ぎょうざの皮')
      && next(dry, 'カレールー', 'シチュールー') && next(dry, 'シチュールー', '麻婆豆腐の素') && next(dry, '麻婆豆腐の素', 'レトルトカレー'),
      'はじめの 品物に ごぼう・れんこん（大根の 次）、にら（ねぎの 次）、しらたき・ぎょうざの皮（こんにゃくの 次）、シチュールー・麻婆豆腐の素（カレールーの 次）');
    const its = stored('items') || [], idOf = n => (its.find(it => it.name === n) || {}).id;
    const lineText = st => st.lines.map(l => (its.find(it => it.id === l.id) || {}).name + l.qty).join();
    // 1.22: twenty dishes, made of the starting items, with no seasoning (it is at home already)
    const sets0 = stored('sets') || [], setBy = n => sets0.find(st => st.name === n) || { lines: [] };
    check(sets0.map(st => st.name).join() === DISHES && lineText(setBy('カレーライス')) === 'じゃがいも1,にんじん1,たまねぎ2,ぶた肉300,カレールー1'
      && lineText(setBy('豚汁')) === 'ぶた肉200,大根1,にんじん1,ごぼう1,こんにゃく1,ねぎ1' && lineText(setBy('餃子')) === 'ひき肉200,キャベツ1,にら1,ぎょうざの皮1'
      && lineText(setBy('筑前煮')) === 'とり肉200,ごぼう1,れんこん1,にんじん1,こんにゃく1,しいたけ1' && lineText(setBy('卵焼き')) === 'たまご1'
      && lineText(setBy('クリームシチュー')) === 'とり肉300,じゃがいも1,にんじん1,たまねぎ1,ブロッコリー1,牛乳 1L1,シチュールー1', `はじめの セットは 20の 料理（${sets0.length}こ）`);
    check(sets0.length === 20 && sets0.every(st => st.lines.length && st.lines.every(l => its.some(it => it.id === l.id && it.group !== 'season'))),
      'どの セットの 品物も リストに あり、ちょうみりょうは 入って いない');
    // on the parent's screen, one row at the top opens them
    const openRow = f.contentDocument.querySelectorAll('#setOpen .row');
    check(!$in(f, '#g-set').hidden && openRow.length === 1 && openRow[0].querySelector('.sub').textContent === 'カレーライス・肉じゃが・豚の生姜焼き など 20こ'
      && $in(f, '#g-set').getBoundingClientRect().bottom <= $in(f, '#groups').getBoundingClientRect().top && $in(f, '#sh-sets').hidden,
      `親の 画面の 上は「料理を えらぶ」の 1行だけ（${openRow.length}行）`);
    openRow[0].querySelector('.open').click();
    const setRows = [...f.contentDocument.querySelectorAll('#setList .setrow')], putOf = n => setRows.find(r => r.querySelector('.nm').textContent === n).querySelector('.put');
    // the second tap of a double tap, on a button that has just come up under the finger, puts nothing in
    putOf('カレーライス').click();
    await wait(700);
    check(!$in(f, '#sh-sets').hidden && setRows.map(r => r.querySelector('.nm').textContent).join() === DISHES && !Object.keys((stored('cart') || {}).lines || {}).length,
      '押すと 20の セットが ひらく（ひらいて すぐの 2度押しでは 入らない）');
    putOf('カレーライス').click();
    await wait(400);
    const cart1 = (stored('cart') || {}).lines || {}, said1 = $in(f, '#toast .tmsg').textContent;
    check(cart1[idOf('じゃがいも')] === 1 && cart1[idOf('にんじん')] === 1 && cart1[idOf('たまねぎ')] === 2 && cart1[idOf('ぶた肉')] === 300 && cart1[idOf('カレールー')] === 1
      && Object.keys(cart1).length === 5 && named(f, 'たまねぎ').classList.contains('sel') && $in(f, '#sendN').textContent === '5' && setRows[0].classList.contains('sel')
      && /入っています/.test(putOf('カレーライス').textContent) && said1 === 'カレーライスの 品物を 5こ 入れました。', `「ぜんぶ 入れる」で カレーライスの 5つが 入る（${said1}）`);
    putOf('カレーライス').click();
    await wait(400);
    check(JSON.stringify((stored('cart') || {}).lines) === JSON.stringify(cart1) && /もう ぜんぶ 入って います/.test($in(f, '#toast').textContent), 'もう一度 押しても ふえない');
    putOf('豚汁').click();
    await wait(400);
    const cart2 = (stored('cart') || {}).lines || {};
    const added2 = Object.keys(cart2).filter(k => !(k in cart1)).map(k => (its.find(it => it.id === k) || {}).name).join();
    check(added2 === '大根,ごぼう,こんにゃく,ねぎ' && cart2[idOf('ぶた肉')] === 300 && cart2[idOf('にんじん')] === 1, `豚汁は 足りない ものだけ 入る（${added2}。ぶた肉 300g は そのまま）`);
    $in(f, '#toast .tact').click();
    await wait(300);
    check(JSON.stringify((stored('cart') || {}).lines) === JSON.stringify(cart1) && !named(f, '大根').classList.contains('sel'), '「もとに もどす」で 豚汁の 分が もどる');
    $in(f, '#sh-sets .sheet-foot [data-close]').click();
    await wait(600);
    check($in(f, '#sh-sets').hidden && named(f, 'たまねぎ').classList.contains('sel'), '「とじる」で 品物の 画面に もどる（入れた 品物は そのまま）');
    // 1.11: the genre menu at the top left lists the genres, and each one takes the list to its place
    $in(f, '#navBtn').click();
    await wait(700);
    const genres = [...f.contentDocument.querySelectorAll('#navList [data-g]')].map(b => b.dataset.g).join(',');
    check(!$in(f, '#sh-nav').hidden && genres === 'set,staple,veg,fruit,meat,fish,chilled,season,snack,deli,dry,drink,daily,other', `左上の メニューに セットと ジャンルが 出る（${genres}）`);
    // 1.22: its セット opens the sets
    $in(f, '#navList [data-g="set"]').click();
    await wait(900);
    check($in(f, '#sh-nav').hidden && !$in(f, '#sh-sets').hidden, '「ジャンル」の セットを 押すと セットが ひらく');
    $in(f, '#sh-sets .sheet-foot [data-close]').click();
    await wait(600);
    $in(f, '#navBtn').click();
    await wait(700);
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
    // 1.19: 設定 (no longer 家族の設定) sits at the top right, on the line of ジャンル
    const nb = $in(f, '#navBtn').getBoundingClientRect(), sb = $in(f, '#openSettings').getBoundingClientRect();
    check(!!$in(f, '#appbar #openSettings') && Math.abs(nb.top - sb.top) <= 2 && f.contentDocument.documentElement.clientWidth - sb.right < 24 && !$in(f, '.foot'),
      `「設定」は 右上、「ジャンル」と 同じ 高さ（${Math.round(nb.top)}px・${Math.round(sb.top)}px、右から ${Math.round(f.contentDocument.documentElement.clientWidth - sb.right)}px）`);
    check($in(f, '#openSettings').textContent === '設定' && $in(f, '#setTitle').textContent === '設定' && !/家族の設定/.test(f.contentDocument.body.textContent), '名前は「家族の設定」では なく「設定」');
    // 1.17: 品物を ふやす asks for no picture: the name's first letter is the item's picture (drawings and photos on なおす)
    await openSettings(f);
    $in(f, '#addItem').click();
    await wait(600);
    $in(f, '#fName').value = 'みかんの かんづめ';
    $in(f, '#fName').dispatchEvent(new f.contentWindow.Event('input'));
    check($in(f, '#fPics').hidden && $in(f, '#fPhoto').hidden && !$in(f, '#fAutoNote').hidden && ($in(f, '#fPicBox .pic.ini') || {}).textContent === 'み',
      '品物を ふやす ときは 絵・写真を 聞かず、名前の 1文字目が 絵に なる');
    $in(f, '#fSave').click();
    await wait(900);
    const made = (stored('items') || []).find(it => it.name === 'みかんの かんづめ') || {};
    const madeRow = $in(f, `#sItems [data-id="${made.id}"]`);
    check(made.icon === '' && made.photo === false && !!madeRow && !!madeRow.querySelector('.pic.ini'), 'ふやした 品物は 名前の 1文字目の 絵で 保存される');
    if (madeRow) madeRow.querySelector('.sedit').click();
    await wait(600);
    check(!$in(f, '#fPics').hidden && !$in(f, '#fPhoto').hidden && $in(f, '#fAutoNote').hidden, 'なおす ときは 絵・写真を えらべる');
    $in(f, '#sh-edit .sheet-foot [data-close]').click();
    await wait(600);
    $in(f, '#closeSettings').click();
    await wait(900);
    const homeRow = named(f, 'みかんの かんづめ');
    check(!!homeRow && (homeRow.querySelector('.pic.ini') || {}).textContent === 'み', '親の 画面にも 名前の 1文字目の 絵で 出る');
    // 1.18: 設定 has no choice of how to send or of colours, nothing on the home-screen icon, and no backups
    await openSettings(f);
    const set18 = $in(f, '#settings').textContent;
    check(['#sendSeg', '#themeSeg', '#installBtn', '#backupSec', '#backupCard', '#welcomeCard', '#importFile', '#verifyFile', '#saveOut'].every(s => !$in(f, s))
      && !/バックアップ|ホーム画面に アイコンを 置く|画面の 色/.test(set18), '設定に 送り方と 画面の 色の えらび・ホーム画面の アイコン・バックアップが ない');
    // 1.21: a set is made in 設定 (a name, items picked from the list, their amounts), shown to the parent, changed and taken away
    $in(f, '#addSet').click();
    await wait(600);
    $in(f, '#setName').value = 'やさいいため';
    $in(f, '#setPick').click();
    await wait(600);
    const findIn = v => { $in(f, '#pickFind').value = v; $in(f, '#pickFind').dispatchEvent(new f.contentWindow.Event('input')); };
    findIn('もや');
    const found = [...f.contentDocument.querySelectorAll('#pickList .pick b')].map(b => b.textContent).join();
    findIn('');
    for (const n of ['キャベツ', 'もやし', 'ピーマン']) { [...f.contentDocument.querySelectorAll('#pickList .pick')].find(b => b.querySelector('b').textContent === n).click(); await wait(100); }
    const counted = $in(f, '#pickCount').textContent;
    $in(f, '#sh-setpick .sheet-foot [data-close]').click();
    await wait(600);
    const lineNames = () => [...f.contentDocument.querySelectorAll('#setLines .lnm')].map(e => e.textContent).join();
    check(found === 'もやし' && /3こ/.test(counted) && lineNames() === 'キャベツ,もやし,ピーマン', `えらんだ 品物が セットに 入る（さがす「もや」→ ${found}、${counted}）`);
    $in(f, `#setLines [data-id="${idOf('もやし')}"] .lplus`).click();
    await wait(100);
    $in(f, '#setSave').click();
    await wait(900);
    const made21 = (stored('sets') || [])[20] || { lines: [] };
    check(made21.name === 'やさいいため' && lineText(made21) === 'キャベツ1,もやし2,ピーマン1' && /やさいいため/.test($in(f, '#sSets').textContent), `セットを ふやせる（${made21.name}：${lineText(made21)}）`);
    $in(f, '#closeSettings').click();
    await wait(900);
    const homeSets = [...f.contentDocument.querySelectorAll('#setList .setrow')].map(r => r.querySelector('.nm').textContent + '：' + r.querySelector('.sub').textContent);
    // (a name and its amount, and the words of 牛乳 1L, are joined by a space that never breaks)
    check(homeSets.length === 21 && homeSets[20] === 'やさいいため：キャベツ・もやし\u00a02袋・ピーマン' && /・牛乳\u00a01L・/.test(homeSets[17])
      && /など 21こ$/.test($in(f, '#setOpen .sub').textContent), `ふやした セットが 親の 画面に 出る（${homeSets[20]}）`);
    await openSettings(f);
    const sRow = () => [...f.contentDocument.querySelectorAll('#sSets .srow')].find(r => /やさいいため/.test(r.textContent));
    sRow().querySelector('.sedit').click();
    await wait(600);
    $in(f, `#setLines [data-id="${idOf('ピーマン')}"] .ldel`).click();
    await wait(100);
    $in(f, '#setSave').click();
    await wait(900);
    check(lineText((stored('sets') || [])[20] || { lines: [] }) === 'キャベツ1,もやし2', 'セットを なおせる（ピーマンを はずした）');
    sRow().querySelector('.sedit').click();
    await wait(600);
    $in(f, '#setDelete').click();
    await wait(600);
    $in(f, '#askOk').click();
    await wait(900);
    check((stored('sets') || []).map(st => st.name).join() === DISHES && !$in(f, '#sh-set').classList.contains('open'), 'セットを けせる');
    // an item in many sets: its question names three of them, and how many
    const tamaRow = $in(f, `#sItems [data-id="${idOf('たまねぎ')}"]`);
    if (tamaRow) tamaRow.querySelector('.sedit').click();
    await wait(600);
    $in(f, '#fDelete').click();
    await wait(600);
    const askT = $in(f, '#askText').textContent;
    $in(f, '#askNo').click();
    await wait(600);
    $in(f, '#sh-edit .sheet-foot [data-close]').click();
    await wait(600);
    check(askT === '親の 画面から この ボタンが なくなります。「カレーライス」「肉じゃが」「豚の生姜焼き」など 7つの セットからも はずれます。' && !!idOf('たまねぎ') && !!(stored('items') || []).find(it => it.name === 'たまねぎ'),
      `いくつもの セットに ある 品物を けす ときは 3つと 数を 言う（${askT}）`);
    // the sheet that asked for backups' passwords too asks for the PIN only
    $in(f, '#pinSet').click();
    await wait(600);
    $in(f, '#passIn').value = $in(f, '#passAgain').value = '12';
    $in(f, '#passOk').click();
    await wait(200);
    const short = $in(f, '#passMsg').textContent;
    $in(f, '#passIn').value = $in(f, '#passAgain').value = '2580';
    $in(f, '#passOk').click();
    await wait(900);
    check(/4〜8けた/.test(short) && !!(stored('pin') || {}).hash && $in(f, '#sh-pass').hidden, `暗証番号を つけられる（短いと「${short}」）`);
    $in(f, '#closeSettings').click();
    await wait(900);
    $in(f, '#openSettings').click(); await wait(300);
    $in(f, '#askOk').click(); await wait(900);
    $in(f, '#passIn').value = '0000';
    $in(f, '#passOk').click();
    await wait(1500);
    const wrong = $in(f, '#passText').textContent;
    $in(f, '#passIn').value = '2580';
    $in(f, '#passOk').click();
    await wait(1500);
    check(/ちがいます/.test(wrong) && !$in(f, '#settings').hidden, `暗証番号で 設定が ひらく（ちがうと「${wrong}」）`);

    // ---------- what 1.3 left ----------
    await clean();
    const f13 = FIXTURES['1.3'];
    put(f13);
    for (const [i, id] of f13.photos.entries()) localStorage.setItem(KEY + 'photo:' + id, await photoURL(i ? '#36c' : '#c63'));
    f = await openApp();
    check(rows(f) === splitN(f13.items) + ADDED + ADDED3 + ADDED4 + ADDED5 + ADDED6 + ADDED7 - 1, `1.3 の 品物が 大きさごとに ぜんぶ 出る（新しい 品物も 足して ${rows(f)}/${splitN(f13.items) + ADDED + ADDED3 + ADDED4 + ADDED5 + ADDED6 + ADDED7 - 1}）`);
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
    check(rows(f) === splitN(f18.items) + ADDED + ADDED3 + ADDED4 + ADDED5 + ADDED6 + ADDED7, `1.8 の 品物が 大きさごとに ぜんぶ 出る（新しい 品物も 足して ${rows(f)}/${splitN(f18.items) + ADDED + ADDED3 + ADDED4 + ADDED5 + ADDED6 + ADDED7}）`);
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
    check(grown.length === kept.length + ADDED + ADDED3 + ADDED4 + ADDED5 + ADDED6 + ADDED7 - 1 && grown.filter(it => /りんご|リンゴ/.test(it.name)).length === 1, `1.13 の リストに 新しい 品物が 足される（${grown.length}こ。りんごは 1つの まま）`);
    check(groupOf('d1') === 'chilled' && groupOf('d2') === 'fruit' && groupOf('d3') === 'other' && groupOf('d4') === 'food' && /ほかの たべもの/.test($in(f, '#groups').textContent),
      'リンゴは くだものへ、名前の ちがう ものは「ほかの たべもの」に 残る');
    check(kept.every((it, i) => grown[i] && grown[i].id === it.id), 'もとの 品物の ならびは かわらない');
    f.remove();
    f = await openApp();
    check((stored('items') || []).length === grown.length && stored('catalog') === 7, 'もう一度 ひらいても 足すのは 1回だけ');

    // ---------- 1.16: a list kept by 1.15 gets the ten drinks only, after its own ones ----------
    await clean();
    const kept15 = [
      { id: 'e1', name: 'お茶', icon: 'coffee', unit: '本', group: 'drink', sizes: [], note: '', photo: false, count: 0, lastAt: 0, gset: 2 },
      { id: 'e2', name: '日本酒', icon: '', unit: '本', group: 'drink', sizes: [], note: '', photo: false, count: 0, lastAt: 0, gset: 2 },
      { id: 'e3', name: 'たまご', icon: 'egg', unit: 'パック', group: 'chilled', sizes: [], note: '', photo: false, count: 0, lastAt: 0, gset: 2 },
    ];
    localStorage.setItem(KEY + 'items', JSON.stringify(kept15));
    localStorage.setItem(KEY + 'catalog', JSON.stringify(3));
    localStorage.setItem(KEY + 'ver', JSON.stringify('1.15'));
    f = await openApp();
    const grown16 = stored('items') || [], add16 = grown16.slice(kept15.length);
    check(grown16.length === kept15.length + ADDED4 + ADDED5 + ADDED6 + ADDED7 - 1 && add16.filter(it => it.group === 'drink').length === ADDED4 - 1 && kept15.every((it, i) => grown16[i].id === it.id),
      `1.15 の リストに のみものが 足される（${grown16.length}こ。日本酒は 1つの まま）`);

    // ---------- 1.20: a list kept by 1.19 gets 大トロ and パルミジャーノレッジャーノ, each at the end of its genre ----------
    await clean();
    const kept19 = [
      { id: 'g1', name: 'さしみ', icon: '', unit: 'パック', group: 'fish', sizes: [], note: '', photo: false, count: 0, lastAt: 0, gset: 2 },
      { id: 'g2', name: 'ちくわ', icon: '', unit: '袋', group: 'fish', sizes: [], note: '', photo: false, count: 0, lastAt: 0, gset: 2 },
      { id: 'g3', name: 'チーズ', icon: '', unit: '個', group: 'chilled', sizes: [], note: '', photo: false, count: 0, lastAt: 0, gset: 2 },
      { id: 'g4', name: 'まんじゅう', icon: '', unit: '個', group: 'snack', sizes: [], note: '', photo: false, count: 0, lastAt: 0, gset: 2 },
    ];
    localStorage.setItem(KEY + 'items', JSON.stringify(kept19));
    localStorage.setItem(KEY + 'catalog', JSON.stringify(4));
    localStorage.setItem(KEY + 'ver', JSON.stringify('1.19'));
    f = await openApp();
    const grown20 = stored('items') || [];
    check(grown20.length === kept19.length + ADDED5 + ADDED6 + ADDED7 && kept19.every((it, i) => grown20[i].id === it.id) && stored('catalog') === 7
      && namesIn(f, 'fish').join() === 'さしみ,ちくわ,大トロ' && namesIn(f, 'chilled').join() === 'チーズ,しらたき,ぎょうざの皮,パルミジャーノレッジャーノ' && namesIn(f, 'snack').join() === 'まんじゅう',
      `1.19 の リストに 大トロ と パルミジャーノレッジャーノ が ジャンルの 終わりに 足される（1.22 の しらたき・ぎょうざの皮と ${grown20.length}こ。まんじゅうは 1つの まま）`);
    const picOf = name => (named(f, name) || { querySelector: () => null }).querySelector('.pic.ini');
    check((picOf('大トロ') || {}).textContent === '大' && (picOf('パルミジャーノレッジャーノ') || {}).textContent === 'パ', '足した 2つの 絵は 名前の 1文字目');
    f.remove();
    f = await openApp();
    check((stored('items') || []).length === grown20.length, '1.20 も もう一度 ひらいても 足すのは 1回だけ');

    // ---------- 1.21–1.22: a list kept by 1.20 gets ごぼう, カレールー and 1.22's six at the ends of their genres, and the starting sets once ----------
    await clean();
    const kept20 = [
      { id: 'h1', name: 'じゃがいも', icon: '', unit: '袋', group: 'veg', sizes: [], note: '', photo: false, count: 0, lastAt: 0, gset: 2 },
      { id: 'h2', name: 'にんじん', icon: 'carrot', unit: '本', group: 'veg', sizes: [], note: '', photo: false, count: 0, lastAt: 0, gset: 2 },
      { id: 'h3', name: 'たまねぎ', icon: '', unit: '個', group: 'veg', sizes: [], note: '', photo: false, count: 0, lastAt: 0, gset: 2 },
      { id: 'h4', name: 'ぶた肉', icon: '', unit: 'g', group: 'meat', sizes: [], note: '', photo: false, count: 0, lastAt: 0, gset: 2 },
      { id: 'h5', name: 'ツナ缶', icon: '', unit: '個', group: 'dry', sizes: [], note: '', photo: false, count: 0, lastAt: 0, gset: 2 },
    ];
    localStorage.setItem(KEY + 'items', JSON.stringify(kept20));
    localStorage.setItem(KEY + 'catalog', JSON.stringify(5));
    localStorage.setItem(KEY + 'ver', JSON.stringify('1.20'));
    f = await openApp();
    const grown21 = stored('items') || [], sets21 = stored('sets') || [];
    const text21 = st => st.lines.map(l => (grown21.find(it => it.id === l.id) || {}).name + l.qty).join();
    check(grown21.length === kept20.length + ADDED6 + ADDED7 && kept20.every((it, i) => grown21[i].id === it.id) && stored('catalog') === 7
      && namesIn(f, 'veg').join() === 'じゃがいも,にんじん,たまねぎ,ごぼう,れんこん,にら' && namesIn(f, 'dry').join() === 'ツナ缶,カレールー,シチュールー,麻婆豆腐の素',
      `1.20 の リストに ごぼう・カレールー と 1.22 の 6つが ジャンルの 終わりに 足される（${grown21.length}こ）`);
    // (a dish none of whose items the list has, like 焼き鮭, isn't made)
    const soup21 = sets21.find(st => st.name === '豚汁') || { lines: [] };
    check(sets21.length === 13 && sets21[0].name === 'カレーライス' && sets21[0].lines.slice(0, 4).map(l => l.id).join() === 'h1,h2,h3,h4' && text21(sets21[0]) === 'じゃがいも1,にんじん1,たまねぎ2,ぶた肉300,カレールー1'
      && text21(soup21) === 'ぶた肉200,にんじん1,ごぼう1' && !sets21.some(st => st.name === '焼き鮭') && f.contentDocument.querySelectorAll('#setList .setrow').length === 13,
      `いまの 品物で はじめの セットが できる（${sets21.length}こ。${sets21.slice(0, 2).map(st => st.name + '：' + text21(st)).join(' ')}）`);
    // sets the family took away don't come back
    f.remove();
    localStorage.setItem(KEY + 'sets', '[]');
    f = await openApp();
    check((stored('sets') || [1]).length === 0 && (stored('items') || []).length === grown21.length && $in(f, '#g-set').hidden, 'セットを ぜんぶ けしたら、もう 作らない');

    // ---------- 1.22: sets kept by 1.21 get the new dishes once, in their order; カレーセット and 豚汁セット take the dishes' names ----------
    await clean();
    const it21 = (id, name, unit, group) => ({ id, name, icon: '', unit, group, sizes: [], note: '', photo: false, count: 0, lastAt: 0, gset: 2 });
    const kept21 = [it21('k1', 'じゃがいも', '袋', 'veg'), it21('k2', 'にんじん', '本', 'veg'), it21('k3', 'たまねぎ', '個', 'veg'), it21('k4', 'ぶた肉', 'g', 'meat'),
      it21('k5', 'カレールー', '箱', 'dry'), it21('k6', '大根', '本', 'veg'), it21('k7', 'ごぼう', '本', 'veg'), it21('k8', 'こんにゃく', '個', 'chilled'), it21('k9', 'ねぎ', '本', 'veg'),
      it21('k10', 'たまご', 'パック', 'chilled'), it21('k11', 'とうふ', '丁', 'chilled'), it21('k12', 'さば', 'パック', 'fish'), it21('k13', 'ひき肉', 'g', 'meat'), it21('k14', 'とり肉', 'g', 'meat')];
    // the family's own set between the two of 1.21, and their カレーセット with more meat
    const sets121 = [
      { id: 's1', name: 'カレーセット', lines: [{ id: 'k1', qty: 1 }, { id: 'k2', qty: 1 }, { id: 'k3', qty: 2 }, { id: 'k4', qty: 400 }, { id: 'k5', qty: 1 }] },
      { id: 's2', name: 'うちの おでん', lines: [{ id: 'k6', qty: 1 }, { id: 'k8', qty: 2 }] },
      { id: 's3', name: '豚汁セット', lines: [{ id: 'k4', qty: 200 }, { id: 'k6', qty: 1 }, { id: 'k2', qty: 1 }, { id: 'k7', qty: 1 }, { id: 'k8', qty: 1 }, { id: 'k9', qty: 1 }] },
    ];
    localStorage.setItem(KEY + 'items', JSON.stringify(kept21));
    localStorage.setItem(KEY + 'sets', JSON.stringify(sets121));
    localStorage.setItem(KEY + 'catalog', JSON.stringify(6));
    localStorage.setItem(KEY + 'ver', JSON.stringify('1.21'));
    f = await openApp();
    const grown22 = stored('items') || [], sets22 = stored('sets') || [], names22 = sets22.map(st => st.name).join();
    check(grown22.length === kept21.length + ADDED7 && stored('catalog') === 7 && namesIn(f, 'veg').join() === 'じゃがいも,にんじん,たまねぎ,大根,ごぼう,ねぎ,れんこん,にら',
      `1.21 の リストに 6つの 品物が ジャンルの 終わりに 足される（${grown22.length}こ）`);
    check(names22 === 'カレーライス,肉じゃが,豚の生姜焼き,鶏の唐揚げ,ハンバーグ,餃子,麻婆豆腐,野菜炒め,さばの味噌煮,親子丼,筑前煮,きんぴらごぼう,卵焼き,味噌汁,うちの おでん,豚汁,クリームシチュー,オムライス,チャーハン',
      `1.21 の セットに 料理が 順に 足される（${names22}）`);
    const kept22 = id => sets22.find(st => st.id === id) || { lines: [] };
    check(kept22('s1').name === 'カレーライス' && JSON.stringify(kept22('s1').lines) === JSON.stringify(sets121[0].lines) && kept22('s3').name === '豚汁'
      && JSON.stringify(kept22('s3').lines) === JSON.stringify(sets121[2].lines) && kept22('s2').name === 'うちの おでん',
      'カレーセット・豚汁セットは 中身（ぶた肉 400g）の まま 名前だけ かわり、家族の セットは そのまま');
    const copy22 = (await keys('snaps')).filter(k => k.startsWith('auto:')).sort().pop();
    check(!!copy22 && JSON.parse((await value('snaps', copy22)).ls.sets).length === 3, '足す 前の セットが 控えに 残る');
    f.remove();
    f = await openApp();
    check(JSON.stringify(stored('sets')) === JSON.stringify(sets22) && (stored('items') || []).length === grown22.length, '1.22 も もう一度 ひらいても 足すのは 1回だけ');
    // a 1.21 list whose sets were all taken away gets the new dishes only
    f.remove();
    localStorage.setItem(KEY + 'items', JSON.stringify(kept21));
    localStorage.setItem(KEY + 'sets', '[]');
    localStorage.setItem(KEY + 'catalog', JSON.stringify(6));
    f = await openApp();
    const names22b = (stored('sets') || []).map(st => st.name);
    check(names22b.length === 16 && names22b[0] === '肉じゃが' && !names22b.includes('カレーライス') && !names22b.includes('豚汁'), `セットを ぜんぶ けした 1.21 の リストには 新しい 料理だけ（${names22b.length}こ）`);

    // ---------- 1.18: what 1.17 kept for the share menu, the dark screen and backups stays behind ----------
    await clean();
    localStorage.setItem(KEY + 'settings', JSON.stringify({ size: 'm', send: 'share', theme: 'dark', to: 'ゆうこ', lock: true, keep: 'three', copyDays: 60 }));
    localStorage.setItem(KEY + 'backup', JSON.stringify({ at: 1790000000000, changes: 4, dl: [1790000000000] }));
    localStorage.setItem(KEY + 'welcome', JSON.stringify(1790000000000));
    localStorage.setItem(KEY + 'ver', JSON.stringify('1.17'));
    await putSnap('beforeImport', { at: Date.now() - 864e5, items: [], hist: [], settings: {}, cart: null, photos: [] });
    f = await openApp();
    await wait(1000);
    const bg = (f.contentWindow.getComputedStyle(f.contentDocument.body).backgroundColor.match(/\d+/g) || []).slice(0, 3).map(Number);
    check(f.contentDocument.documentElement.dataset.theme !== 'dark' && bg.length === 3 && bg[0] + bg[1] + bg[2] > 600, `「暗い」に して いても 明るい 画面に なる（${bg.join(',')}）`);
    named(f, 'たまご').querySelector('.plus').click();
    await wait(300);
    $in(f, '#sendBtn').click();
    await wait(700);
    check($in(f, '#stepsT').textContent === 'LINEが ひらいたら：' && /ゆうこ/.test($in(f, '#steps').textContent) && /^https:\/\/line\.me\//.test($in(f, '#lineSend').getAttribute('href') || ''),
      `「共有メニュー」に して いても LINE を ひらいて 送る（${$in(f, '#stepsT').textContent}）`);
    check(localStorage.getItem(KEY + 'backup') === null && localStorage.getItem(KEY + 'welcome') === null && !(await keys('snaps')).includes('beforeImport'),
      'バックアップの 記録と、ファイルを 読みこむ 前の 状態は 消える');

    // ---------- data that can't be read is kept, not written over ----------
    await clean();
    const broken = '[{"id":"x","name":"';
    localStorage.setItem(KEY + 'items', broken);
    f = await openApp();
    check(localStorage.getItem(KEY + 'items') === broken, '読めない 品物の データを 上書きしない');
    check((await keys('snaps')).some(k => k.startsWith('broken:')), '読めない データを 取って おく');
    check(rows(f) >= 20, 'その あいだは はじめの 品物で 使える');
    // 1.21: and so are sets that can't be read
    await clean();
    const brokenSets = '[{"id":"s1","name":"';
    localStorage.setItem(KEY + 'sets', brokenSets);
    f = await openApp();
    check(localStorage.getItem(KEY + 'sets') === brokenSets && $in(f, '#g-set').hidden && rows(f) >= 160 && (await keys('snaps')).some(k => k.startsWith('broken:')),
      '読めない セットの データを 上書きしない（品物は 出る）');
    await clean();
  } catch (e) {
    check(false, 'テストの 途中で エラー: ' + (e && e.message));
  }
  log(`${Math.round(performance.now() / 1000)}びょう`);
  log(fails ? `FAIL ${fails}` : 'ALL OK');
  document.title = 'done';
})();
