# Marp環境サンプル

VSCode上でmarkdown形式でスライドを作成できる [Marp](https://marp.app/) の環境サンプルです。

## 設定

```json
{
  "name": "Marp",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "features": {},
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true
      },
      "extensions": ["marp-team.marp-vscode", "esbenp.prettier-vscode"]
    }
  }
}
```

## markdownサンプル

- `marp: true`と記載することでスライド形式でプレビューできます。

  ```
  ---
  marp: true
  theme: gaia
  header: Header
  footer: Footer
  ---
  ```

- タイトルおよびコンテンツのページは以下のように記載します。

  ```md
  <!--
  _class: lead
  -->

  # タイトル

  タイトルのページです。

  ---

  # テスト２

  ## テスト2-1

  コンテンツのページです。

  ## テスト2-2

  章立てができます。
  ```

拡張機能 **Markdown Preview Enhanced** をインストール済みの場合、この拡張機能によって提供されるプレビューではスライドとして表示されないため、下記の設定でVSCodeが提供するデフォルトのプレビューボタンを表示させるようにしてください:

```json
"markdown-preview-enhanced.hideDefaultVSCodeMarkdownPreviewButtons": false,
```
