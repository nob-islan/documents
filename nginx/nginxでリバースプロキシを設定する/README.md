# nginx でリバースプロキシを設定する

nginx 経由でサービスにアクセスする構成を取る際の設定です。

```conf
server {
    server_name  {IPアドレス};
    listen 443 ssl;
    ssl_certificate     /etc/nginx/ssl/server.crt; // 証明書のパス
    ssl_certificate_key /etc/nginx/ssl/server.key; // 鍵のパス
    location / {
        proxy_pass http://localhost:8080/; // フォワード先
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Accept-Encoding gzip;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
    }
}
```
