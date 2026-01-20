# React環境サンプル

React + TypeScriptでの開発環境のサンプルです:

```json
{
  "name": "React",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:24-bullseye",
  "features": {},
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
          "source.fixAll.eslint": "explicit"
        },
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
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint"
      ]
    }
  }
}
```
