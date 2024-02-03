# kind サンプル

kind 環境構築のためのサンプルソースです。

## ディレクトリ構成

```
.devcontainer/
  ├─devcontainer.json
  ├─docker-compose.yml
  └─Dockerfile
```

## 設定

### devcontainer.json

```json
{
  "name": "kind",

  "dockerComposeFile": "./docker-compose.yml",
  "service": "nob-kind",
  "workspaceFolder": "/workspace",

  "customizations": {
    "vscode": {
      "extensions": [
        "ms-kubernetes-tools.vscode-kubernetes-tools",
        "ms-kubernetes-tools.kind-vscode",
        "redhat.vscode-yaml"
      ]
    }
  }
}
```

### Dockerfile

`dind`をベースイメージとし、`kubectl`および`kind`コマンドをインストールします。

```Dockerfile
FROM docker:dind

RUN mkdir /nob

RUN apk update && apk add curl kubectl
RUN curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.14.0/kind-linux-amd64
RUN chmod +x ./kind
RUN mv ./kind /usr/local/bin/kind
```

### docker-compose.yml

Dockerfile をビルドし、特権ユーザでコンテナを起動します。

```yml
version: "3.7"
services:
  nob-kind:
    container_name: nob-kind
    build: .
    privileged: true
```
