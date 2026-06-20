# Documents

作成したドキュメントや手順書などを捨てておくリポジトリです。

## 成果物

本プロジェクトは[Cloudflare](https://www.cloudflare.com/)と連携しています。成果物は下記で公開されています:

https://nobislandocuments.pages.dev/

## 開発方法

開発環境は[.devcontainer](.devcontainer/devcontainer.json)にて提供しています。markdown形式で作成されたドキュメントについて[Zensical](https://zensical.org/)にてレンダリングします。

### ドキュメント追加

`docs`配下にmd形式でドキュメントを作成してください。

### 動作確認

- Zensicalを起動します:

```shell
zensical serve
```

起動後、http://localhost:8000/ 上で作成したドキュメントを確認できます。

## デプロイ方法

- mainブランチに push されるとgithub actionが実行され、`zensical build`コマンドで 外部公開向けのファイルが gh-pagesブランチにpushされます。
- gh-pagesブランチに変更が入ると Cloudflare上のnobislandocumentプロジェクトでビルドが走り、ドキュメントが更新されます。
