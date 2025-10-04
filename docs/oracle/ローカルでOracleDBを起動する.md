# ローカルで OracleDB を起動する

docker 上で Oracle データベースを動かします。

cf. https://zenn.dev/re24_1986/articles/29430f2f8b4b46

## Oracle データベースの image を作成

git からソースをクローン

```shell
git clone https://github.com/oracle/docker-images.git
```

Oracle Express Extension をダウンロード

> https://www.oracle.com/jp/database/technologies/xe-downloads.html

ダウンロードした Express Extension を下記ディレクトリに配置

```
docker-images/OracleDatabase/SingleInstance/dockerfiles/21.3.0
```

イメージ作成シェルを実行

```shell
cd docker-images/OracleDatabase/SingleInstance/dockerfiles
./buildContainerImage.sh -v 21.3.0 -x -i
```

## コンテナを起動

`docker-compose.yaml`を作成

```yaml
version: "3"
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

```shell
mkdir -p ./container/oradata
chmod 777 ./container/oradata
```

（`oradata`ディレクトリの権限が不十分だとコンテナ起動時にエラーが起きます。）
