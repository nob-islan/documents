# DockerでReact環境を構築

## 構築手順

### reactアプリをビルド

- ビルドしたいプロジェクトのルートディレクトリでビルドコマンドを実行します。

```shell
npm run build
```

### Dockerfileを記載

- 下記Dockerfileでreactアプリケーションを実行可能なコンテナイメージを作成します。

```Dockerfile
FROM node:20.12.2-buster

RUN npm install -g serve

COPY ${先に作成したbuildディレクトリ} /build/

CMD serve -s build
```

### コンテナイメージを実行

- `docker run`コマンド等でコンテナイメージを実行すればアプリケーションが利用できます。
