# JOSDK環境サンプル

cf. https://javaoperatorsdk.io/

[Java Operator SDK](https://javaoperatorsdk.io/)でKubernetesのカスタムコントローラーを実装するための環境サンプルです:

## 設定

### `devcontainer.json`

```json
{
  "name": "Java Operator SDK",
  "image": "mcr.microsoft.com/devcontainers/java:21-bookworm",
  "features": {
    "ghcr.io/devcontainers/features/java:1": {
      "version": "none",
      "installMaven": "true"
    },
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/mpriscella/features/kind:1": {},
    "ghcr.io/devcontainers-extra/features/kubectl-asdf:2": {},
    "ghcr.io/rio/features/kustomize:1": {}
  },
  "customizations": {
    "vscode": {
      "settings": {
        "editor.codeActionsOnSave": {
          "source.organizeImports": "always"
        },
        "editor.formatOnSave": true,
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
        },
        "vs-kubernetes": {
          "disable-linters": ["resource-limits"]
        }
      },
      "extensions": [
        "vscjava.vscode-java-pack",
        "ms-kubernetes-tools.vscode-kubernetes-tools",
        "ms-kubernetes-tools.kind-vscode",
        "redhat.vscode-yaml",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```
