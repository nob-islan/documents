# Docker で DB サーバーを立てる

## 使用環境

- DB: MariaDB

## ディレクトリ構成

```shell
root
  ├─volume
  │   └─initdb.d
  │       └─create_db.sql
  └─docker-compose.yml
```

コンテナ起動時に、`initdb.d`配下の SQL（shell も OK らしい）が自動実行されます。

## 設定ファイル

### docker-compose.yml

DB サーバおよび GUI で DB を管理できる`adminer`を起動します。

```yml
version: "3.7"
services:
  db:
    container_name: nob-mariadb
    image: mariadb
    ports:
      - 3306:3306
    volumes:
      - ./volume/initdb.d:/docker-entrypoint-initdb.d
    environment:
      - MYSQL_ROOT_PASSWORD=password
      # - MYSQL_ALLOW_EMPTY_PASSWORD=true # 空パスワードを許容する

  adminer:
    container_name: nob-adminer
    image: adminer
    ports:
      - 8081:8080
```

### create_db.sql

テーブル作成、初期データ投入などを行う SQL ファイルです。

```sql
-- データベース作成
CREATE DATABASE nobdb;
USE nobdb;

-- テーブル作成
CREATE TABLE nob_table (
    id INT PRIMARY KEY AUTO_INCREMENT
    , code_name VARCHAR(10)
    , age VARCHAR(3)
);

-- 初期データ投入
INSERT INTO nob_table (
    code_name
    , age
) VALUES (
    'first_nob'
    , '13'
)
, (
    'second_nob'
    , '5'
);
```

コンテナ起動後、コンテナ内から`mariadb -u root -p`で DB にログインできます。
