# Java Operator SDK サンプル

Java Operator SDK で Kubernetes のカスタムコントローラーを実装するための環境サンプルです。

```json
{
  "name": "Java operator SDK",
  "image": "mcr.microsoft.com/devcontainers/java:1-17-bullseye",
  "features": {
    "ghcr.io/devcontainers/features/java:1": {
      "version": "none",
      "installMaven": "true",
      "installGradle": "false"
    },
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/devcontainers-extra/features/kubectl-asdf:2": {},
    "ghcr.io/mpriscella/features/kind:1": {}
  },
  "customizations": {
    "vscode": {
      "settings": {
        "java.inlayHints.parameterNames.enabled": "none",
        "java.compile.nullAnalysis.mode": "disabled",
        "java.configuration.updateBuildConfiguration": "interactive",
        "[java]": {
          "editor.tabSize": 4,
          "editor.insertSpaces": true,
          "editor.detectIndentation": false
        },
        "[yaml]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        }
      },
      "extensions": [
        "vscjava.vscode-java-pack",
        "vscjava.vscode-lombok",
        "esbenp.prettier-vscode",
        "ms-kubernetes-tools.vscode-kubernetes-tools"
      ]
    }
  }
}
```
