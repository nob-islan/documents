# Go REAT API プロジェクトセットアップ方法

## プロジェクト作成

下記コマンドで Go モジュールを初期化します。

```shell
go mod init easyapp
```

## 実装

サンプルコードを掲載します。ここでは擬似的なログイン画面を実装します。

### 事前準備

データベースを docker で構築します。

#### docker-compose.yaml

```yaml
services:
  easyappdb:
    image: mariadb:latest
    container_name: easyappdb
    ports:
      - 3306:3306
    volumes:
      - ./volumes/initdb.d:/docker-entrypoint-initdb.d
    environment:
      - MYSQL_ROOT_PASSWORD=password
```

#### volumes/initdb.d/create-database.sql

```sql
CREATE DATABASE easyappdb;
USE easyappdb;

CREATE TABLE users (
    name VARCHAR(8) PRIMARY KEY
    , password VARCHAR(32)
);

INSERT INTO users VALUES (
    'nob'
    , 'passwd'
);
```

### ディレクトリ構成

WIP

### クラス一覧

WIP
