# MySQL の master-slave 構成を構築

MySQL データベースについて master-slave 方式で冗長構成を構築します。

## ディレクトリ構成

```shell
.
├── docker-compose.yaml
└── volumes
    ├── master
    │   ├── initdb.d
    │   │   └── init.sql
    │   └── my.cnf
    └── slave
        ├── initdb.d
        │   └── init.sql
        └── my.cnf
```

## 設定ファイル準備

### docker-compose.yaml

```yaml
services:
  mysql-master:
    container_name: mysql-master
    image: mysql:8.0
    ports:
      - 3307:3306
    volumes:
      - ./volumes/master/my.cnf:/etc/mysql/conf.d/my.cnf
      - ./volumes/master/initdb.d:/docker-entrypoint-initdb.d
    environment:
      - MYSQL_ROOT_PASSWORD=password
  mysql-slave:
    container_name: mysql-slave
    image: mysql:8.0
    ports:
      - 3308:3306
    volumes:
      - ./volumes/slave/my.cnf:/etc/mysql/conf.d/my.cnf
      - ./volumes/slave/initdb.d:/docker-entrypoint-initdb.d
    environment:
      - MYSQL_ROOT_PASSWORD=password
```

### volumes

### master/initdb.d/init.sql

```sql
-- レプリケーション向けユーザを作成します。
CREATE USER 'repl'@'%' IDENTIFIED WITH 'mysql_native_password' BY 'replpass';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
```

### master/my.cnf

```cnf
[mysqld]
server-id = 1
log-bin = mysql-bin
binlog-format = ROW
gtid-mode = ON
enforce-gtid-consistency = ON
```

### slave/initdb.d/init.sql

```sql
-- レプリカ設定を入れます。
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST='mysql-master',
  SOURCE_USER='repl',
  SOURCE_PASSWORD='replpass',
  SOURCE_AUTO_POSITION=1;

START REPLICA;
```

### slave/my.cnf

```cnf
[mysqld]
server-id = 2
relay-log = relay-bin
read-only = 1
gtid-mode = ON
enforce-gtid-consistency = ON
```

## 動作確認

下記と同様の出力が得られれば正常に master-slave 構成になっています:

```shell
$ docker exec -it mysql-slave mysql -u root -ppassword -e "SHOW REPLICA STATUS\G" | grep "Replica_.*_Running" | grep "Yes"
           Replica_IO_Running: Yes
          Replica_SQL_Running: Yes
```
