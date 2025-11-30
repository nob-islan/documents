# nginx でパスベースルーティングをする

下記の要領で `/etc/nginx/conf.d/easyapp.conf` を作成するとリクエストをルーティングできます:

```conf
server {
    listen 80 default_server;

    location /api/ {
        # APIへのリクエストについては8080に転送
        proxy_pass http://localhost:8080;
    }

    location / {
        # それ以外（画面想定）については3000に転送
        proxy_pass http://localhost:3000;
    }
}
```
