# template 作成

cf. https://coder.com/docs/tutorials/template-from-scratch

workspace の素となる template をスクラッチで作成します。

## ディレクトリ構成

```
.
├── build
│   └── Dockerfile
├── main.tf
└── README.md
```

## 設定ファイル

- 公式ドキュメントに書いてある手順で`main.tf`を作成します。
- 開発コンテナの要件を`Dockerfile`に記載します。
- 必要に応じて`README.md`を記載します。coder の WebUI 上に表示されます。
