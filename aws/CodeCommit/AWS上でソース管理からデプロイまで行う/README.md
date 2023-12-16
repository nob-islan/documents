# AWS 上でソース管理からデプロイまで行う

AWS のサービスを利用しつつ、下記要領でアプリケーション開発を行います：

- CodeCommit: ソース管理
- CodeBuild: コンテナイメージの作成
- CodePipeline: アプリケーションのデプロイ

## CodeCommit

### サービス概要

**CodeCommit**サービスを利用して、AWS 上にリポジトリを立ててソース管理を行います。CodeCommit を利用するメリットとしては

- フルマネージドサービスなので可用性は AWS の責任範疇。利用者はサーバ管理などを意識する必要がない、
- 閉塞的なネットワーク内でソースを管理できる

ことがあげられます。

### やったこと

#### リポジトリ作成

AWS のコンソール上からリポジトリを作成します。リポジトリ名を指定するだけで簡単に作成できます。

![repo-create](./images/repo-create.png)

リポジトリの初期ページに、SSH キーの登録方法が記載されています。ドキュメントに従ってキーを登録してクローンの準備をします。

![nob-first-repo-init](./images/nob-first-repo-init.png)

#### ソースのプッシュ

ローカルで java プロジェクトを立ち上げ、リモートリポジトリにプッシュします。

![first-commit](./images/first-commit.png)

`first-app`がアプリケーションの実体です。作業用ブランチを切ってサンプルメソッドの実装をしてみます。

![create-branch](./images/create-branch.png)

ローカルでソースを編集後、プッシュしてプルリクエストを作成します。

![pull-request](./images/pull-request.png)

## CodeBuild

**CodeBuild**を使って、CodeCommit 上のソースからアプリケーションのモジュールをビルドします。今回はアプリのコンテナイメージ作成し、ECR にプッシュすることを目標とします。

### サービス概要

### やったこと

## CodePipeline

### サービス概要

### やったこと
