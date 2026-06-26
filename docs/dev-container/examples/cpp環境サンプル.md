# C++環境サンプル

C++での開発環境サンプルです:

```json
{
  "name": "C++",
  "image": "mcr.microsoft.com/devcontainers/cpp:ubuntu-24.04",
  "features": {
    // "ghcr.io/devcontainers/features/docker-in-docker:4": {}
  },
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "C_Cpp.clang_format_style": "{ BasedOnStyle: Google, IndentWidth: 4 }"
      },
      "extensions": ["ms-vscode.cpptools-extension-pack"]
    }
  }
}
```
