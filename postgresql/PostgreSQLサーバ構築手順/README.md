# PostgreSQL サーバ構築手順

PostgreSQL をインストールして、外部サーバから接続する設定を入れます。

## スペック

- Ubuntu20.04.1 LTS

## インストール手順

cf. https://www.postgresql.org/download/linux/ubuntu/

リモートリポジトリの URL を登録

```
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
```

公開鍵をダウンロード

```
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
```

パッケージリストを更新

```
sudo apt-get update
```

PostgreSQL インストール

```
sudo apt-get install postgresql
```

バージョン指定する際は`postgresql-12`のようにしてください。

## 諸設定

### データベース作成

postgres ユーザになる

```
sudo su - postgres
```

postgreSQL に接続

```
psql
```

データベース`nob_db`作成

```
CREATE DATABASE nob_db;
```

### ユーザの作成

`postgres`ユーザの権限で`postgres`データベースに接続

```
sudo -u postgres psql
```

ロール情報の確認

```
SELECT * FROM pg_shadow;
```

ユーザ`nob1`作成

```
CREATE USER nob1;
```

パスワード設定

```
ALTER ROLE nob1 PASSWORD 'password';
```

### 外部からの接続設定

#### 設定ファイルの変更

##### postgresql.conf

postgresql.conf の場所を探します。

```
find / -name postgresql.conf 2> /dev/null
```

vim などのエディタでファイルを編集します。

```postgresql.conf
#------------------------------------------------------------------------------
# CONNECTIONS AND AUTHENTICATION
#------------------------------------------------------------------------------

# - Connection Settings -

#listen_addresses = 'localhost'         # what IP address(es) to listen on;
                                        # comma-separated list of addresses;
                                        # defaults to 'localhost'; use '*' for all
                                        # (change requires restart)
port = 5432                             # (change requires restart)
```

について、リッスンする IP アドレスを変更する。基本的にワイルドカードで OK だが、特定のインターフェースでのみ DB 接続を許可したい場合は該当インターフェースの IP アドレスを入力する。

```postgresql.conf
#------------------------------------------------------------------------------
# CONNECTIONS AND AUTHENTICATION
#------------------------------------------------------------------------------

# - Connection Settings -

listen_addresses = '*'                  # what IP address(es) to listen on;
                                        # comma-separated list of addresses;
                                        # defaults to 'localhost'; use '*' for all
                                        # (change requires restart)
port = 5432                             # (change requires restart)
```

##### pg_hba.conf

pg_hba.conf の場所を探します。

```
find / -name pg_hba.conf 2> /dev/null
```

vim などのエディタでファイルを編集します。

```pg_hba.conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     trust
# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
# IPv6 local connections:
host    all             all             ::1/128                 trust
# Allow replication connections from localhost, by a user with the
# replication privilege.
local   replication     all                                     trust
host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust
```

- ローカル接続用の認証設定を行うため、`METHOD`について`trust` -> `md5`に書き換える
- 外部接続用のアクセス制御設定を行うため、ファイルの末尾に以下を追加する

```
host    nob_db       nob1             192.168.144.0/24        md5
```

#### 接続確認

postgreSQL サービスを再起動して変更を適用します。

```
sudo service postgresql restart
```

以下、別サーバでの操作です。

`psql`コマンドを使えるようにします。

```
sudo apt-get install postgresql-client-common
sudo apt-get install postgresql-client
```

DB に接続します。

```
psql -U nob1 -h ${postgreSQLサーバのIPアドレス} -p 5432 -d nob_db
```
