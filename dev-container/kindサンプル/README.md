# kind サンプル

kind 環境構築のためのサンプルソースです。

## ディレクトリ構成

```
kind/
  ├─.devcontainer/
  │    ├─devcontainer.json
  │    └─Dockerfile
  └─materials/
```

## 設定

### devcontainer.json

```json
{
  "name": "kind",
  "build": {
    "dockerfile": "Dockerfile"
  },
  "workspaceFolder": "/workspaces/kind/materials",
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
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

`debian`をベースイメージとし、`kubectl`および`kind`コマンドをインストールします。

```Dockerfile
FROM mcr.microsoft.com/devcontainers/base:dev-debian

RUN apt update && apt install curl
RUN curl -LO https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl
RUN chmod +x ./kubectl
RUN mv ./kubectl /usr/local/bin/kubectl
RUN curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.18.0/kind-linux-amd64
RUN chmod +x ./kind
RUN mv ./kind /usr/local/bin/kind
```
