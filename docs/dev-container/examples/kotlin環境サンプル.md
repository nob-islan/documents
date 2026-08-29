# Kotlin環境サンプル

Kotlinでの環境サンプルです。最新のJDKだとKotlinのみ動かない場合があるので注意してください。

```json
{
  "name": "Kotlin",
  // "image": "mcr.microsoft.com/devcontainers/java:21-bookworm", // mvnコマンドなどが必要な場合はこちらを使用
  "image": "eclipse-temurin:21-jdk",
  "features": {
    // "ghcr.io/devcontainers/features/java:1": {
    //   "version": "none",
    //   "installMaven": "true",
    //   "installGradle": "false"
    // },
    // "ghcr.io/devcontainers/features/docker-in-docker:4": {
    //   "moby": false
    // }
  },
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "editor.inlayHints.enabled": "off",
        "editor.codeActionsOnSave": {
          "source.organizeImports": "always"
        }
      },
      "extensions": ["jetbrains.kotlin-server"]
    }
  }
}
```
