# eks クライアントサンプル

`kubectl`, `aws`, `eksctl` コマンドを叩ける環境を用意します:

```json
{
  "name": "EKS client",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "features": {
    "ghcr.io/devcontainers-extra/features/kubectl-asdf:2": {},
    "ghcr.io/devcontainers/features/aws-cli:1": {},
    "ghcr.io/CASL0/devcontainer-features/eksctl:1": {}
  },
  "customizations": {
    "vscode": {
      "settings": {
        "[yaml]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        }
      },
      "extensions": [
        "ms-kubernetes-tools.vscode-kubernetes-tools",
        "redhat.vscode-yaml",
        "amazonwebservices.aws-toolkit-vscode",
        "vscode-aws-console.vscode-aws-console",
        "mark-tucker.aws-cli-configure",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```
