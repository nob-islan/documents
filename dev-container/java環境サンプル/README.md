# Java 環境サンプル

Java 環境構築のためのサンプルソースです。

## ディレクトリ構成

いつもの java プロジェクトに`.devcontainer`ディレクトリを下記要領で追加します。

```
root/
  └─.devcontainer/
       └─devcontainer.json
```

## 設定

各種ファイルの設定内容です。

### .devcontainer

#### devcontainer.json

開発コンテナのイメージなど、起動向けの設定を記載するファイルです。

```json
{
  "name": "Java",
  "image": "mcr.microsoft.com/devcontainers/java:1-17-bullseye",
  "features": {
    // "ghcr.io/devcontainers/features/java:1": {
    //   "version": "none",
    //   "installMaven": "true",
    //   "installGradle": "false"
    // },
    // "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "customizations": {
    "vscode": {
      "settings": {
        "java.inlayHints.parameterNames.enabled": "none",
        "java.compile.nullAnalysis.mode": "disabled",
        "java.configuration.updateBuildConfiguration": "interactive",
        "[java]": {
          "editor.tabSize": 4,
          "editor.insertSpaces": true,
          "editor.detectIndentation": false
        }
      },
      "extensions": [
        "vscjava.vscode-java-pack",
        "vmware.vscode-boot-dev-pack",
        "vscjava.vscode-lombok",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```
