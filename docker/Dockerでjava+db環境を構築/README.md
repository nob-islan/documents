# Docker で java+db 環境を構築

## 目標

Docker で Java アプリケーション実行環境および DB サーバを立てて連携させます。

## 使用環境

- Java: openjdk-17
- DB: MariaDB

## プロジェクト構成

```
java-mariadb-test
　├─docker
　│　├─db
　│　│　├─sqls
　│　│　│　└─create_table.sql
　│　│　└─Dockerfile
　│　└─java
　│　 　├─dockertest
　│　 　│　└─アプリケーションソースファイル（省略）
　│　 　└─Dockerfile
　└─docker-compose.yml
```

### docker-compose.yml

```
version: "3.6"
services:

  java:
    build: ./docker/java
    container_name: java-container
    ports:
      - 8080:8080
    tty: true

  db:
    build: ./docker/db
    container_name: db-container
    restart: always
    ports:
      - 3306:3306
    environment:
      - MYSQL_ROOT_PASSWORD=password

  adminer:
    image: adminer
    container_name: adminer-container
    restart: always
    ports:
      - 8081:8080
```

Java および DB に関しては、Dockerfile を読み込ませることで必要なファイルを準備します。

### sqls/Dockerfile

```
FROM mariadb

COPY sqls /higuchi/sqls
```

公式のイメージ`mariadb`を pull し、`sqls`配下の SQL ファイルたちをコンテナ内にコピーします。

### java/Dockerfile

```
FROM openjdk:17

COPY dockertest /higuchi/server
```

公式のイメージ`openjdk:17`を pull し、`dockertest`配下のアプリケーションソースファイルたちをコンテナ内にコピーします。

### create_table.sql

```
CREATE DATABASE docker_java_db_test;

USE docker_java_db_test;

CREATE TABLE user(
    id int primary key auto_increment,
    user_name varchar(15) not null,
    detail text
);
```

`user`テーブルを作成します。

### アプリケーションのソースファイル

`java/dockertest`配下を参照。今回は user テーブルに insert するための入力画面、テーブルのデータを全件取得して出力する画面および API を用意しました。基本的にはいつも通りの作成手順で問題ありませんが、`application.properties`については DB の接続用 URL を以下のように記述します：

```
spring.datasource.url=jdbc:mariadb://db-container:3306/docker_java_db_test
```

コンテナ間で連携する際は`//${コンテナ名}:${ポート番号}/${DB名}`と記述するらしい。ポート番号についてはデフォルトの 3306 で問題ありません。

## 実際にやってみる

`docker-compose.yml`を配置しているディレクトリにて

```
docker-compose up -d
```

を実行。yaml ファイルおよび Dockerfile を読み込んでコンテナを作ってくれます。

### コンテナ内で下準備

#### MariaDB

以下のコマンドで DB コンテナに入ります。

```
docker exec -it db-container /bin/bash
```

以下コマンドの後にパスワードを入力して Mysql を起動します。

```
mysql -u root -p
```

あらかじめ仕込んであった SQL ファイルを実行。今回は DB およびテーブル作成のみ行います。

```
source /higuchi/sqls/create_table.sql
```

#### Java

以下のコマンドで Java コンテナに入ります。

```
docker exec -it java-container /bin/bash
```

アプリケーションをビルドします（`permission denied`される場合は`chmod +x mvnw`してみる）。

```
cd higuchi/server
./mvnw package
```

アプリケーションを実行

```
java -jar target/javadbtest-0.0.1-SNAPSHOT.jar
```

ブラウザで`http://localhost:8080/docker-welcome`にアクセスすればアプリケーションの動作確認ができます。
