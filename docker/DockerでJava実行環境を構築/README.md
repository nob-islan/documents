# Docker で Java 実行環境を構築

## 目標

公式の openjdk イメージを使って Java の実行環境を Docker で用意します。

## 使用環境

- Java: openjdk-17

## プロジェクト構成

```
java-test
  ┣server
  ┃  ┗アプリケーションのソースファイル（省略）
  ┗docker-compose.yml
```

### docker-compose.yml

```
version: "3.6"
services:
  java:
    image: openjdk:17
    ports:
      - 8080:8080
    tty: true
    volumes:
      - type: bind
        source: "./server"
        target: "/higuchi/server"
```

`./server`配下のファイル（今回はソースファイルのみですが、仕込みたいシェルスクリプトなど）を`/higuchi/server`にバインドします。

### アプリケーションのソースファイル

Hello World 程度のものなので省略します。

## 実際にやってみる

起動までの流れ

- `docker-compose up -d`にて、yaml ファイルを読み込ませると、トイレに行っている間にコンテナが完成しています。
- `docker exec -it ${container ID} /bin/bash`にてコンテナに入ります。
- 適切なディレクトリにて`./mvnw package`を叩く。コンパイルが始まります。
- `java -jar ${path to jar}`を叩けばアプリケーションが起動します。jar ファイルは target 配下に格納されています。
