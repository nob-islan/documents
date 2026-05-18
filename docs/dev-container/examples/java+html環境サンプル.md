# Java + html環境サンプル

Thymeleafを用いてJava APIおよびWebページを開発するための環境サンプルです:

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
    // "ghcr.io/devcontainers/features/docker-in-docker:3": {}
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
        "[html]": {
          "editor.tabSize": 2,
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        },
        "[javascript]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        },
        "[css]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        }
      },
      "extensions": [
        "vscjava.vscode-java-pack",
        "vmware.vscode-boot-dev-pack",
        "vscjava.vscode-lombok",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```
