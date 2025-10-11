# React 環境サンプル

下記で開発コンテナを起動させます:

```json
{
  "name": "React",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:24-bullseye",
  "features": {},
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "[typescriptreact]": {
          "editor.tabSize": 2,
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        },
        "[typescript]": {
          "editor.tabSize": 2,
          "editor.defaultFormatter": "esbenp.prettier-vscode"
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
