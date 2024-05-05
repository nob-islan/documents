# Java 環境サンプル

Java 環境構築のためのサンプルソースです。

## ディレクトリ構成

いつもの java プロジェクトに`.devcontainer`ディレクトリを下記要領で追加します。

```
root/
  ├─.devcontainer/
  │    └─devcontainer.json
  └─.vscode/
       └─settings.json
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
  "features": {},
  "customizations": {
    "vscode": {
      "extensions": [
        "vscjava.vscode-java-pack",
        "vmware.vscode-boot-dev-pack",
        "vscjava.vscode-lombok",
        "arjun.swagger-viewer",
        "shd101wyy.markdown-preview-enhanced",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```

必要に応じて、下記の要領で feature を追加してください。

```json
  "features": {
    "ghcr.io/devcontainers/features/java:1": {
      "version": "none",
      "installMaven": "true", // mvnコマンドを使えるようにする
      "installGradle": "false"
    },
    "ghcr.io/devcontainers/features/docker-in-docker:2": {} // dockerコマンドを叩けるようにする
  },
```

### vscode

#### settings.json

VSCode の設定ファイルです。

```json
{
  "java.inlayHints.parameterNames.enabled": "none",
  "java.compile.nullAnalysis.mode": "disabled",
  "java.configuration.updateBuildConfiguration": "interactive"
}
```
