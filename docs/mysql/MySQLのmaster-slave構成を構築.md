# MySQLのmaster-slave構成を構築

MySQLデータベースについてmaster-slave方式で冗長構成を構築します。

## ディレクトリ構成

```shell
.
├── docker-compose.yaml
└── volumes
    ├── mysql-master
    │   ├── initdb.d
    │   │   └── init.sql
    │   └── my.cnf
    ├── mysql-slave
    │   ├── initdb.d
    │   │   └── init.sql
    │   └── my.cnf
    └── proxysql
        └── proxysql.cnf
```

## 設定ファイル準備

### `docker-compose.yaml`

- mysql-master: 書き込み処理およびslaveがダウンした際の読み取り処理を担当
- mysql-slave: 読み取り専用
- proxysql: 上記master / slaveへのクエリをルーティング（slaveがダウンした際はmasterにフォールバック）

```yaml
services:
  mysql-master:
    container_name: mysql-master
    image: mysql:8.0
    ports:
      - 3307:3306
    volumes:
      - ./volumes/mysql-master/my.cnf:/etc/mysql/conf.d/my.cnf
      - ./volumes/mysql-master/initdb.d:/docker-entrypoint-initdb.d
    environment:
      - MYSQL_ROOT_PASSWORD=password
  mysql-slave:
    container_name: mysql-slave
    image: mysql:8.0
    ports:
      - 3308:3306
    volumes:
      - ./volumes/mysql-slave/my.cnf:/etc/mysql/conf.d/my.cnf
      - ./volumes/mysql-slave/initdb.d:/docker-entrypoint-initdb.d
    environment:
      - MYSQL_ROOT_PASSWORD=password
  proxysql:
    image: proxysql/proxysql:3.0.2
    container_name: proxysql
    depends_on:
      - mysql-master
      - mysql-slave
    ports:
      - "3306:3306"
      - "6032:6032"
    volumes:
      - ./volumes/proxysql/proxysql.cnf:/etc/proxysql.cnf
```

### `volumes`

#### `mysql-master/initdb.d/init.sql`

```sql
-- レプリケーション担当ユーザ作成
CREATE USER IF NOT EXISTS 'repl'@'%' IDENTIFIED WITH 'mysql_native_password' BY 'replpass';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';

-- アプリケーションからアクセスするユーザ作成
CREATE USER IF NOT EXISTS 'appuser'@'%' IDENTIFIED WITH 'mysql_native_password' BY 'appuserpass';
GRANT ALL PRIVILEGES ON *.* TO 'appuser'@'%';

-- proxysqlからの監視ユーザ作成
CREATE USER IF NOT EXISTS 'monitor'@'%' IDENTIFIED BY 'monitorpass';
GRANT USAGE ON *.* TO 'monitor'@'%';

-- 業務テーブル構築
CREATE DATABASE snaildb;

USE snaildb;

CREATE TABLE users(
    id INT PRIMARY KEY AUTO_INCREMENT
    , name VARCHAR(20) NOT NULL
    , age INT NOT NULL
);
```

#### `mysql-master/my.cnf`

```ini
[mysqld]
server-id = 1
log-bin = mysql-bin
binlog-format = ROW
gtid-mode = ON
enforce-gtid-consistency = ON
```

#### `mysql-slave/initdb.d/init.sql`

```sql
-- レプリカ設定
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST='mysql-master',
  SOURCE_USER='repl',
  SOURCE_PASSWORD='replpass',
  SOURCE_AUTO_POSITION=1;

START REPLICA;

CREATE USER IF NOT EXISTS 'appuser'@'%' IDENTIFIED WITH 'mysql_native_password' BY 'appuserpass';
GRANT ALL PRIVILEGES ON *.* TO 'appuser'@'%';

CREATE USER IF NOT EXISTS 'monitor'@'%' IDENTIFIED BY 'monitorpass';
GRANT USAGE ON *.* TO 'monitor'@'%';
```

#### `mysql-slave/my.cnf`

```ini
[mysqld]
server-id = 2
relay-log = relay-bin
read-only = 1
gtid-mode = ON
enforce-gtid-consistency = ON
```

#### `proxysql/proxysql.cnf`

```ini
mysql_variables =
{
    interfaces="0.0.0.0:3306"
    server_version="8.0"
    monitor_username="monitor"
    monitor_password="monitorpass"
}

mysql_servers =
(
    {
        address="mysql-master"
        port=3306
        hostgroup_id=10
        max_connections=200
    },
    {
        address="mysql-slave"
        port=3306
        hostgroup_id=20
        max_connections=200
    }
)

mysql_users =
(
    {
        username="appuser"
        password="appuserpass"
        default_hostgroup=10
        transaction_persistent=true
        active=1
    }
)

mysql_query_rules =
(
    {
        rule_id=1
        active=1
        match_pattern="^SELECT"
        destination_hostgroup=20
        apply=1
    },
    {
        rule_id=2
        active=1
        match_pattern=".*"
        destination_hostgroup=10
        apply=1
    }
)

mysql_replication_hostgroups =
(
    {
        writer_hostgroup=10
        reader_hostgroup=20
        comment="master-slave replication setup"
    }
)
```

## 動作確認

- 下記と同様の出力が得られれば正常にmaster-slave構成になっています:

```shell
$ docker exec -it mysql-slave mysql -u root -ppassword -e "SHOW REPLICA STATUS\G" | grep "Replica_.*_Running" | grep "Yes"
           Replica_IO_Running: Yes
          Replica_SQL_Running: Yes
```

- proxysqlの設定は管理用データベースにて確認できます:

```shell
docker exec -it proxysql mysql -u admin -padmin -P 6032
```

各種設定項目については下記を参照してください:

- https://proxysql.com/documentation/
- https://hub.docker.com/r/proxysql/proxysql
