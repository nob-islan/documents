# Docker で MariaDB サーバを構築

## 使用環境

- DB: MariaDB

## ディレクトリ構成

```shell
root
  ├─volumes
  │   ├─csv
  │   │   └─sample-data.csv
  │   └─initdb.d
  │       └─01_create_db.sql
  └─docker-compose.yml
```

コンテナ起動時に、`initdb.d`配下の sql ファイルおよびシェルスクリプトが自動実行されます。ファイルの名前順に実行されるので、プレフィックスで順番を制御するのが良いです。

## 設定ファイル

### docker-compose.yml

DB サーバおよび GUI で DB を管理できる`adminer`を起動します。

```yml
services:
  db:
    container_name: nob-mariadb
    image: mariadb
    ports:
      - 3306:3306
    volumes:
      - ./volumes/initdb.d:/docker-entrypoint-initdb.d
      - ./volumes/csv:/csv
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
CREATE DATABASE snaildb;
USE snaildb;

-- テーブル作成
CREATE TABLE nob_table (
    id INT PRIMARY KEY AUTO_INCREMENT
    , code_name VARCHAR(10)
    , age VARCHAR(3)
);

-- 初期データ投入
LOAD DATA LOCAL INFILE '/csv/sample-data.csv' -- コンテナ上のCSVファイル
    INTO TABLE
        nob_table -- テーブル名
    FIELDS
        TERMINATED BY ',' -- フィールドの区切り文字
        -- ENCLOSED BY '"' -- 各カラムの囲い文字
    LINES
        TERMINATED BY '\n' -- ラインの区切り文字
    IGNORE 1 ROWS -- 最初の1行目を無視する
        (id, code_name, age); -- DBのどのカラムに相当するかを明記
```

サンプルデータは下記で作成しています。

```
id,code_name,age
1,first-nob,13
2,second-nob,5
```

コンテナ起動後、コンテナ内から`mariadb -u root -p`で DB にログインできます。
