# Docker で OpenVSCode Server を構築

## 構築

### 起動

`docker-compose.yaml`を下記で作成します:

```yaml
services:
  openvscode:
    container_name: nob-openvscode
    image: gitpod/openvscode-server:1.92.1
    ports:
      - 3000:3000
    volumes:
      - ./volumes:/home/workspace
```

`{サーバのアドレス}:3000`にアクセスすると VSCode の画面が表示されます。

### https で通信を行う

http 通信だと markdown のプレビューができないなど不都合があるので、自己証明書を発行してリバースプロキシ経由で https 通信をできるようにします。ここでは例としてパッケージ版の nginx サーバを立ててプロキシサーバとします。

#### nginx インストール

```shell
sudo apt update

sudo apt install nginx
```

#### 証明書作成

```shell
# 保管用ディレクトリ作成
sudo mkdir -p /etc/nginx/ssl

# 秘密鍵を作成
sudo openssl genrsa -out /etc/nginx/ssl/server.key 2048

# CSRを作成
sudo openssl req -new -key /etc/nginx/ssl/server.key -out /etc/nginx/ssl/server.csr

# SSLサーバ証明書を作成
sudo openssl x509 -days 3650 -req -signkey /etc/nginx/ssl/server.key -in /etc/nginx/ssl/server.csr -out /etc/nginx/ssl/server.crt
```

#### nginx の設定変更

`/etc/nginx/conf.d/ssl.conf`を下記で作成します:

```conf
server {
    listen 443 ssl;
    ssl_certificate     /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;

    location / {
        # WEBリクエストをローカルホスト3000番ポートへリダイレクト
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket のための設定
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

nginx の再起動後、http://localhost:443 で VSCode にアクセスでき、markdown のプレビューなどが利用できるようになっています。
