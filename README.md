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

## 住所（otsukai-memo.github.io）を変えない

親のスマホの データは、この住所に ひもづいて 保存されている。organization の名前や リポジトリの名前を 変えて
住所が変わると、新しい住所の アプリは 空っぽで 始まる（前の データは 古い住所に 残ったまま 読めない）。

- organization 名（otsukai-memo）と リポジトリ名（otsukai-memo.github.io）は 変えない
- どうしても 変えるときの 引っ越し：
  1. 古い住所の アプリで「家族の設定」→「Google ドライブに 保存」（送った記録も 入れる）
  2. 新しい住所を 公開して、親のスマホで 開く（ホーム画面の アイコンも 作り直す）
  3. 新しい住所の「家族の設定」→「ファイルから 読みこむ」で 1 の ファイルを 読みこむ
  4. 古い住所の「データを ぜんぶ けす」で 片づける

## 公開のしくみ

`main` に push すると、GitHub Actions（`.github/workflows/pages.yml`）が まず アプリを Chrome で 開いて 確かめる。

- 版の 番号が そろって いるか（`app.js` の APP_VER、`index.html` の `app.js?v=` と 下の 表示）
- 親の 画面に 品物が 出るか、スクリプトの エラーが ないか
- パスワードつき バックアップを 開く ページが あるか

だめなときは 公開しない（公開中の 版が そのまま 残る）。結果は リポジトリの Actions で 見られる。
GitHub Pages の Settings → Pages → Source は「GitHub Actions」に しておく。

## バックアップの ファイル

- ふつうの ファイル：`{ app: 'kaimono', version: 1, appVersion, exportedAt, items, photos, settings, history?, cart?, sum }`
  - `photos` は 品物の id ごとの JPEG（data URL）。`sum` は `sum` を のぞいた 中身の JSON の SHA-256（base64）
- パスワードつき：`{ app: 'kaimono', version: 1, locked: { cipher: 'AES-GCM', kdf: 'PBKDF2-SHA256', iter, salt, iv }, data }`
  - `data` は 上の ふつうの ファイルの 文字を、パスワードから PBKDF2-SHA256（`iter` 回）で 作った 256 ビットの 鍵で AES-GCM 暗号化した もの。どれも base64
  - アプリが なくても `tools/open-backup.html` で 開ける（https://otsukai-memo.github.io/tools/open-backup.html 。保存して おけば ネットなしでも 動く）

## アプリを書きかえられる鍵を守る

このリポジトリに push できる人は、親のスマホで動くプログラムを書きかえられる。
悪い人の手に渡ると、親の写真・録音・送った記録を外に持ち出すこともできてしまう。

- GitHub アカウント（tsumikasane）は 2 段階認証にする（Settings → Password and authentication。できればパスキーも）
- organization の Settings → Authentication security → 「Require two-factor authentication for everyone」をオンにする
- このパソコンに保存されている GitHub の鍵（Git Credential Manager）は、tsumikasane の 全部の リポジトリに 使える。
  このリポジトリだけに 使える 鍵に しぼるには：
  1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token
  2. Resource owner：otsukai-memo、Repository access：Only select repositories → otsukai-memo.github.io
  3. Permissions：Contents（Read and write）、Workflows（Read and write）、Pages（Read and write）。有効期限は 1 年くらい
  4. このリポジトリの フォルダで `git config credential.useHttpPath true` を 実行し、次の push で 聞かれたら その鍵を 入れる
     （ほかの リポジトリは いままでの 鍵の まま）

## ファイル

- `index.html` … 画面
- `app.js` … アプリ本体。CSP（`script-src 'self'`）で、ページに直接書かれたスクリプトは動かない
- `sw.js` … オフライン用。`index.html` と `app.js` はいつもネットから新しいものを取る
- `tools/open-backup.html` … パスワードつき バックアップを アプリなしで 開く ページ（CSP は 中の スクリプトの ハッシュだけ 許す）
- `.github/workflows/pages.yml` … 公開の 前の 確認と 公開
- `manifest.webmanifest`・`icons/` … ホーム画面のアイコン
- `LICENSE-lucide.txt` … アイコン（Lucide）のライセンス
