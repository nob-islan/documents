# Kotlin環境サンプル

Kotlinでの環境サンプルです。最新のJDKだとKotlinのみ動かない場合があるので注意してください。Spring Bootでの開発を想定しています。`mvn`コマンドなどを利用する場合、Java向けの環境をそのまま利用してください。

## 設定

### `Dockerfile`

```Dockerfile
FROM eclipse-temurin:21-jdk

RUN apt update && apt install -y curl unzip
```

### `devcontainer.json`

```json
{
  "name": "Kotlin",
  "build": {
    "dockerfile": "Dockerfile"
  },
  "features": {
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
