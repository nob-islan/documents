# Dockerでcloudflaredを構築

## 設定

下記例ではnginxにHTTPS通信する一時URLを発行します。

```yaml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    command: ["tunnel", "--protocol", "http2", "--url", "http://nginx:80"]
  nginx:
    image: nginx:stable
    container_name: nginx
```
