# GitLab Runner で Docker Hub に image を push する

## 共通事前準備

サーバを用意する。いずれもコンテナで動かします。

### GitLab サーバ

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

### GitLab Runner サーバ

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

runner を登録します。executor は`docker`を選択してください。

```shell
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

主に以下の流れで処理が進みます。

- 実行用の image として`kaniko-project/executor:debug`を使う。`latest`とかだとうまくいかないらしい。
- `DOCKERHUB_TOKEN`を生成して`/kaniko/.docker/config.json`に記載する。これが docker hub に push する際の認証情報となる。
- push する。

```yaml
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

`CI_REGISTRY_IMAGE`は GitLab の画面から環境変数として登録するか、`.gitlab-ci.yml`にベタ書きするかしてください。

#### Dockerfile

ただ適当なファイルを touch しただけの ubuntu コンテナです。

```Dockerfile
FROM ubuntu:20.04

RUN mkdir /nob && cd /nob && touch snail-test
```

### 実行

#### 準備

各種環境変数を用意する必要があるので、画面の`Settings -> CI/CD -> Variables`から定義します。

- `DOCKERHUB_USER`: docker hub のユーザ名
- `DOCKERHUB_PASSWORD`: ログイン用のパスワードか、hub から発行できるアクセストークン

#### パイプライン実行

`Repository -> Tags`からタグを発行すると、Tag name が image のタグとなります。あとはパイプラインが走るので見守ってください。
