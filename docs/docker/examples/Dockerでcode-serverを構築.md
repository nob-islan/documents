# Dockerでcode-serverを構築

cf.

- https://github.com/coder/code-server
- https://github.com/coder/code-server/pkgs/container/code-server

## 構築

### 起動

`docker-compose.yaml`を下記で作成します:

```yaml
services:
  code-server:
    image: ghcr.io/coder/code-server:latest
    container_name: code-server
    ports:
      - 8080:8080
    # volumes:
    #   - ./volumes/config.yaml:/home/coder/.config/code-server/config.yaml
```

http://localhost:8080 にアクセスするとVSCodeの画面が表示されます。

認証向けのパスワードは下記コマンドで確認できます:

```shell
docker exec -it code-server grep "password:" /home/coder/.config/code-server/config.yaml
```
