# アプリイメージをビルド

GitLab Runner を使ってアプリケーションのコンテナイメージをビルドします。

## 設定ファイル

### Dockerfile

```Dockerfile
FROM golang:1.23

# 後述のci.ymlから渡される環境変数
ARG ARTIFACT_PATH

COPY ${ARTIFACT_PATH} /main

CMD ["/main"]
```

### .gitlab-ci.yml

cf.

- [UT 結果を Web で確認](https://docs.gitlab.com/ee/ci/testing/unit_test_report_examples.html#go)
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
  MODULE: "easyapp" # アプリのモジュール名
  ARTIFACT_PATH: ${MODULE}/main # ビルド成果物のパス

test:
  image: golang:1.23
  stage: test
  script:
    - cd ${MODULE}
    - go install gotest.tools/gotestsum@latest
    - gotestsum --junitfile report.xml --format testname
  artifacts:
    when: always
    reports:
      junit: ${MODULE}/report.xml
  rules:
    - if: $CI_COMMIT_TAG
build:
  image: golang:1.23
  stage: build
  script:
    - cd ${MODULE}
    - go build cmd/main.go
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
      --destination "${HARBOR_HOST}/${HARBOR_PROJECT}/${MODULE}:${CI_COMMIT_TAG}"
  rules:
    - if: $CI_COMMIT_TAG
```
