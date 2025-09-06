# kind サンプル

kind 環境構築のためのサンプルソースです。

## 設定

### devcontainer.json

```json
{
  "name": "kind",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/mpriscella/features/kind:1": {},
    "ghcr.io/devcontainers-extra/features/kubectl-asdf:2": {},
    "ghcr.io/rio/features/kustomize:1": {}
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
