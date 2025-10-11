# MkDocs 環境サンプル

[MkDocs](https://www.mkdocs.org/) によるドキュメント作成ができる環境を用意します。ベースイメージを python とし、必要なライブラリを `postcreate.sh` でインストールします。

## ディレクトリ構成

```
.devcontainer/
├── devcontainer.json
└── scripts
    └── postcreate.sh
```

## 設定

### devcontainer.json

```json
{
  "name": "test-page",
  "image": "mcr.microsoft.com/devcontainers/python:3",
  "postCreateCommand": "bash .devcontainer/scripts/postcreate.sh",
  "features": {},
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true
      },
      "extensions": ["esbenp.prettier-vscode"]
    }
  }
}
```

### postcreate.sh

```shell
#!/bin/bash

pip install mkdocs
pip install mkdocs-material
```
