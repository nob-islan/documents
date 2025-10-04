# Docker で Portainer を構築

## Portainer 起動

下記`docker-compose.yaml`を記述して起動します。

```yaml
services:
  portainer:
    container_name: nob-portainer
    image: portainer/portainer-ce:latest
    ports:
      - 9000:9000
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./volumes/data:/data
```

`http://localhost:9000`にアクセスすると admin のパスワード設定画面に遷移します。
