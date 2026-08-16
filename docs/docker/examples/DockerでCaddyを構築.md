# DockerでCaddyを構築

[Caddy](https://caddyserver.com/)でリバースプロキシサーバを構築します。ドメインを持っていれば、自動でLet's Encryptから証明書を取得してくれます。

## 設定

- `docker-compose.yaml`

```yaml
services:
  caddy:
    image: caddy:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./volumes/Caddyfile:/etc/caddy/Caddyfile
    # depends_on:
    #   - code-server
```

- `Caddyfile`

```
code-server.local {
    reverse_proxy code-server:8080
}
```
