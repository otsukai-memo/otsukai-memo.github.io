# かいものメモ

文字を打たなくても、絵を押すだけで買い物のお願いを LINE で送れるメモ。
https://otsukai-memo.github.io/

（このリポジトリは公開されているので、使う人や家族の くわしい ことは ここにも コミットの 文にも 書かない）

## この organization（otsukai-memo）に、ほかのページを作らない

otsukai-memo の中のリポジトリで GitHub Pages を有効にすると、`otsukai-memo.github.io/リポジトリ名/` で公開される。
これは このアプリと同じ住所（オリジン）なので、そのページからは、使う人のスマホに保存された
品物・写真・録音・送った記録・設定が読めてしまう（同じ住所のページは保存場所を共有する）。

- ここで公開するのは、このリポジトリ（otsukai-memo.github.io）だけにする
- 新しいアプリは、別の organization の `<名前>.github.io` に作る
- organization の Settings → Member privileges → Pages creation は、Public・Private とも外しておく
  （メンバーが作れないようにする。オーナーは作れてしまうので、上の決まりを守る）

## 住所（otsukai-memo.github.io）を変えない

スマホの データは、この住所に ひもづいて 保存されている。organization の名前や リポジトリの名前を 変えて
住所が変わると、新しい住所の アプリは 空っぽで 始まる（前の データは 古い住所に 残ったまま 読めない）。

- organization 名（otsukai-memo）と リポジトリ名（otsukai-memo.github.io）は 変えない
- どうしても 変えるときの 引っ越し：
  1. 古い住所の アプリで「家族の設定」→「Google ドライブに 保存」（送った記録も 入れる）
  2. 新しい住所を 公開して、スマホで 開く（ホーム画面の アイコンも 作り直す）
  3. 新しい住所の「家族の設定」→「ファイルから 読みこむ」で 1 の ファイルを 読みこむ
  4. 古い住所の「データを ぜんぶ けす」で 片づける

## 公開のしくみ

`main` に push すると、GitHub Actions（`.github/workflows/pages.yml`）が まず 確かめて、だめなら 公開しない
（公開中の 版が そのまま 残る）。結果は リポジトリの Actions で 見られる。

- 版の 番号が そろって いるか（`app.js` の APP_VER、`index.html` の `?v=` と 下の 表示）
- まっさらな 状態で 開いて 品物が 出るか、スクリプトの エラーが ないか
- 前の 版の データ（`tests/` の 見本）を 入れた 状態で 開いて、品物・記録・写真が 正しく 読めるか
- バックアップを 書き出して 読みこむ 往復で、中身が 同じに 戻るか
- 読めない データを 上書きしないか
- 一度 開いた あと、ネットが なくても 開けるか（オフライン）
- パスワードつき バックアップを 開く ページが あるか

公開されるのは 決まった ファイルだけ（`tests/` や `.github/` は 公開しない）。
GitHub Pages の Settings → Pages → Source は「GitHub Actions」に しておく。
Actions の 部品は コミットの 番号で 固定して あり、新しい 版は Dependabot が 知らせて くれる。

毎日 1回、`.github/workflows/watch.yml` が 公開中の サイトを 開いて 確かめ、おかしければ Issue を 立てる
（GitHub から メールが 届く）。リポジトリに 60日 動きが ないと、GitHub は 毎日の 見回りを 止めるので、
そのときは Actions の 画面で 「Enable workflow」を 押す。

## まちがった 版を 出して しまった とき

チェックは 通ったけれど 中身が まちがって いた ときは、1つ 前の 版に 戻す。

1. このリポジトリの フォルダで `git revert HEAD`（まちがった コミットを 打ち消す 新しい コミットが できる）
2. `git push`（チェックの あと、1つ 前と 同じ 中身が 公開される）
3. スマホは 次に 開いた とき 戻った 版に なる。データは 自動の 控え（「家族の設定」→「自動の 控え」）からも 戻せる

`main` は 消したり 強制 push したり できない ように 守って ある（ブランチ保護）。戻すときは 上の revert で。

## データの 形の 変わりかた

| 版 | 変わった こと |
|---|---|
| 1.3 | 録音を IndexedDB `kaimono-voice` の `clips` に |
| 1.4 | 写真を localStorage の `photo:<id>` から IndexedDB の `photos` に（DB v2、`snaps` も）。送った記録は 90日 |
| 1.5 | 品物の 絵文字 `emoji` に 加えて Lucide の 絵 `icon`（`emoji` も 古い 窓の ために 残す） |
| 1.6 | 自動の 控え `snaps` の `auto:<時刻>`、けした 品物 `trash:<id>`。`ver` に 版 |
| 1.7 | 読めない データの 取りおき `broken:<時刻>`、`welcome`、`clock`、バックアップの パスワード（`locked`） |
| 1.8 | `settings.keep`、暗証番号 `pin`、`trouble`、`copyCheck`、バックアップに `appVersion` と `sum` |
| 1.9 | `settings.copyDays`、暗証番号の まちがい `pinTry`、パスワードの ヒント `locked.hint`、`pending` に 文を 入れない |
| 1.10 | 大きさが 2つ 以上の 品物（`sizes`）は 大きさごとの 品物に 分ける：id は `<もとの id>~<大きさ>`、名前は「名前 大きさ」、写真は それぞれに 写す。リストの `id\|大きさ` と 送った記録の `size` も その 品物に つけかえる。大きさ 1つは `note` へ。`sizes` と 記録の `size` は 1.9 の 窓の ために 空で 残す。名前と `note` は 60文字まで |
| 1.14 | はじめの 品物の 一覧に 番号（`catalog`）。2 で 23こ ふえた。前から ある リストには、まだ ない 名前（りんご と リンゴ は 同じ）で、けした 品物に ない ものだけ、ジャンルの 終わりに 1回 足す |

形を 変える ときは：前の 形も 読める ように する、`tests/fixtures.js` に その版の 見本を 足す、この 表に 書く。

## バックアップの ファイル

- ふつうの ファイル：`{ app: 'kaimono', version: 1, appVersion, exportedAt, items, photos, settings, history?, cart?, sum }`
  - `photos` は 品物の id ごとの JPEG（data URL）。`sum` は `sum` を のぞいた 中身の JSON の SHA-256（base64）
- パスワードつき：`{ app: 'kaimono', version: 1, locked: { cipher: 'AES-GCM', kdf: 'PBKDF2-SHA256', iter, salt, iv, hint? }, data }`
  - `data` は 上の ふつうの ファイルの 文字を、パスワードから PBKDF2-SHA256（`iter` 回）で 作った 256 ビットの 鍵で AES-GCM 暗号化した もの。どれも base64
  - `hint` は パスワードを 思い出す ための 手がかり（ふつうの 文字。パスワード そのものは 入れない）
  - アプリが なくても `tools/open-backup.html` で 開ける（https://otsukai-memo.github.io/tools/open-backup.html 。保存して おけば ネットなしでも 動く）

## アプリを書きかえられる鍵を守る

このリポジトリに push できる人は、スマホで動くプログラムを書きかえられる。
悪い人の手に渡ると、写真・録音・送った記録を外に持ち出すこともできてしまう。

- GitHub アカウント（tsumikasane）は 2 段階認証にする（Settings → Password and authentication。できればパスキーも）
- organization の Settings → Authentication security → 「Require two-factor authentication for everyone」をオンにする
- リポジトリでは「秘密情報の 見張り（secret scanning）」と「push の ブロック（push protection）」を オンに して ある
- このパソコンに保存されている GitHub の鍵（Git Credential Manager）は、tsumikasane の 全部の リポジトリに 使える。
  このリポジトリだけに 使える 鍵に しぼるには：
  1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token
  2. Resource owner：otsukai-memo、Repository access：Only select repositories → otsukai-memo.github.io
  3. Permissions：Contents（Read and write）、Workflows（Read and write）、Pages（Read and write）。有効期限は 1 年くらい
  4. このリポジトリの フォルダで `git config credential.useHttpPath true` を 実行し、次の push で 聞かれたら その鍵を 入れる
     （ほかの リポジトリは いままでの 鍵の まま）

## ファイル

- `index.html` … 画面。CSP は `script-src 'self'; style-src 'self'`（ページに 直接 書いた スクリプトも スタイルも 動かない）
- `check.js` … いちばん 先に 動く 小さな 確認（古い ブラウザ、ほかの サイトの 中で 開かれた とき）
- `app.js` … アプリ本体
- `style.css` … 見た目
- `sw.js` … オフライン用。ページ・`app.js`・`check.js`・`style.css` は いつも ネットから 新しい ものを 取る
- `tools/open-backup.html` … パスワードつき バックアップを アプリなしで 開く ページ（CSP は 中の スクリプトと スタイルの ハッシュだけ 許す）
- `tests/` … 公開前の テスト（公開は しない）
- `.github/workflows/pages.yml` … 公開の 前の 確認と 公開、`watch.yml` … 毎日の 見回り、`.github/dependabot.yml` … 部品の 更新の 知らせ
- `manifest.webmanifest`・`icons/` … ホーム画面のアイコン
- `LICENSE-lucide.txt` … アイコン（Lucide）のライセンス
