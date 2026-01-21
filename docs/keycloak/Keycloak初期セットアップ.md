# Keycloak初期セットアップ

[Keycloak](https://www.keycloak.org/)の初期セットアップを行います。

## 事前準備

- OpenJDKを用意してください。
- データベースを別途用意し、ユーザおよび空のデータベースを作成しておいてください。

## インストール

cf. https://www.keycloak.org/getting-started/getting-started-zip

- Keycloakをダウンロードします:

```shell
wget https://github.com/keycloak/keycloak/releases/download/26.5.0/keycloak-26.5.0.zip
```

- zipファイルを解凍します:

```shell
unzip keycloak-26.5.0.zip
```

- `conf/keycloak.conf`を下記で作成します:

```conf
# Basic settings for running in production. Change accordingly before deploying the server.

# Database

# The database vendor.
db=mariadb

# The username of the database user.
db-username=root

# The password of the database user.
db-password=password

# The full database JDBC URL. If not provided, a default URL is set based on the selected database vendor.
db-url=jdbc:mariadb://localhost/keycloak

# Observability

# If the server should expose healthcheck endpoints.
#health-enabled=true

# If the server should expose metrics endpoints.
#metrics-enabled=true

# HTTP

# The file path to a server certificate or certificate chain in PEM format.
#https-certificate-file=${kc.home.dir}/conf/server.crt.pem

# The file path to a private key in PEM format.
#https-certificate-key-file=${kc.home.dir}/conf/server.key.pem

# The proxy address forwarding mode if the server is behind a reverse proxy.
#proxy=reencrypt

# Enables the HTTP listener.
http-enabled=true

# Do not attach route to cookies and rely on the session affinity capabilities from reverse proxy
#spi-sticky-session-encoder-infinispan-should-attach-route=false

# Hostname for the Keycloak server.
hostname=localhost
```

- 設定を反映させます:

```shell
bin/kc.sh build
```

- サーバを起動します:

```shell
bin/kc.sh start
```

起動後、http://localhost:8080 でadmin画面を開くことができます。
