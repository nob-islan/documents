# Go環境サンプル

Goでの開発環境のサンプルです:

```json
{
  "name": "Go",
  "image": "mcr.microsoft.com/devcontainers/go:1.25-bookworm",
  "features": {
    // "ghcr.io/devcontainers/features/docker-in-docker:3": {}
  },
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "[go]": {
          "editor.rulers": [100]
        }
      },
      "extensions": ["golang.go"]
    }
  }
}
```
