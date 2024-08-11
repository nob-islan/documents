# はじめての SSL 通信

オレオレ証明書を作ってみます。

- [パッケージ版 nginx](#パッケージ版-nginx-サーバに-https-でアクセスできるようにする)
- [コンテナ版 nginx](#コンテナ版-nginx-サーバに-https-でアクセスできるようにする)
- [ローカル React](#ローカルの-react-web-サーバに-https-でアクセスできるようにする)
- [ビルド React](#ビルドした-react-web-サーバに-https-でアクセスできるようにする)

## パッケージ版 nginx サーバに https でアクセスできるようにする

### nginx インストール

Linux 上に nginx パッケージをインストールして Web サーバを起動します。

```shell
# パッケージ更新
sudo apt update

# nginxインストール
sudo apt install nginx

# nginx起動
sudo systemctl start nginx

# リブート後に自動で起動するようにする
sudo systemctl enable nginx
```

### 証明書の作成

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

### nginx の設定ファイルを追加

`/etc/nginx/conf.d/ssl.conf`を下記で作成します。

```conf
server {
    listen 443 ssl;
    ssl_certificate     /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
}
```

### 再起動

```shell
# nginx再起動
sudo systemctl restart nginx
```

nginx 再起動後、`https:{サーバのアドレス}:443`で nginx のページにアクセスできるようになっています。

## コンテナ版 nginx サーバに https でアクセスできるようにする

### 設定ファイル作成

#### 証明書

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

#### nginx 設定ファイル

`/etc/nginx/conf.d/default.conf`を下記で作成します:

```conf
server {
    listen       443 ssl; # SSL向け設定
    server_name  localhost;

    ssl_certificate     /etc/nginx/ssl/server.crt; # SSL向け設定
    ssl_certificate_key /etc/nginx/ssl/server.key; # SSL向け設定

    #access_log  /var/log/nginx/host.access.log  main;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    # proxy the PHP scripts to Apache listening on 127.0.0.1:80
    #
    #location ~ \.php$ {
    #    proxy_pass   http://127.0.0.1;
    #}

    # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
    #
    #location ~ \.php$ {
    #    root           html;
    #    fastcgi_pass   127.0.0.1:9000;
    #    fastcgi_index  index.php;
    #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
    #    include        fastcgi_params;
    #}

    # deny access to .htaccess files, if Apache's document root
    # concurs with nginx's one
    #
    #location ~ /\.ht {
    #    deny  all;
    #}
}
```

#### docker-compose.yml

```yml
services:
  nginx:
    image: nginx:latest
    container_name: nob-nginx
    ports:
      - 443:443
    volumes:
      - "/etc/nginx/ssl/:/etc/nginx/ssl/"
      - "/etc/nginx/conf.d/default.conf:/etc/nginx/conf.d/default.conf"
```

### 起動

`docker compose up -d`で起動後、`https://{サーバのIPアドレス}:443`で nginx のページにアクセスできます。

## ローカルの React Web サーバに https でアクセスできるようにする

プロジェクトのルートディレクトリに`.env.local`ファイルを作成します（`.env`以降は多分なんでも良い）:

```
HTTPS=true
SSL_CRT_FILE=ssl/server.crt
SSL_KEY_FILE=ssl/server.key
```

`SSL_CRT_FILE`および`SSL_KEY_FILE`は省略しても大丈夫です。

`npm start`で起動すると`https://localhost:3000`にアクセスできます。

## ビルドした React Web サーバに https でアクセスできるようにする

### .env ファイル作成

ローカルの時と同様に、ルートディレクトリに下記を配置します:

```
HTTPS=true
SSL_CRT_FILE=ssl/server.crt
SSL_KEY_FILE=ssl/server.key
```

### 証明書

上記.env ファイルと平仄を合わせる形で、プロジェクトのルートに`ssl`ディレクトリを作成し、各種証明書を配置します:

```
$ ls easyweb/ssl/
server.crt  server.csr  server.key
```

### package.json 追記

あらかじめ`npm install dotenv-cli`を実行しておき、`build-local`コマンドを下記で追加します:

```json
  "scripts": {
    "build-local": "dotenv -e .env.local react-scripts build",
    // 省略
  }
```

### ビルド

```shell
npm run build-local
```

### 起動

```shell
serve -s --ssl-cert ssl/server.crt --ssl-key ssl/server.key  build/
```
