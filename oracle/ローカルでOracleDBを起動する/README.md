# ローカルでOracleDBを起動する
docker上でOracleデータベースを動かす。

cf. https://zenn.dev/re24_1986/articles/29430f2f8b4b46

## Oracleデータベースのimageを作成

gitからソースをクローンする
```
git clone https://github.com/oracle/docker-images.git
```

Oracle Express Extensionをダウンロードする

>https://www.oracle.com/jp/database/technologies/xe-downloads.html

ダウンロードしたExpress Extensionを下記ディレクトリに配置する
```
docker-images/OracleDatabase/SingleInstance/dockerfiles/21.3.0
```

イメージ作成シェルを実行する
```
cd docker-images/OracleDatabase/SingleInstance/dockerfiles
./buildContainerImage.sh -v 21.3.0 -x -i
```

## コンテナを起動

`docker-compose.yml`を作成
```
version: '3'

services:
  db:
    image: oracle/database:21.3.0-xe
    container_name: nob-oracle
    ports:
      - 1521:1521
    volumes:
      - ./container/oradata:/opt/oracle/oradata
    environment:
      - ORACLE_PWD=password
```

`oradata`ディレクトリを作成
```
mkdir -p ./container/oradata
chmod 777 ./container/oradata
```
（`oradata`ディレクトリの権限が不十分だとコンテナ起動時にエラーが起きる。）