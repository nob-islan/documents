# Java環境サンプル

Javaでの開発環境のサンプルです:

```json
{
  "name": "Java",
  "image": "mcr.microsoft.com/devcontainers/java:25-bookworm",
  "features": {
    // "ghcr.io/devcontainers/features/java:1": {
    //   "version": "none",
    //   "installMaven": "true",
    //   "installGradle": "false"
    // },
    // "ghcr.io/devcontainers/features/docker-in-docker:4": {
    //   "moby": false
    // }
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
        }
      },
      "extensions": [
        "vscjava.vscode-java-pack",
        "vmware.vscode-boot-dev-pack",
        "vscjava.vscode-lombok"
      ]
    }
  }
}
```
