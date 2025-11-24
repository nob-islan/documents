# Go + html 環境サンプル

Go のテンプレートエンジンを用いて API および Web ページを開発するための環境サンプルです:

```json
{
  "name": "Go",
  "image": "mcr.microsoft.com/devcontainers/go:1.24-bullseye",
  "features": {
    // "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "[go]": {
          "editor.rulers": [100]
        },
        "[html]": {
          "editor.tabSize": 2,
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        },
        "[javascript]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        },
        "[css]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        }
      },
      "extensions": ["golang.go", "esbenp.prettier-vscode"]
    }
  }
}
```
