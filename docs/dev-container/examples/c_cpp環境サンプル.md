# C/C++環境サンプル

C/C++での開発環境サンプルです。`C_Cpp.clang_format_style`の設定項目については[Clang-Format Style Options](https://clang.llvm.org/docs/ClangFormatStyleOptions.html)を参照ください:

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
        "C_Cpp.clang_format_style": "{ BasedOnStyle: Google, IndentWidth: 4, AllowShortFunctionsOnASingleLine: None, PointerAlignment: Left }",
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
