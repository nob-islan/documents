# GitLab Runner と AWS ECR でアプリを自動デプロイする

GitLab Runner を使って、自動で ECR リポジトリに container image が push される仕組みを作り、アプリの自動デプロイを行う。

## インフラ側作業

### サーバ構築

#### GitLab

docker で動かす。

```yaml
version: "3"
services:
  gitlab:
    image: gitlab/gitlab-ee:15.4.2-ee.0
    container_name: nob-gitlab
    restart: always
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url "http://${IP_address}:80"
    ports:
      - "80:80"
      - "2022:22"
    volumes:
      - "/srv/gitlab/config:/etc/gitlab"
      - "/srv/gitlab/logs:/var/log/gitlab"
      - "/srv/gitlab/data:/var/opt/gitlab"
```

#### GitLab Runner

こちらも docker で動かす。

```yaml
version: "3"
services:
  gitlab-runner:
    image: gitlab/gitlab-runner:ubuntu-v15.7.0
    container_name: nob-gitlab-runner
    restart: always
    volumes:
      - "/srv/gitlab/gitlab-runner/config:/etc/gitlab-runner"
      - "/var/run/docker.sock:/var/run/docker.sock"
```

#### kind

[kind インストール手順](../../kubernetes/kind/kind%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB%E6%89%8B%E9%A0%86/README.md)に従って kubernetes クラスタを稼働させておいてください。

クラスタ

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 30080
        hostPort: 30070
        protocol: TCP
      - containerPort: 30090
        hostPort: 30071
        protocol: TCP
  - role: worker
  - role: worker
```

- [kind で ArgoCD を使う](../../kubernetes/kind/kind%E3%81%A7ArgoCD%E3%82%92%E4%BD%BF%E3%81%86/README.md)を参考に Argo CD を起動させておきます。

### Container image リポジトリ構築

AWS ECR にリポジトリを作成しておきます。

## アプリ側作業

GitLab 上にプロジェクトを作成し、アプリケーションのソースファイルをリポジトリ上に配置します。

### アプリの実装

ディレクトリ構成

```shell
first-cicd-project
  ├─firstcicd  #アプリのソース
  ├─.gitlab-ci.yml
  └─Dockerfile
```

#### firstcicd

以下の REST API を実装して、GitLab に push します。

- インターフェース

```java
package com.example.firstcicd.service;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * サンプルサービスのインターフェースです。
 *
 */
@Service
@RestController
@RequestMapping("/cicd")
public interface SampleService {

    /**
     * 固定メッセージを返すメソッドです。
     *
     * @return 挨拶のメッセージ
     */
    @GetMapping(value = "/greet")
    String greet();
}
```

- 実装

```java
package com.example.firstcicd.service.impl;

import org.springframework.stereotype.Service;

import com.example.firstcicd.service.SampleService;

/**
 * サンプルサービスの実装クラスです。
 *
 */
@Service
public class SampleServiceImpl implements SampleService {

    /**
     * {@inheritDoc}
     *
     */
    @Override
    public String greet() {

        String retMessage = "Hello, CICD! \n";

        return retMessage;
    }
}
```

#### gitlab-ci.yml

パイプラインを走らせる際のジョブを定義します。

- タグが切られた際に container image をビルドする
- ビルドした image を ECR に push する

```yaml
stages:
  - build

build:
  stage: build
  image:
    name: gcr.io/kaniko-project/executor:v1.9.0-debug
    entrypoint: [""]
  variables:
    ECR_URL: ${ECRリポジトリのURL}
  script:
    - echo "{\"credsStore\":\"ecr-login\"}" > /kaniko/.docker/config.json
    - /kaniko/executor
      --context "${CI_PROJECT_DIR}"
      --dockerfile "${CI_PROJECT_DIR}/Dockerfile"
      --destination "${ECR_URL}:${CI_COMMIT_TAG}"
  rules:
    - if: $CI_COMMIT_TAG
```

#### Dockerfile

アプリの container image の元となります。

- image の作成時に jar ファイルをビルドする
- コンテナの起動時に Java アプリを起動する

```Dockerfile
FROM openjdk:17

ARG app_name='firstcicd'
ARG server_work_dir='/nob/firstcicd'
ENV APP_NAME=${app_name}
ENV SERVER_WORK_DIR=${server_work_dir}
ENV JAR_DIR=${SERVER_WORK_DIR}'/target'

COPY ./firstcicd/ ${server_work_dir}

RUN cd ${server_work_dir} && ./mvnw package

CMD java -jar ${JAR_DIR}/${APP_NAME}-0.0.1-SNAPSHOT.jar
```

openjdk17 コンテナをベースにして jar ファイルを作成し、コンテナ起動時にアプリをスタートします。

## アプリのビルド

### Runner の登録

```
docker exec -it nob-gitlab-runner gitlab-runner register
```

下記を対話形式で設定していきます。

- Enter the GitLab instance URL (for example, https://gitlab.com/):  
  `Settings -> CD/CD -> Runners`に書いてあるものを転記

- Enter the registration token:  
  同上

- Enter a description for the runner:  
  登録する runner の説明を記載する

- Enter tags for the runner (comma-separated):  
  タグを任意に付与する

- Enter an executor:  
  `docker`を選択する

runner の登録後、`Run untagged jobs`にチェックを入れる。

### ECR 向け環境変数の設定

各種環境変数を用意する必要があるので、画面の`Settings -> CI/CD -> Variables`から定義します。

- `AWS_ACCESS_KEY_ID`: AWS 上で発行するアクセスキー
- `AWS_SECRET_ACCESS_KEY`: 上と同時に発行されるシークレットキー

`Protected`を外さないとパイプライン実行時にエラーになるかもしれません。

### ソースの push

main ブランチにソースがマージされるとパイプラインが走ります。パイプラインが走り切ると、ECR に image が登録されています。

## アプリのデプロイ

### デプロイ用プロジェクトの作成

`first-kube-project`を作成します。

ディレクトリ構成

```shell
first-kube-project
  └─firstcicd
      ├─firstcicd-deployment.yml
      └─firstcicd-service.yml
```

deployment および service は下記で定義します。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: firstcicd-deployment
spec:
  selector:
    matchLabels:
      app: firstcicd
  replicas: 3
  template:
    metadata:
      labels:
        app: firstcicd
    spec:
      containers:
        - name: firstcicd
          image: nobbrownbear/firstcicd:0.0.1
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: firstcicd-service
spec:
  type: NodePort
  ports:
    - port: 8099
      targetPort: 8080
      protocol: TCP
      nodePort: 30090
  selector:
    app: firstcicd
```

### デプロイ実行

Argo CD に`kube-deploy-project`を登録すると、アプリが自動デプロイされます。

```
Nobuhiros-MacBook-Air:~ nob$ curl http://${kindサーバのIPアドレス}:30071/cicd/greet
Hello, CI/CD!
```
