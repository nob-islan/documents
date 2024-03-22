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
  "name": "react",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20-bullseye",
  "features": {},
  "customizations": {
    "vscode": {
      "extensions": [
        "jawandarajbir.react-vscode-extension-pack",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```
