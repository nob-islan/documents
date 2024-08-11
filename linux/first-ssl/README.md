# はじめての SSL 通信

オレオレ証明書を作ってみます。

- [パッケージ版 nginx](#パッケージ版-nginx-サーバに-https-でアクセスできるようにする)
- [コンテナ版 nginx](#コンテナ版-nginx-サーバに-https-でアクセスできるようにする)
- [ローカル React](#ローカルの-react-web-サーバに-https-でアクセスできるようにする)
- [ビルド React](#ビルドした-react-web-サーバに-https-でアクセスできるようにする)
- [k8s nginx](#kubernetes-クラスタ上の-nginx-サーバに-https-でアクセスできるようにする)

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

## Kubernetes クラスタ上の nginx サーバに https でアクセスできるようにする

### configMap

各種証明書の内容について configMap に転機します。

```yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ssl-configmap
data:
  server.crt: |
    -----BEGIN CERTIFICATE-----
    MIIDETCCAfkCFCRzH0WX+oouDs2Ii5LQUeQVGf47MA0GCSqGSIb3DQEBCwUAMEUx
    CzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRl
    cm5ldCBXaWRnaXRzIFB0eSBMdGQwHhcNMjQwODExMTkyNjM1WhcNMzQwODA5MTky
    NjM1WjBFMQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UE
    CgwYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOC
    AQ8AMIIBCgKCAQEAp38OAkBK9M8yhCY5IAPKP+bpDpRnoqp6nkE6SpaPGM/Hx/fr
    McnPAJmXsI9UCMpCEQYrhqbnM2tu8glXNpOhbg0ql1+6M5vEohBGNrpkY+gYtZaK
    +TrTXj9WMzGPsVso1ZhOZAtKcojE8bCd1KlfbDdTEpLeohkfBWv4F/usNJCdGm6D
    Oqcm4415jbPdcTXThNbKaXrR3bbSmmCDx6QtOTCxzzTS2lNDjbnF6K9N17iEB6y9
    fOWWhcTUsRqRgPpEx6tbn682ci67T5pNut6+IOjainiOtpzGvnbdcZm8dg/3lVZu
    z97PUXj0G7RClRctwH2neYu5m6C+JY5FCnmNVQIDAQABMA0GCSqGSIb3DQEBCwUA
    A4IBAQAAESSxgcfQ9OAgMdSRyXfH7V68OtKLKCAteYmZQ7bNKcm2tb+TSpXMJn5V
    yvVbn8Kcx7NDoAFTGGsLinKzE0ilJb07+3xROKXWe2F3XwVKlTfCrYUIpyPJmPhm
    vnliC4usCG8/3qUI279zpG5SnTxwpGdjY621zrSTOsIZDv3mfwp0rbomWouH5jqk
    MfFGwm4zWYOexJB+bKVXrYlrXE/FBAvHDgQkGxVTGmogPiZtiwntVUStRkYjgld0
    UCdEoNngkRGOwG67g6w1cOTW1L7yva+LL22UnoRwAkbASypiRrweswmXvPEBCEi0
    SXCtBy/YZ4FemxJV8cmGdk67SqRg
    -----END CERTIFICATE-----
  server.csr: |
    -----BEGIN CERTIFICATE REQUEST-----
    MIICijCCAXICAQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUx
    ITAfBgNVBAoMGEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDCCASIwDQYJKoZIhvcN
    AQEBBQADggEPADCCAQoCggEBAKd/DgJASvTPMoQmOSADyj/m6Q6UZ6Kqep5BOkqW
    jxjPx8f36zHJzwCZl7CPVAjKQhEGK4am5zNrbvIJVzaToW4NKpdfujObxKIQRja6
    ZGPoGLWWivk6014/VjMxj7FbKNWYTmQLSnKIxPGwndSpX2w3UxKS3qIZHwVr+Bf7
    rDSQnRpugzqnJuONeY2z3XE104TWyml60d220ppgg8ekLTkwsc800tpTQ425xeiv
    Tde4hAesvXzlloXE1LEakYD6RMerW5+vNnIuu0+aTbreviDo2op4jracxr523XGZ
    vHYP95VWbs/ez1F49Bu0QpUXLcB9p3mLuZugviWORQp5jVUCAwEAAaAAMA0GCSqG
    SIb3DQEBCwUAA4IBAQBFDGNVWE6rqGk/ufK4yxybYCvvX8m0SxwnQdlkjbQJM+in
    j7BcIrL8ciJvY0Fyhj4p7/oTuJJV7x1IzgicxhZPN7rVqyuqJfKTr+eQyUBmwezR
    E2DgkYHSh217dn/3iLhE1eY/rIgScT/sMkvdvb3HYOydE3+XKB+ZM2IkIUuru01e
    srr/VmZcH3K0a+kiFGW4zq/JXG1B1vbIgW1H54UcpNNjyiigZACrhRuS84pczk9K
    YwG94YTMDlV7GPixqHzF0m6QHXtBCuSAh4+JLdX4fa0P1PUYLI2eZNIVH3oB6h3w
    hmFtv7CRJ611s7G9e/a7oDf97CT46/8r81tEi/ql
    -----END CERTIFICATE REQUEST-----
  server.key: |
    -----BEGIN PRIVATE KEY-----
    MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCnfw4CQEr0zzKE
    JjkgA8o/5ukOlGeiqnqeQTpKlo8Yz8fH9+sxyc8AmZewj1QIykIRBiuGpucza27y
    CVc2k6FuDSqXX7ozm8SiEEY2umRj6Bi1lor5OtNeP1YzMY+xWyjVmE5kC0pyiMTx
    sJ3UqV9sN1MSkt6iGR8Fa/gX+6w0kJ0aboM6pybjjXmNs91xNdOE1sppetHdttKa
    YIPHpC05MLHPNNLaU0ONucXor03XuIQHrL185ZaFxNSxGpGA+kTHq1ufrzZyLrtP
    mk263r4g6NqKeI62nMa+dt1xmbx2D/eVVm7P3s9RePQbtEKVFy3Afad5i7mboL4l
    jkUKeY1VAgMBAAECggEABWk2LpvK5K88dMtgmv0OpEWgzXL0G2u2jQKcFKbaAWDf
    A1QqH3u+stGn/3WV5e7wyYQT1T/gb0daeExMc5Tf23ALGBbf2QUJnGmxG5BKulDO
    /0HrqMeZeNIVM+r3NygYgN0eWcNAVERlNBd8CBjoObmRZJF3SrCnbMqFdam+Q2X6
    wTi4z+GznBtbXszt7/zSJwJMqI+tM89qQv9t5R4WxTz9SPgG7EzZEC2tSoOarqVi
    vJWPw2FV4vR6FHFGENJVSLaisk8BlVF6qmnlUt5qyDFtb5AE+LkcFETdJO87QG10
    uBGV5ArKuvVPagkPNbKzesPA1Mhcab95r3vdWet0GQKBgQDcvrLQezNIBSrKRDHb
    z0lzeAl5TXdK1NyBHviTJG2gAwbkg8r7CjeuzDRH+6MAZ0Rm8EECOSZs+kAQJb77
    9WZ1M6jTAsqXMDhxFG0ZCtN6/tXcKQHgEobOyjGAvBkIyAPqDvLJlN27lZHy2Fh6
    O/4mqCZhxag3u/XHOOgZUuJimQKBgQDCP0ByU3/MkILeSXnVRDnFK0QATp+8Yslx
    Hckb0gOCLoBQcy21jeHed9Znycvpq77vjH3W/L1zPhR9MlWEC0s20lARmG77+Cg4
    r3kEYmm2sqaoxg212FDccpU2JN484w5y+F8dscyLj7Ygk80EMRXhNIMTSQB/xB8G
    lEwBQjayHQKBgBJ+u9ax69sF687kpdTH6lyNWyXZsrwHV65N3P/fFnxIpKQy0qfz
    9DRmEZ9SWxbmkBmb2aaJCUoqMYHo17aemgYJ3QRJAJZoSOJYlsd5W7y7a0m1+d0/
    UCI1WK5zlBljQMi0le0D1wwnfQH+1HLxYdr1Tbn1aKG60t3tS60Lf8JJAoGAeabL
    Yc5Rd3f5veUeXCZCV+1kxRx4ha8IocMZtEau09Tzn27C7bVSA9XhfVawUkOxbKz8
    EqxuqcHzawUe8XdxP4AvjRV+TGd6KSYcEFbiBf2UypZe98flvGo2cJZeaJt67R4H
    070KcU0rrvNhroJfRY9xl55cpafaFnDBuPgS8TECgYEArpxwkGPzO5xr1+caGEsz
    jNr/+XL+3D9bLXTDidIgqhtO3X/o9o7SEQBnPPNcCt+tdfDLHnAQ2lceXM51DkLI
    z+CmYNZEiLusVLvTyVtPtwnBcjQZefMFzaGOzAwDfefiQ+Ln7C17f1rwHYl7Xb1V
    SqaiBl1RqxKugtTT9drPag0=
    -----END PRIVATE KEY-----
```

nginx の default.conf についても configMap に記載します。

```yml
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

```yml
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
          configMap:
            name: nginx-ssl-configmap
        - name: default-conf-volume
          configMap:
            name: nginx-default-conf-configmap
```

### service

サービスです。443 ポートを開けます。

```yml
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
