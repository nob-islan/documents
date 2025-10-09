# React 環境サンプル

React 環境構築のためのサンプルです。

```json
{
  "name": "React",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20-bullseye",
  "features": {},
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "[typescriptreact]": {
          "editor.tabSize": 2,
          "editor.defaultFormatter": "vscode.typescript-language-features"
        },
        "[typescript]": {
          "editor.tabSize": 2,
          "editor.defaultFormatter": "vscode.typescript-language-features"
        },
        "[css]": {
          "editor.tabSize": 4,
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        },
        "[scss]": {
          "editor.tabSize": 4,
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
