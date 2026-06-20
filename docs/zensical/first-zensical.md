# はじめてのZensical

markdownで作成したドキュメントをhtml形式でビルドする[Zensical](https://zensical.org/)の構築および実装方法について記載します。

## Getting started

cf. https://zensical.org/docs/get-started/

### 前提

- Pythonが必要なのでインストールしておいてください。

- Zensicalをインストールします:

```shell
pip install zensical
```

- Zensicalプロジェクトを作成します:

```shell
zensical new .
```

- ローカルでドキュメント閲覧サーバを http://localhost:8000/ で起動します:

```shell
zensical serve
```

## 設定

### サンプル

```toml
[project]
site_name = "Nob docs"
copyright = """
Copyright &copy; nob
"""

[project.extra]
generator = false

[[project.theme.palette]]
scheme = "default"
toggle.icon = "lucide/moon"
toggle.name = "Switch to dark mode"

[[project.theme.palette]]
scheme = "slate"
toggle.icon = "lucide/sun"
toggle.name = "Switch to light mode"

[project.markdown_extensions.abbr]
[project.markdown_extensions.pymdownx.highlight]
[project.markdown_extensions.pymdownx.superfences]
[project.markdown_extensions.pymdownx.magiclink]
```
