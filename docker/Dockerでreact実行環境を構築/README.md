# Docker で React 実行環境を構築

## 構築手順

### react アプリをビルド

- ビルドしたいプロジェクトのルートディレクトリでビルドコマンドを実行します。

```shell
npm run build
```

### Dockerfile を記載

- 下記 Dockerfile で react アプリケーションを実行可能なコンテナイメージを作成します。

```Dockerfile
FROM node:20.12.2-buster

RUN npm install -g serve

COPY ${先に作成したbuildディレクトリ} /build/

CMD serve -s build
```

### コンテナイメージを実行

- `docker run`コマンド等でコンテナイメージを実行すればアプリケーションが利用できます。
