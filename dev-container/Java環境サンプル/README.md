# Java 環境サンプル

Java 環境構築のためのサンプルソースです。

## ディレクトリ構成

いつもの java プロジェクトに`.devcontainer`ディレクトリを下記要領で追加します。

```
.devcontainer/
  ├─devcontainer.json
  ├─Dockerfile
  └─materials/
      └─settings.xml
```

## 設定

各種ファイルの設定内容です。

### devcontainer.json

開発コンテナのイメージなど、起動向けの設定を記載するファイルです。

```json
// For format details, see https://aka.ms/devcontainer.json. For config options, see the
// README at: https://github.com/devcontainers/templates/tree/main/src/java
{
  "name": "Java",
  "build": {
    "dockerfile": "Dockerfile" // 後述のDockerfileに従って起動する
  },
  "features": {
    "ghcr.io/devcontainers/features/java:1": {
      "version": "none",
      "installMaven": "true", // mvnコマンドを使えるようにする
      "installGradle": "false"
    }
  }
}
```

### Dockerfile

開発コンテナのイメージを指定するなど、コンテナの元となるファイルです。

```Dockerfile
# microsoftから提供されているJava開発環境用イメージ
FROM mcr.microsoft.com/devcontainers/java:1-17-bookworm

# mavenの設定ファイルをコンテナにコピーする
COPY materials/settings.xml /home/vscode/.m2/settings.xml
```

### materials

Dockerfile における`COPY`でコンテナに配置することなどを想定したファイル群です。

#### settings.xml

maven 向けの設定ファイルです。

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
                        http://maven.apache.org/xsd/settings-1.0.0.xsd">
    <localRepository>
        /home/vscode/.m2-nob <!-- ローカルリポジトリの場所を変更（ほぼ動作確認用） -->
    </localRepository>
    <interactiveMode/>
    <usePluginRegistry/>
    <offline/>
    <pluginGroups/>
    <servers/>
    <mirrors/>
    <proxies/>
    <profiles/>
    <activeProfiles/>
</settings>
```
