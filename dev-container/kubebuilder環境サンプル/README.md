# kubebuilder 環境サンプル

Kubernetes のカスタムコントローラーを実装するための kubebuilder を利用するためのサンプルです。

- json

```json
{
  "name": "first-kubebuilder",
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
        "[go]": {
          "editor.formatOnSave": true,
          "editor.rulers": [100]
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

- Dockerfile

```Dockerfile
FROM mcr.microsoft.com/devcontainers/go:1.23-bullseye

# kubebuilderインストール
RUN curl -L -o kubebuilder "https://github.com/kubernetes-sigs/kubebuilder/releases/download/v4.5.2/kubebuilder_linux_arm64"
RUN chmod +x ./kubebuilder
RUN mv ./kubebuilder /usr/local/bin/kubebuilder
```
