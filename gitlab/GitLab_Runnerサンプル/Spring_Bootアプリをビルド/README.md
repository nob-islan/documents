# Spring Boot アプリをビルド

GitLab Runner を使って Spring Boot アプリケーションのコンテナイメージをビルドします。

## 設定ファイル

### Dockerfile

```Dockerfile
FROM openjdk:17

# 後述のci.ymlから渡される環境変数
ARG ARTIFACT_PATH
ARG ARTIFACT_NAME

# コンテナ起動後に参照される環境変数
ENV artifact_name=${ARTIFACT_NAME}

COPY ${ARTIFACT_PATH} /${ARTIFACT_NAME}

CMD ["sh", "-c", "java -jar /${artifact_name}"]
```

### .gitlab-ci.yml

cf.

- [UT 結果を Web で確認](https://docs.gitlab.com/ci/testing/unit_test_report_examples/#maven)
- [ジョブのアーティファクト](https://docs.gitlab.com/ee/ci/jobs/job_artifacts.html)
- [kaniko を使ってコンテナイメージビルド・push](https://docs.gitlab.com/ee/ci/docker/using_kaniko.html)

下記ステージで構成します:

- UT 一括実行
- モジュールビルド
- コンテナイメージ push

push 先は harbor を想定しています。

```yml
stages:
  - test
  - build
  - push
variables:
  BASE_PACKAGE: com.example # ベースパッケージ
  MODULE: easyapp # アプリのモジュール名
  ARTIFACT_NAME: ${MODULE}-0.0.1-SNAPSHOT.jar # ビルド成果物のファイル名
  ARTIFACT_PATH: ${MODULE}/target/${ARTIFACT_NAME} # ビルド成果物のパス
test:
  stage: test
  image: openjdk:17
  script:
    - cd ${MODULE}
    - ./mvnw verify -Dtest="${BASE_PACKAGE}.${MODULE}.controller.*Test,${BASE_PACKAGE}.${MODULE}.service.*Test,${BASE_PACKAGE}.${MODULE}.repository.*Test" # controller, service, repositoryのみテスト
  artifacts:
    when: always
    reports:
      junit:
        - ${MODULE}/target/surefire-reports/TEST-*.xml
        - ${MODULE}/target/failsafe-reports/TEST-*.xml
  rules:
    - if: $CI_COMMIT_TAG
build:
  stage: build
  image: openjdk:17
  script:
    - cd ${MODULE}
    - ./mvnw package
  artifacts:
    paths:
      - ${ARTIFACT_PATH}
    expire_in: "10 days"
  rules:
    - if: $CI_COMMIT_TAG
push:
  stage: push
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
      --build-arg ARTIFACT_PATH=${ARTIFACT_PATH}
      --build-arg ARTIFACT_NAME=${ARTIFACT_NAME}
      --destination "${HARBOR_HOST}/${HARBOR_PROJECT}/${MODULE}:${CI_COMMIT_TAG}"
  rules:
    - if: $CI_COMMIT_TAG
```
