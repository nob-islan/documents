# MDWiki で Web ページを作成

markdown ファイルをレンダリングして Web ページとして公開してくれる **MDWiki** の構築方法、使い方について説明します。

cf. https://dynalon.github.io/mdwiki/#!index.md

## 構築方法

起動するための最小の準備事項を説明します。

- nginx をインストールします。

```shell
sudo apt update
sudo apt install nginx
```

- mdwiki リポジトリをクローンし、ビルドを実行します。

```shell
git clone https://github.com/Dynalon/mdwiki.git
cd mdwiki
npm install
npm run build
```

- `dist`配下について下記を準備します:

  - `mdwiki.html`について、`index.html`にリネーム
  - `index.md`ファイルを作成

- `dist`配下のファイルを一通り nginx が参照するディレクトリに格納します。

```
ubuntu@nob-tmp-mdwiki:/var/www/html$ ls -l
total 1388
-rw-r--r-- 1 root root 131532 Sep 28 15:10 MDwiki.js
-rw-r--r-- 1 root root  49855 Sep 28 15:10 MDwiki.min.js
-rw-r--r-- 1 root root 350793 Sep 28 15:10 index.html
-rw-r--r-- 1 root root     91 Sep 28 15:15 index.md
-rw-r--r-- 1 root root 432542 Sep 28 15:10 mdwiki-debug.html
-rw-r--r-- 1 root root  82816 Sep 28 15:10 mdwiki-slim.html
-rw-r--r-- 1 root root 350793 Sep 28 15:10 mdwiki.html.bk
drwxr-xr-x 2 root root   4096 Sep 28 15:14 nobtest
```

- `{mdwikiサーバのIDアドレス}:80`にアクセスすると、`index.md`の内容が表示されます。

## 使い方

サンプルソースを用いて典型的な使い方を説明します。

### ディレクトリ構成

上の構築方法で作成したファイルにいくつか追加しています:

```shell
dist/
    ├── docs/              # コンテンツを格納するディレクトリ
    │   ├── first.md
    │   ├── second-1.md
    │   ├── second-2.md
    │   └── second.md
    ├── favicon.png        # 拡張子はpngでないといけないらしい
    ├── index.html
    ├── index.md
    ├── mdwiki-debug.html
    ├── MDwiki.js
    ├── MDwiki.min.js
    ├── mdwiki-slim.html
    └── navigation.md      # ヘッダを構成するファイル
```

### 各種ファイル詳細

MDWiki 特有の書き方をするファイルについて解説します。

#### `index.md`

```md
<!-- 表紙となるページです。 -->

# サンプルページ

## 概要

MDWiki の使い方を説明するためのサンプルページです。

## 使い方

ナビゲーションバーから各ページを参照してください。
```

- 記法はいつもの markdown と同様ですが、`##`を 2 つ以上設けると自動でサイドバーが作成されます。`###`以降は反映されないようです。

#### `navigation.md`

```md
<!-- ヘッダを構成するページです。 -->

# Sample wiki

[First](./docs/first.md)
[Second]()

- # heading 1
- [Second 1](./docs/second-1.md)
- # heading 2
- [Second 2](./docs/second-2.md)
```

- `First`についてはファイルのリンクを指定しているため、クリックすると`first.md`に遷移します。
- `Second`についてはクリックするとプルダウンメニューが表示され、`second-1.md`や`second-2.md`を選択して遷移します。
