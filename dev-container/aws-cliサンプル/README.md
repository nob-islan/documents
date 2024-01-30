# aws-cli サンプル

`aws`コマンドを実行する環境を用意するための devcontainer サンプルです。VSCode の拡張機能をいくつか併せてインストールします。

## 設定ファイル

`.devcontainer`配下に下記で`devcontainer.json`を作成します。

```json
{
  "name": "aws cli",

  "image": "ubuntu:22.04",

  "features": {
    "ghcr.io/devcontainers/features/aws-cli:1": {}
  },

  "customizations": {
    "vscode": {
      "extensions": [
        "amazonwebservices.aws-toolkit-vscode",
        "vscode-aws-console.vscode-aws-console",
        "mark-tucker.aws-cli-configure"
      ]
    }
  }
}
```
