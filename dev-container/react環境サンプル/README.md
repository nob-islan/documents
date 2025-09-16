# React 環境サンプル

React 環境構築のためのサンプルです。

## ディレクトリ構成

```
.devcontainer/
  └─devcontainer.json
```

## 設定

各種ファイルの設定内容です。

### devcontainer.json

```json
{
  "name": "React",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20-bullseye",
  "features": {},
  "customizations": {
    "vscode": {
      "settings": {
        "[typescriptreact]": {
          "editor.defaultFormatter": "vscode.typescript-language-features"
        },
        "[typescript]": {
          "editor.defaultFormatter": "vscode.typescript-language-features"
        },
        "[css]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        },
        "[scss]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        }
      },
      "extensions": [
        "jawandarajbir.react-vscode-extension-pack",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```
