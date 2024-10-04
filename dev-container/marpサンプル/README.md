# Marp 環境サンプル

VSCode 上で markdown 形式でスライドを作成できる**Marp**の環境を構築するためのサンプルソースです。

## 設定

```json
{
  "name": "Marp",
  "image": "ubuntu:latest",
  "features": {},
  "customizations": {
    "vscode": {
      "extensions": ["marp-team.marp-vscode", "esbenp.prettier-vscode"]
    }
  }
}
```

## markdown サンプル

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

  ## テスト 2-1

  コンテンツのページです。

  ## テスト 2-2

  章立てができます。
  ```
