# Kindサンプル

[kind](https://kind.sigs.k8s.io/)でKubernetesクラスタを構築するための環境のサンプルです:

## 設定

### `devcontainer.json`

```json
{
  "name": "Kind",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:3": {},
    "ghcr.io/devcontainers-extra/features/kind:1": {},
    "ghcr.io/devcontainers-extra/features/kubectl-asdf:2": {},
    "ghcr.io/audacioustux/devcontainers/kustomize:1": {}
  },
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "[yaml]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        },
        "vs-kubernetes": {
          "disable-linters": ["resource-limits"]
        }
      },
      "extensions": [
        "ms-kubernetes-tools.vscode-kubernetes-tools",
        "ms-kubernetes-tools.kind-vscode",
        "redhat.vscode-yaml",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```
