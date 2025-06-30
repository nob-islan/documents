# eks クライアントサンプル

`aws`, `eksctl`, `kubectl` コマンドを叩ける環境を用意します:

```json
{
  "name": "eks client",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "features": {
    "ghcr.io/devcontainers/features/aws-cli:1": {},
    "ghcr.io/devcontainers-extra/features/kubectl-asdf:2": {},
    "ghcr.io/CASL0/devcontainer-features/eksctl:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "amazonwebservices.aws-toolkit-vscode",
        "vscode-aws-console.vscode-aws-console",
        "mark-tucker.aws-cli-configure",
        "ms-kubernetes-tools.vscode-kubernetes-tools",
        "redhat.vscode-yaml"
      ]
    }
  }
}
```
