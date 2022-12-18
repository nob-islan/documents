# Gitlab Runner を使って自動デプロイを行う
GitLab Runnerを使って、masterブランチにプッシュした際に自動でcontainer imageが作成される仕組みを作り、それを用いてアプリの自動デプロイを行う。

## 事前準備

### サーバ構築

#### GitLab
dockerで動かす。

```yaml
version: '3'
services:
  gitlab:
    image: gitlab/gitlab-ee:15.4.2-ee.0
    container_name: nob-gitlab
    restart: always
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url "http://${IP_address}:80"
    ports:
    - '80:80'
    - '2022:22'
    volumes:
    - '/srv/gitlab/config:/etc/gitlab'
    - '/srv/gitlab/logs:/var/log/gitlab'
    - '/srv/gitlab/data:/var/opt/gitlab'
```

#### GitLab Runner
こちらもdockerで動かす。

```yaml
version: '3'
services:
  gitlab-runner:
    image: gitlab/gitlab-runner:ubuntu-v15.7.0
    container_name: nob-gitlab-runner
    restart: always
    volumes:
    - '/srv/gitlab/gitlab-runner/config:/etc/gitlab-runner'
    - '/var/run/docker.sock:/var/run/docker.sock'
```

- GitLab Runnerサーバについて、[Dockerのインストール](../../docker/Docker%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB/README.md)を参考にして、コンテナにdockerをインストールする必要がある。
- `sudo usermod -aG docker gitlab-runner`で、`gitlab-runner`ユーザが`docker`コマンドを使えるようにする。

#### kind

[kindインストール手順](../../kubernetes/kind/kind%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB%E6%89%8B%E9%A0%86/README.md)に従ってkubernetesクラスタを稼働させておく。

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

- [kindでArgoCDを使う](../../kubernetes/kind/kind%E3%81%A7ArgoCD%E3%82%92%E4%BD%BF%E3%81%86/README.md)を参考にArgo CDを起動させておく。

## アプリの準備

GitLab上にプロジェクトを作成し、アプリケーションのソースファイルをリポジトリ上に配置する。

### アプリの実装

ディレクトリ構成
```shell
first-cicd-project
  ├─firstcicd  #アプリのソース
  ├─shell  #runner内で使うシェルスクリプト
  ├─.gitlab-ci.yml
  └─Dockerfile
```

以下のREST APIを実装して、GitLabにpushする。

#### インターフェース
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

#### 実装
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

## Runnerの登録
Runnerを登録する。
```
docker exec -it nob-gitlab-runner gitlab-runner register
```
下記を対話形式で設定していく。

- Enter the GitLab instance URL (for example, https://gitlab.com/):  
-> `Settings -> CD/CD -> Runners`に書いてあるものを転記

- Enter the registration token:  
-> 同上

- Enter a description for the runner:  
-> 登録するrunnerの説明を記載する

- Enter tags for the runner (comma-separated):  
-> タグを任意に付与する

- Enter an executor:  
-> `shell`を選択する

runnerの登録後、`Run untagged jobs`にチェックを入れる。

## Container imageの自動作成

### 各種ファイルの作成

- Dockerfile

アプリのimageの作成に必要。
```Dockerfile
FROM openjdk:17

COPY ./firstapp /java/firstapp

RUN cd /java/firstapp && ./mvnw package

CMD java -jar /java/firstapp/target/firstapp-0.0.1-SNAPSHOT.jar
```
openjdk17コンテナをベースにしてjarファイルを作成し、コンテナ起動時にアプリをスタートする。

- gitlab-ci.yml

パイプラインを走らせるのに必要。
```yaml
build_image:
  script:
    - docker build -t nobbrownbear/firstapp:0.0.1 .
    - sh ./shell/docker-hub-login.sh
    - docker push nobbrownbear/firstapp:0.0.1
  only:
    - main
```
Runnerのコンテナ内でimageをビルドし、docker hubにpushする。

mainブランチにソースがマージされるとパイプラインが走る。パイプラインが走り切ると、docker hubにimageが登録されている。

## アプリの自動デプロイ

### デプロイ用プロジェクトの作成

`kube-deploy-project`を作成する。

ディレクトリ構成
```shell
kube-deploy-project
  └─firstcicd
      ├─firstcicd-deployment.yml
      └─firstcicd-service.yml
```

deploymentおよびserviceは下記で定義する。
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

Argo CDに`kube-deploy-project`を登録すると、アプリが自動デプロイされる。

```
Nobuhiros-MacBook-Air:~ nob$ curl http://${kindサーバのIPアドレス}:30071/cicd/greet
Hello, CICD! 
```