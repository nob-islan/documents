# GitLab Runner で harbor に image を push する

`.gitlab-ci.yml`によって Java アプリのイメージビルド、およびプッシュする設定を行います。

## ディレクトリ構成

```shell
artifact-inspection
  ├─.mvn/
  ├─first-app/  # app層のプロジェクトです。
  ├─first-web/  # web層のプロジェクトです。first-appに依存しています。
  ├─.gitlab-ci.yml  # GitLab Runnerの設定ファイルです。
  ├─Dockerfile  # 開発環境用コンテナイメージのDockerfileです。
  ├─mvnw
  ├─mvnw.cmd
  └─pom.xml
```

## 設定ファイル

各種設定ファイルの記載方法を説明します。Java アプリの構成については[こちら](../../java/Spring_bootでマルチモジュールアプリを作成/README.md)を参照ください。

### .gitlab-ci.yml

```yml
stages:
  - app-test
  - app-build
  - image-push

variables:
  ARTIFACT_JAR_NAME: "first-web-0.0.1-SNAPSHOT.jar"
  ARTIFACT_JAR_PATH: "first-web/target/${ARTIFACT_JAR_NAME}"
  PARENT_PROJECT: "artifact-inspection"
  WEB_PROJECT: "first-web"
  APP_PROJECT: "first-app"

app-test:
  stage: app-test
  image: maven:3.8.5-openjdk-17
  script:
    - mvn clean verify
  artifacts:
    when: always
    reports:
      junit:
        - ${WEB_PROJECT}/target/surefire-reports/TEST-*.xml
        - ${WEB_PROJECT}/target/failsafe-reports/TEST-*.xml
        - ${APP_PROJECT}/target/surefire-reports/TEST-*.xml
        - ${APP_PROJECT}/target/failsafe-reports/TEST-*.xml
  rules:
    - if: $CI_COMMIT_TAG

app-build:
  stage: app-build
  image: maven:3.8.5-openjdk-17
  script:
    - mvn clean package
  artifacts:
    when: always
    expire_in: "1 days"
    paths:
      - ${ARTIFACT_JAR_PATH}
  rules:
    - if: $CI_COMMIT_TAG

image-push:
  stage: image-push
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]
  script:
    - mkdir -p /kaniko/.docker
    - echo "{\"auths\":{\"${HARBOR_HOST}\":{\"auth\":\"$(echo -n ${HARBOR_USERNAME}:${HARBOR_PASSWORD} | base64)\"}}}" > /kaniko/.docker/config.json
    - >-
      /kaniko/executor
      --context "${CI_PROJECT_DIR}"
      --dockerfile "${CI_PROJECT_DIR}/Dockerfile"
      --build-arg ARTIFACT_JAR_NAME=${ARTIFACT_JAR_NAME}
      --build-arg ARTIFACT_JAR_PATH=${ARTIFACT_JAR_PATH}
      --destination "${HARBOR_HOST}/${HARBOR_PROJECT}/${PARENT_PROJECT}:${CI_COMMIT_TAG}"
  rules:
    - if: $CI_COMMIT_TAG
```

この runner は 3 つのステージ`app-test`, `app-build`, `image-push`で構成されます。

#### 共通設定

各ステージ共通の環境変数を設定します。

| 環境変数名          | 概要                                   |
| ------------------- | -------------------------------------- |
| `ARTIFACT_JAR_NAME` | jar ファイル名                         |
| `ARTIFACT_JAR_PATH` | Java プロジェクト内の jar ファイルパス |
| `PARENT_PROJECT`    | 親プロジェクト名                       |
| `WEB_PROJECT`       | web プロジェクト名                     |
| `APP_PROJECT`       | app プロジェクト名                     |

#### app-test ステージ

Java アプリの UT を一括実行し、テスト結果を artifact として保存します。

```yml
app-test:
  stage: app-test
  image: maven:3.8.5-openjdk-17
  script:
    - mvn clean verify
  artifacts:
    when: always
    reports:
      junit:
        - ${WEB_PROJECT}/target/surefire-reports/TEST-*.xml # 各種プロジェクトのテストレポートのパス
        - ${WEB_PROJECT}/target/failsafe-reports/TEST-*.xml
        - ${APP_PROJECT}/target/surefire-reports/TEST-*.xml
        - ${APP_PROJECT}/target/failsafe-reports/TEST-*.xml
  rules:
    - if: $CI_COMMIT_TAG
```

#### app-build ステージ

Java アプリのビルドを実行し、jar ファイルを artifact として保存します。

```yml
app-build:
  stage: app-build
  image: maven:3.8.5-openjdk-17
  script:
    - mvn clean package
  artifacts:
    when: always
    expire_in: "1 days" # artifactの保存期間
    paths:
      - ${ARTIFACT_JAR_PATH}
  rules:
    - if: $CI_COMMIT_TAG
```

#### image-push ステージ

jar ファイルを配置したアプリコンテナのイメージを作成し、harbor に push します。

```yml
image-push:
  stage: image-push
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]
  script:
    - mkdir -p /kaniko/.docker
    - echo "{\"auths\":{\"${HARBOR_HOST}\":{\"auth\":\"$(echo -n ${HARBOR_USERNAME}:${HARBOR_PASSWORD} | base64)\"}}}" > /kaniko/.docker/config.json
    - >-
      /kaniko/executor
      --context "${CI_PROJECT_DIR}"
      --dockerfile "${CI_PROJECT_DIR}/Dockerfile"
      --build-arg ARTIFACT_JAR_NAME=${ARTIFACT_JAR_NAME}
      --build-arg ARTIFACT_JAR_PATH=${ARTIFACT_JAR_PATH}
      --destination "${HARBOR_HOST}/${HARBOR_PROJECT}/${PARENT_PROJECT}:${CI_COMMIT_TAG}"
  rules:
    - if: $CI_COMMIT_TAG
```

- 下記環境変数は GitLab の CI/CD 設定画面で登録しておきます。
  - `HARBOR_HOST`: harbor のホスト名または IP アドレス
  - `HARBOR_USERNAME`: harbor のユーザ名
  - `HARBOR_PASSWORD`: harbor ユーザのパスワード
  - `HARBOR_PROJECT`: コンテナイメージを保存する harbor 上のプロジェクト名
- `--build-arg`によって、後述の Dockerfile 上に環境変数を渡します。

### Dockerfile

```Dockerfile
FROM eclipse-temurin:17-jdk

# ARG: イメージビルド時に使われる環境変数
ARG ARTIFACT_JAR_NAME
ARG ARTIFACT_JAR_PATH
ARG ARTIFACT_STORE_PATH='/nob'

# ENV: コンテナ稼働時に使われる環境変数
ENV artifact_jar_name=${ARTIFACT_JAR_NAME}
ENV artifact_store_path=${ARTIFACT_STORE_PATH}

# コンテナ内にディレクトリを作成し、jarファイルを格納する
RUN mkdir -p ${ARTIFACT_STORE_PATH}
COPY ${ARTIFACT_JAR_PATH} ${ARTIFACT_STORE_PATH}

# コンテナ起動時のコマンドでJavaアプリを実行する
CMD java -jar ${artifact_store_path}/${artifact_jar_name}
```
