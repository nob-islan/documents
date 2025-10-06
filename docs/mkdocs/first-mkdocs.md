# はじめての MkDocs

cf. https://www.mkdocs.org/

markdown で作成したドキュメントを html 形式でビルドする**MkDocs**の構築および実装方法について記載します。

## Getting started

cf. https://www.mkdocs.org/getting-started/

### 前提

- Python が必要なのでインストールしておいてください。

- MkDocs をインストールします:

```shell
pip install mkdocs
```

- MkDocs プロジェクトを作成します:

```shell
mkdocs new nob-project
```

- 下記ディレクトリ構成でプロジェクトが構成されます:

```shell
nob-project
├── docs          # docs配下にmdファイルを配置すると、自動でサイドバー上にツリー表示されます。
│   └── index.md
└── mkdocs.yml    # 各種設定をこのymlに記載していきます。
```

- ローカルでドキュメント閲覧サーバを起動します:

```shell
# http://127.0.0.1:8000/で確認できます。
mkdocs serve
```

- 拡張機能である `Material for MkDocs` をインストールします（cf. https://squidfunk.github.io/mkdocs-material/）:

```shell
pip install mkdocs-material
```

## 設定

Web ページのカスタマイズ方法について記載します。

### MkDocs

MkDocs のみで設定できる項目については[公式ドキュメント](https://www.mkdocs.org/user-guide/choosing-your-theme/)を参照ください。

### Material for MkDocs

`mkdocs-material` で利用可能な設定については下記ドキュメントを参照ください:

- [setup](https://squidfunk.github.io/mkdocs-material/setup/)
- [reference](https://squidfunk.github.io/mkdocs-material/reference/)

最低限、`theme` の設定が必要です:

```yaml
theme:
  name: material
```

### 設定例

```yaml
site_name: Nob docs
theme:
  name: material
  features:
    - content.code.copy
  palette:
    # Palette toggle for light mode
    - media: "(prefers-color-scheme: light)"
      scheme: default
      primary: indigo # Used for the header, the sidebar, text links, and so on
      accent: indigo # Used to denote elements that can be interacted with, e.g. hovered links, and so on
      toggle:
        icon: material/weather-night
        name: Switch to dark mode
    # Palette toggle for dark mode
    - media: "(prefers-color-scheme: dark)"
      scheme: slate
      primary: black
      accent: deep purple
      toggle:
        icon: material/weather-sunny
        name: Switch to light mode
extra:
  generator: false
copyright: Copyright &copy; nob
markdown_extensions:
  # Enable codeblock highlight
  - pymdownx.highlight
  - pymdownx.superfences
  # Enable hyperlink
  - pymdownx.magiclink
```
