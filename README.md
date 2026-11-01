# かいものメモ

80代の親が、絵を押すだけで買い物のお願いを LINE で送れるメモ。
https://otsukai-memo.github.io/

## この organization（otsukai-memo）に、ほかのページを作らない

otsukai-memo の中のリポジトリで GitHub Pages を有効にすると、`otsukai-memo.github.io/リポジトリ名/` で公開される。
これは このアプリと同じ住所（オリジン）なので、そのページからは、親のスマホに保存された
品物・写真・録音・送った記録・設定が読めてしまう（同じ住所のページは保存場所を共有する）。

- ここで公開するのは、このリポジトリ（otsukai-memo.github.io）だけにする
- 新しいアプリは、別の organization の `<名前>.github.io` に作る
- organization の Settings → Member privileges → Pages creation は、Public・Private とも外しておく
  （メンバーが作れないようにする。オーナーは作れてしまうので、上の決まりを守る）

## アプリを書きかえられる鍵を守る

このリポジトリに push できる人は、親のスマホで動くプログラムを書きかえられる。
悪い人の手に渡ると、親の写真・録音・送った記録を外に持ち出すこともできてしまう。

- GitHub アカウント（tsumikasane）は 2 段階認証にする（Settings → Password and authentication。できればパスキーも）
- organization の Settings → Authentication security → 「Require two-factor authentication for everyone」をオンにする
- このパソコンに保存されている GitHub の鍵（Git Credential Manager）があるので、パソコンを人に貸すときは注意する

## ファイル

- `index.html` … 画面
- `app.js` … アプリ本体。CSP（`script-src 'self'`）で、ページに直接書かれたスクリプトは動かない
- `sw.js` … オフライン用。`index.html` と `app.js` はいつもネットから新しいものを取る
- `manifest.webmanifest`・`icons/` … ホーム画面のアイコン
- `LICENSE-lucide.txt` … アイコン（Lucide）のライセンス
