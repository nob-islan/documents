# 開発環境構築

dev container を用いた Java 開発環境の構築方法を記載します。コンテナ内にライブラリなどをインストールするため、ローカル環境を汚すことなく開発を進めることができます。

## 構築手順

開発環境の構築手順です。

- あらかじめアプリケーションソースコードをクローンしておきます。
- VSCode 上で「表示」「コマンドパレット」「開発コンテナー: コンテナーでフォルダーを開く」を選択します。
- 開発環境の実体はコンテナおよびコンテナボリュームとして管理されます。

```
Nobs-MacBook-Air:~ nob$ docker ps
CONTAINER ID   IMAGE                                                                                               COMMAND                   CREATED              STATUS              PORTS     NAMES
46ada28a4830   vsc-first-dev-container-42d44f5e7c668798eae617d5ddbbc36ccdd6c0363c555d1158fc185cb1db6dbf-features   "/bin/sh -c 'echo Co…"   About a minute ago   Up About a minute             sleepy_maxwell
```

```
Nobs-MacBook-Air:~ nob$ docker volume ls | grep vscode
local     vscode
```
