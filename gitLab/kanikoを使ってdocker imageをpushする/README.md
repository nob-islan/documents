# kanikoを使ってdocker imageをpushする

## 共通事前準備
サーバを用意する。いずれもコンテナで動かす。

### GitLabサーバ
```
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

### GitLab Runnerサーバ
```
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

runnerを登録する。executorは`docker`を選択する。
```
docker exec -it nob-gitlab-runner gitlab-runner register
```

## docker hub

### プロジェクト作成

ディレクトリ構成
```
first-kaniko-project
  ├─.gitlab-ci.yml
  └─Dockerfile
```

#### .gitlab-ci.yml
主に以下の流れで処理が進む。
- 実行用のimageとして`kaniko-project/executor:debug`を使う。`latest`とかだとうまくいかないらしい。
- `DOCKERHUB_TOKEN`を生成して`/kaniko/.docker/config.json`に記載する。これがdocker hubにpushする際の認証情報となる。
- pushする。
```
stages:
  - build

build:
  stage: build
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]
  script:
    - DOCKERHUB_TOKEN=`echo -n ${DOCKERHUB_USER}:${DOCKERHUB_PASSWORD} | base64`
    - echo "{\"auths\":{\"https://index.docker.io/v1/\":{\"auth\":\"${DOCKERHUB_TOKEN}\"}}}" > /kaniko/.docker/config.json
    - /kaniko/executor
      --context "${CI_PROJECT_DIR}"
      --dockerfile "${CI_PROJECT_DIR}/Dockerfile"
      --destination "${CI_REGISTRY_IMAGE}:${CI_COMMIT_TAG}"
  rules:
    - if: $CI_COMMIT_TAG
```

#### Dockerfile
ただ適当なファイルをtouchしただけのubuntuコンテナ。
```
FROM ubuntu:20.04

RUN mkdir /nob && cd /nob && touch snail-test
```

### 実行

#### 準備
各種環境変数を用意する必要があるので、画面の`Settings -> CI/CD -> Variables`から定義する。
- `DOCKERHUB_USER`: docker hubのユーザ名
- `DOCKERHUB_PASSWORD`: ログイン用のパスワードか、hubから発行できるアクセストークン

#### パイプライン実行
`Repository -> Tags`からタグを発行する、Tag nameがimageのタグとなる。あとはパイプラインが走るので見守るだけ。

## AWS ECR

### プロジェクト作成

ディレクトリ構成
```
first-kaniko-project
  ├─.gitlab-ci.yml
  └─Dockerfile
```

#### .gitlab-ci.yml
主に以下の流れで処理が進む。
- 実行用のimageとして`kaniko-project/executor:debug`を使う。`latest`とかだとうまくいかないらしい。
- `ECR_URL`をべた書きすする。
- pushする。
```
stages:
  - build

build:
  stage: build
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]
  variables:
    ECR_URL: public.ecr.aws/i2s7b9x8/first-kaniko
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
ただ適当なファイルをtouchしただけのubuntuコンテナ。
```
FROM ubuntu:20.04

RUN mkdir /nob && cd /nob && touch snail-test
```

### 実行

#### 準備
各種環境変数を用意する必要があるので、画面の`Settings -> CI/CD -> Variables`から定義する。
- `AWS_ACCESS_KEY_ID`: AWS上で発行するアクセスキー
- `AWS_SECRET_ACCESS_KEY`: 上と同時に発行されるシークレットキー

#### パイプライン実行
`Repository -> Tags`からタグを発行する、Tag nameがimageのタグとなる。あとはパイプラインが走るので見守るだけ。