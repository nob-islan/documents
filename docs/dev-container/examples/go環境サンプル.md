# Go 環境サンプル

下記で開発コンテナを起動させます:

```json
{
  "name": "Go",
  "image": "mcr.microsoft.com/devcontainers/go:1.23-bullseye",
  "features": {
    // "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "[go]": {
          "editor.formatOnSave": true,
          "editor.rulers": [100]
        }
      },
      "extensions": ["golang.go"]
    }
  }
}
```
