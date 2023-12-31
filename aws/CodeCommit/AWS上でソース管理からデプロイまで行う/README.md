# AWS 上でソース管理からデプロイまで行う

AWS のサービスを利用しつつ、下記要領でアプリケーション開発を行います：

- CodeCommit: ソース管理
- CodeBuild: コンテナイメージの作成
- ECS: アプリデプロイ

## CodeCommit

ソース管理を行うサービスです。マネージドサービスなのでサーバの存在を意識せずにリポジトリを使うことができます。

### やったこと

Java アプリケーションのソースファイルを管理できる状態にします。

#### リポジトリ作成

AWS のコンソール上からリポジトリを作成します。リポジトリ名を指定するだけで簡単に作成できます。

リポジトリの初期ページに、SSH キーの登録方法が記載されています。ドキュメントに従ってキーを登録してクローンの準備をします。

#### ソースのプッシュ

ローカルで java プロジェクトを立ち上げ、リモートリポジトリにプッシュします。

`first-app`がアプリケーションの実体です。作業用ブランチを切ってサンプルメソッドの実装をしてみます。

ローカルでソースを編集後、プッシュしてプルリクエストを作成します。

## CodeBuild

### やったこと

#### ECR リポジトリ作成

アプリのコンテナイメージ格納先となる ECR リポジトリを作成します。

#### プロジェクト作成

今回はアプリのコンテナイメージ作成し、ECR にプッシュすることを目標とします。最初にビルドプロジェクトを作成します。

先ほどソースをプッシュしたリポジトリを紐づけます。

CodeBuild サービスロールにアタッチしている許可ポリシーに下記を追加して、CodeBuild から ECR に向けてイメージのプッシュができるようにします：

```json
{
    "Action": [
    "ecr:BatchCheckLayerAvailability",
    "ecr:CompleteLayerUpload",
    "ecr:GetAuthorizationToken",
    "ecr:InitiateLayerUpload",
    "ecr:PutImage",
    "ecr:UploadLayerPart"
    ],
    "Resource": "*",
    "Effect": "Allow"
},
```

また、CodeBuild の管理画面から、下記環境変数をあらかじめ設定しておきます。

| 環境変数名         | 概要                         |
| ------------------ | ---------------------------- |
| AWS_DEFAULT_REGION | リージョン名                 |
| AWS_ACCOUNT_ID     | アカウント ID                |
| IMAGE_TAG          | イメージタグ                 |
| IMAGE_REPO_NAME    | イメージ格納先リポジトリ URL |

#### buildspec 記載

CodeBuild は`buildspec.yml`に従ってビルドを進めます。この yml をソースリポジトリのルート配下に置くことで CodeBuild が認識するようになります。

```yml
version: 0.2

phases:
  install:
    runtime-versions:
      java: corretto17
  pre_build:
    commands:
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
  build:
    commands:
      - mvn install -f first-app/pom.xml
  post_build:
    commands:
      - docker build -t $IMAGE_REPO_NAME:$IMAGE_TAG .
      - docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
```

上の設定ファイルでは

- pre_build: AWS ログイン
- build: Java アプリのビルド
- post_build: コンテナイメージの作成および ECR へのプッシュ

を行っています。下記 Dockerfile を使ってイメージをビルドします：

```
FROM openjdk:17

COPY first-app/target/first-app-0.0.1-SNAPSHOT.jar /java/jar/first-app-0.0.1-SNAPSHOT.jar

CMD java -jar /java/jar/first-app-0.0.1-SNAPSHOT.jar
```

#### ビルド実行

「ビルドを開始」ボタンを押下します。

ビルドに成功すると ECR リポジトリにイメージがプッシュされます。

## ECS

### やったこと

#### サービス作成

今回はコンテナアプリケーションをデプロイするため、あらかじめ ECS サービスをデプロイしておき、CodePipeline でモジュールを更新する手順を踏みます。

クラスターを作成します。クラスターはコンテナを実行する EC2 インスタンスの管理単位です。

タスク定義を作成します。タスクは実行対象のコンテナイメージとその実行設定とをセットにした概念です。

サービスを作成します。サービスは実行されるコンテナそのものを指す概念です。上で作成したタスクを指定し、起動する VPC などを設定します。

サービスが正常に作成されると、java アプリが動いていることが確認できます。
