# DockerでJava環境を構築

## 構築

### javaアプリをビルド

- ビルドしたいプロジェクトのルートディレクトリでビルドコマンドを実行します。

```shell
# Spring Bootの場合
./mvnw package
```

### Dockerfileを記載

- 下記DockerfileでJavaアプリケーションを実行可能なコンテナイメージを作成します。

```Dockerfile
FROM eclipse-temurin:21

COPY ${先に作成したjarファイル} /${jarファイル名}

CMD java -jar /${jarファイル名}
```

### コンテナイメージを実行

`docker run`コマンド等でコンテナイメージを実行すればアプリケーションが利用できます。
