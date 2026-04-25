# PlantUML環境サンプル

PlantUML向けの`.pu`ファイルをプレビューするための環境サンプルです:

## 設定

### `.devcontainer.json`

```json
{
  "name": "PlantUML",
  "build": {
    "dockerfile": "Dockerfile"
  },
  "features": {},
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true
      },
      "extensions": ["jebbs.plantuml"]
    }
  }
}
```

### `Dockerfile`

```Dockerfile
FROM mcr.microsoft.com/devcontainers/java:25-bookworm

RUN apt update && apt install -y graphviz && apt install -y fonts-noto
```
