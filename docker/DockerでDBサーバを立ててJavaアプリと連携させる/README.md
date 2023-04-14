# Docker で DB サーバーを立てて Java アプリと連携させる

## 目標

Docker で DB サーバを構築し、VSCode から Java アプリを動かしてデータの insert, select ができることを確認します。

## 使用環境

- Java: openjdk-17
- DB: MariaDB

## プロジェクト構成

```
mariadb_test
  ┣server
  ┃  ┣javadbtest
  ┃  ┃  ┗アプリケーションのソースファイル（省略）
  ┃  ┗sqls
  ┃     ┗create_table.sql
  ┗docker-compose.yml
```

### docker-compose.yml

CREATE DATABASE および CREATE TABLE するための SQL ファイルをコンテナ側の`/higuchi/sqls`に配置します。  
`MYSQL_ROOT_PASSWORD=password`に合わせてソースファイル側のパスワードも記載することを忘れずに。

```
version: "3.6"
services:

  db:
    image: mariadb
    restart: always
    ports:
      - 3306:3306
    volumes:
      - type: bind
        source: "./server/sqls"
        target: "/higuchi/sqls"
    environment:
      - MYSQL_ROOT_PASSWORD=password

  adminer:
    image: adminer
    restart: always
    ports:
      - 8081:8080
```

`adminer`はブラウザ上で、GUI にて DB を操作できるものらしい。トラシューに使えたりするのでセットにしておきます。

### アプリケーションのソースファイル

具体的なコードは省略するが、以下の API を用意した：

- user テーブルに１行 insert する API
- user テーブルの情報を全件取得する API

### create_table.sql

後にサーバ内で操作する際、この SQL ファイルを実行するだけで下準備が整うようにしてあります。イニシャルデータを仕込むことももちろん可能です。

```
CREATE DATABASE docker_java_db_test;

USE docker_java_db_test;

CREATE TABLE user(
    id int primary key auto_increment,
    user_name varchar(15) not null,
    detail text
);
```

## 実際にやってみる

以下、起動確認までのコマンドを記載します。Docker Desktop を起動していないと冒頭からコケるので注意（２敗）。

### コンテナを作成

今回作成した docker-compose.yml を配置してあるディレクトリにて以下を実行：

```
docker-compose up -d
```

image が無ければ pull してくれて、コンテナをせっせとこしらえてくれます。

### テーブルを仕込む

以下を叩いて DB のコンテナに入ります：

```
docker exec -it ${コンテナのID} /bin/bash
```

SQL ファイルを実行してテーブル作成、イニシャルデータの挿入などを行います：

```
source ${path to sql}
```

### アプリケーションを起動

VSCode などからいつも通りアプリを起動します。
