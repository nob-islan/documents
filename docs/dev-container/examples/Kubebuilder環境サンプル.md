# Kubebuilder 環境サンプル

Kubernetes のカスタムコントローラーを実装するための Kubebuilder を利用するためのサンプルです。

## 設定

### devcontainer.json

```json
{
  "name": "Kubebuilder",
  "build": {
    "dockerfile": "Dockerfile"
  },
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/devcontainers-extra/features/kubectl-asdf:2": {},
    "ghcr.io/mpriscella/features/kind:1": {}
  },
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "[go]": {
          "editor.rulers": [100]
        },
        "[yaml]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        }
      },
      "extensions": [
        "golang.go",
        "ms-kubernetes-tools.vscode-kubernetes-tools",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```

### Dockerfile

```Dockerfile
FROM mcr.microsoft.com/devcontainers/go:1.24-bullseye

# Kubebuilderインストール
RUN curl -L -o kubebuilder "https://github.com/kubernetes-sigs/kubebuilder/releases/download/v4.9.0/kubebuilder_linux_arm64"
RUN chmod +x ./kubebuilder
RUN mv ./kubebuilder /usr/local/bin/kubebuilder
```
