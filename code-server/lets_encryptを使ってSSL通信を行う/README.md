# Let's Encrypt を使って SSL 通信を行う

Let's Encrypt を使って、取得したドメインに対して SSL 通信を行います。

cf. https://coder.com/docs/code-server/guide#using-lets-encrypt-with-nginx

## 設定手順

code-server 起動後、下記の設定を行います:

- 必要パッケージをインストール

```shell
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

- `/etc/nginx/sites-available/code-server`ファイルを下記で作成します:

```config
server {
    listen 80;
    listen [::]:80;
    server_name ${取得したドメイン};

    location / {
      proxy_pass http://localhost:8080/;
      proxy_set_header Host $http_host;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection upgrade;
      proxy_set_header Accept-Encoding gzip;
    }
}
```

- 設定を適用します:

```shell
cd /etc/nginx/sites-available/
sudo ln -s ../sites-available/code-server /etc/nginx/sites-enabled/code-server
sudo certbot --non-interactive --redirect --agree-tos --nginx -d ${取得したドメイン} -m ${ドメインに紐づくメールアドレス}
```

適用後`https://${取得したドメイン}`にアクセスできます。
