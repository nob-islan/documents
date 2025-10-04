# GitLab を外部の PostgreSQL に接続する

PostgreSQL サーバを外部に立てて GitLab の DB として運用します。

## PostgreSQL サーバ側の設定

postgres ユーザになる

```shell
sudo su - postgres
```

postgreSQL に接続

```shell
psql
```

gitlab ユーザの作成

```sql
CREATE USER gitlab with PASSWORD 'gitlab_secret';
```

ユーザが作成されていることを確認

```sql
SELECT * FROM pg_user;
```

gitlabhq_production データベース作成

```sql
CREATE DATABASE gitlabhq_production OWNER gitlab;
```

スーパーユーザ権限付与

```sql
ALTER ROLE gitlab WITH SUPERUSER;
```

`SELECT * FROM pg_user;`で`usersuper`が`t`になっていることを確認

pg_hba.conf を vim などでを編集

```shell
find / -name pg_hba.conf 2> /dev/null
```

ファイルの末尾に以下を追記

```conf
host    all             all             192.168.144.0/24           trust
```

サービスを再起動して変更を適用

```shell
sudo service postgresql restart
```

## GitLab サーバ側の設定

以下の設定を追記します。パッケージ版であれば`gitlab.rb`ファイルを編集してください。コンテナ版であれば`docker-compose.yaml`の`services.gitlab.environment.GITLAB_OMNIBUS_CONFIG`に以下を追記します。

```yaml
# Disable the built-in Postgres
postgresql['enable'] = false
# Fill in the connection details for database.yaml
gitlab_rails['db_adapter'] = 'postgresql'
gitlab_rails['db_encoding'] = 'utf8'
gitlab_rails['db_username'] = 'gitlab'
gitlab_rails['db_password'] = 'gitlab_secret'
gitlab_rails['db_host'] = '${PostgreSQLのIPアドレス}'
gitlab_rails['db_port'] = 5432
```

あとはいつも通り`docker-compose up -d`で起動すれば OK です。
