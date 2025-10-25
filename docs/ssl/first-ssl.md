# はじめての SSL 通信

自己証明書を作ってみます。

- パッケージ版 nginx
- コンテナ版 nginx
- ローカル React
- ビルド React
- k8s nginx

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

#### docker-compose.yaml

```yaml
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

## Kubernetes クラスタ上の nginx サーバに https でアクセスできるようにする

### secret

各種証明書の内容について secret に転記します。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ssl-secret
data:
  server.crt: |
    LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tDQpNSUlEZnpDQ0F3U2dBd0lCQWdJU0ExNE1xa2hSeVNlNCtYbno0S1dKblhsa01Bb0dDQ3FHU000OUJBTURNREl4DQpDekFKQmdOVkJBWVRBbFZUTVJZd0ZBWURWUVFLRXcxTVpYUW5jeUJGYm1OeWVYQjBNUXN3Q1FZRFZRUURFd0pGDQpOakFlRncweU5EQTVNREV4TWpFM01ESmFGdzB5TkRFeE16QXhNakUzTURGYU1Cb3hHREFXQmdOVkJBTVREMjV2DQpZbWx6YkdGdUxtUmtieTVxY0RCWk1CTUdCeXFHU000OUFnRUdDQ3FHU000OUF3RUhBMElBQkQzY2RNN0dnRGQ5DQo0WkZNelJBRWRMekNodXUvaGlRRkFHMXZtSGtHT2lJenJmbjVTMHBsckV2QWpzVkZRNlp2Y0NubVhCdjZodFpCDQprdEFCSU9yZDAzT2pnZ0lRTUlJQ0REQU9CZ05WSFE4QkFmOEVCQU1DQjRBd0hRWURWUjBsQkJZd0ZBWUlLd1lCDQpCUVVIQXdFR0NDc0dBUVVGQndNQ01Bd0dBMVVkRXdFQi93UUNNQUF3SFFZRFZSME9CQllFRkhDbzZBdGZ6aEUzDQp3OGVtUmljdDM5YUYzcFJZTUI4R0ExVWRJd1FZTUJhQUZKTW5ScGdEcVZGb2pwald4RUpJMnlPL1dKVFNNRlVHDQpDQ3NHQVFVRkJ3RUJCRWt3UnpBaEJnZ3JCZ0VGQlFjd0FZWVZhSFIwY0RvdkwyVTJMbTh1YkdWdVkzSXViM0puDQpNQ0lHQ0NzR0FRVUZCekFDaGhab2RIUndPaTh2WlRZdWFTNXNaVzVqY2k1dmNtY3ZNQm9HQTFVZEVRUVRNQkdDDQpEMjV2WW1semJHRnVMbVJrYnk1cWNEQVRCZ05WSFNBRUREQUtNQWdHQm1lQkRBRUNBVENDQVFNR0Npc0dBUVFCDQoxbmtDQkFJRWdmUUVnZkVBN3dCMkFIYi9pRDhLdHZ1VlVjSmh6UFdIdWpTMHBNMjdLZHhvUWdxZjVtZE1XanAwDQpBQUFCa2EyNStxWUFBQVFEQUVjd1JRSWhBUFVOWlFDZUVNQnBCZFl1bWd4QjhkK1M2eUlwaTJNUTlLb0JSRzEzDQpFR1N5QWlBYmFKQW9CTjh2dkx3NXA2TE9BWnQ1WEpuWHNlS1BvbU5UcGZLeVNFY3BNZ0IxQUVpdzQydmFwa2MwDQpEK1ZxQXZxZE1Pc2NVZ0hMVnQwc2dkbTd2NnM1MklSekFBQUJrYTI1K21VQUFBUURBRVl3UkFJZ05vdmdVb0VTDQpzNm40d01GWHRQaFlRb2NYZkFPLzJ0U3EwSlZnQ3pvS3RGNENJRUFrcFZ2bGppTkNPZFE0RXRpNFZGc1gvbnduDQovand3Mlhnb0dlL2pvcjlpTUFvR0NDcUdTTTQ5QkFNREEya0FNR1lDTVFDOVNnRFNWWXFiQ05wMEE5a2ZiclQzDQprM3BIVGZ0MytjyamlIalo1eGhLK3lSSzRqMmRwU0FVcGp5QlVLcUpBMG1FQ01RRDN4NFkramJ6V28yamVHMU1YDQpBSVQ1M05RdzRyTEFpeWY1STJMMWtyaVZVeHlDTzdqTi9NTmU3cnE5RFNNdnFmST0NCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0=
  server.key: |
    LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tDQpNSUdIQWdFQU1CTUdCeXFHU000OUFnRUdDQ3FHU000OUF3RUhCRzB3YXdJQkFRUWduK2VtR0syMEFaUHNjUUlvDQpoYmpVRmZYNzFJelIrYVNRMUVVbURDVjhPeG1oUkFOQ0FBUTkzSFRPeG9BM2ZlR1JUTTBRQkhTOHdvYnJ2NFlrDQpCUUJ0YjVoNUJqb2lNNjM1K1V0S1pheEx3STdGUlVPbWIzQXA1bHdiK29iV1FaTFFBU0RxM2ROeg0KLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLQ==
```

### configMap

nginx の default.conf について configMap に記載します。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: default-conf-configmap
data:
  default.conf: |
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

### deployment

volume にて configMap を指定し、先に作成したファイルたちが Pod 内に配置されるようにします。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx-app
  template:
    metadata:
      labels:
        app: nginx-app
    spec:
      containers:
        - name: nginx-containers
          image: nginx
          imagePullPolicy: IfNotPresent
          volumeMounts:
            - mountPath: /etc/nginx/ssl
              name: ssl-volume
            - mountPath: /etc/nginx/conf.d/default.conf
              subPath: default.conf
              name: default-conf-volume
          ports:
            - containerPort: 443
      volumes:
        - name: ssl-volume
          secret:
            secretName: ssl-secret
        - name: default-conf-volume
          configMap:
            name: default-conf-configmap
```

### service

サービスです。443 ポートを開けます。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: NodePort
  ports:
    - name: "nginx-port"
      protocol: "TCP"
      port: 443
      nodePort: 30443
  selector:
    app: nginx-app
```
