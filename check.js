// かいものメモ: the first look, written in old JavaScript so even a browser too old for app.js can run it.
// It stops the app (window.kaimonoStop) when the page is shown inside another site, or when the browser lacks what
// the app needs: then nothing is read or written, and the parent sees what to do instead of an empty screen.
(function () {
  'use strict';
  function stop(title, text) {
    window.kaimonoStop = true;
    var main = document.getElementById('home');
    if (!main) return;
    var box = document.createElement('div');
    box.className = 'stopnote';
    var h = document.createElement('h1');
    h.textContent = title;
    var p = document.createElement('p');
    p.textContent = text;
    box.appendChild(h);
    box.appendChild(p);
    document.body.textContent = '';
    document.body.appendChild(box);
  }
  // inside a page of another site: shown nowhere, so nobody can be tricked into pressing its buttons
  var framed = false;
  try { framed = window.top !== window.self && window.top.location.origin !== window.location.origin; } catch (e) { framed = true; }
  if (framed) { stop('この 画面は ここでは 使えません', 'かいものメモは、ほかの サイトの 中では ひらけません。'); return; }
  // what app.js needs (Chrome 73 or newer has all of it)
  var store = false;
  try { store = !!window.localStorage && !!window.indexedDB; } catch (e) { store = false; }
  var ok = store && !!window.Promise && !!window.fetch && !!window.crypto && !!window.crypto.subtle &&
    !!window.TextEncoder && !!Object.fromEntries && !!Array.prototype.flatMap && !!window.Blob && !!window.URL;
  if (!ok) {
    stop('この ブラウザでは 使えません',
      'Chrome を 新しく して ください（Play ストアで「Chrome」を さがして「更新」を 押します）。' +
      'これまでの データは そのまま 残って います。');
  }
})();
