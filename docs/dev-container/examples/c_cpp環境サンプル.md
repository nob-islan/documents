# C/C++環境サンプル

C/C++での開発環境サンプルです:

```json
{
  "name": "C/C++",
  "image": "mcr.microsoft.com/devcontainers/cpp:ubuntu-24.04",
  "features": {
    // "ghcr.io/devcontainers/features/docker-in-docker:4": {
    //   "moby": false
    // }
  },
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "files.insertFinalNewline": true,
        "files.trimFinalNewlines": true,
        "C_Cpp.clang_format_style": "{ BasedOnStyle: Google, IndentWidth: 4, AllowShortFunctionsOnASingleLine: None }",
        "[c]": {
          "editor.defaultFormatter": "ms-vscode.cpptools"
        },
        "[cpp]": {
          "editor.defaultFormatter": "ms-vscode.cpptools"
        }
      },
      "extensions": ["ms-vscode.cpptools-extension-pack"]
    }
  }
}
```
