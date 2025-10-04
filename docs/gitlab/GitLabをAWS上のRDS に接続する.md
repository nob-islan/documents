# GitLab を AWS 上の RDS に接続する

AWS の RDS を利用して立ち上げた PostgreSQL に GitLab を接続します。

## PostgreSQL の設定

事前準備として、AWS コンソールなどを利用して PostgreSQL を立ち上げます。  
https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/USER_ConnectToPostgreSQLInstance.html

GitLab サーバに`psql`をインストールします。

```shell
sudo apt-get install postgresql-client-common
sudo apt-get install postgresql-client
```

以下、PostgreSQL サーバに設定を入れていきます。  
https://docs.gitlab.com/ee/administration/postgresql/external.html  
AWS コンソール上に表示される DB のエンドポイントを控えておき、デフォルトで用意されている`postgres`ユーザを使って PostgreSQL に接続します。

```shell
psql \
  --host=${PostgreSQLのエンドポイント} \
  --port=5432 \
  --username=postgres \
  --password
```

以下のように、PostgreSQL 上の操作で GitLab 用のユーザおよびデータベースを用意します。

```sql
-- ユーザを作成
CREATE USER gitlab WITH PASSWORD 'gitlab_secret' CREATEDB;

-- extensionの作成
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- マスタユーザをgitlabのメンバにする
GRANT gitlab TO postgres;

-- データベースの作成
CREATE DATABASE gitlabhq_production OWNER gitlab;

-- gitlabユーザにスーパーユーザの権限を付与
GRANT rds_superuser TO gitlab;
```

以降は、以下のコマンドで直接 GitLab 用のデータベースに接続できます。

```shell
psql \
  --host=${PostgreSQLのエンドポイント} \
  --port=5432 \
  --username=gitlab \
  --dbname=gitlabhq_production \
  --password
```

## GitLab の設定

docker で動かすため、`docker-compose.yaml`を以下で作成します。

```yaml
version: "3"
services:
  gitlab:
    image: gitlab/gitlab-ee:latest
    container_name: gitlab-test
    restart: always
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url "http://${IP address}:80"
        # Disable the built-in Postgres
        postgresql['enable'] = false
        # Fill in the connection details for database.yaml
        gitlab_rails['db_adapter'] = 'postgresql'
        gitlab_rails['db_username'] = 'gitlab'
        gitlab_rails['db_password'] = 'gitlab_secret'
        gitlab_rails['db_encoding'] = 'utf8'
        gitlab_rails['db_host'] = '${DBのエンドポイント}'
    ports:
      - "80:80"
      - "2022:22"
    volumes:
      - "/srv/gitlab/config:/etc/gitlab"
      - "/srv/gitlab/logs:/var/log/gitlab"
      - "/srv/gitlab/data:/var/opt/gitlab"
```

## 起動

`docker-compose up`で OK。初期パスワードは以下で確認できます。

```shell
sudo docker exec -it gitlab-test grep 'Password:' /etc/gitlab/initial_root_password
```
