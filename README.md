# Documents

作成したドキュメントや手順書などを捨てておくリポジトリです。

## 成果物

本プロジェクトにて作成したドキュメントは下記で公開されます:

https://nob-islan.github.io/documents/

## 開発方法

開発環境は [.devcontainer](.devcontainer/devcontainer.json) にて提供しています。markdown 形式で作成されたドキュメントについて [MkDocs](https://www.mkdocs.org/) にてレンダリングします。

### ドキュメント追加

`docs`配下に md 形式でドキュメントを作成してください。

### 動作確認

- mkdocs を起動します:

```shell
mkdocs serve
```

起動後、http://127.0.0.1:8000/ 上で作成したドキュメントを確認できます。

## デプロイ方法

main ブランチに push されると github action が実行され、`mkdocs build`コマンドで 外部公開向けのファイルが gh-pages ブランチに push され、その内容で github pages が更新されます。
