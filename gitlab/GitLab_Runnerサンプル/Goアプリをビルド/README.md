# Go アプリをビルド

GitLab Runner を使って Go アプリケーションのコンテナイメージをビルドします。

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
- [コードカバレッジ](https://docs.gitlab.com/ci/testing/code_coverage.html)
- [ジョブのアーティファクト](https://docs.gitlab.com/ee/ci/jobs/job_artifacts.html)
- [kaniko を使ってコンテナイメージビルド・push](https://docs.gitlab.com/ee/ci/docker/using_kaniko.html)

下記ステージで構成します:

- UT 一括実行
  - テスト結果およびカバレッジの達成率についてはパイプラインのジョブ上から確認できます。
  - カバレッジの詳細についてはアーティファクトに出力しているのでダウンロードすることで確認できます。
  - 下記サンプルでは、カバレッジの正確な計測のために`controller`, `service`パッケージ配下のみテストしています。
- モジュールビルド
- コンテナイメージ push
  - push 先は harbor を想定しています。

```yml
stages:
  - test
  - build
  - push
variables:
  MODULE: easyapp # アプリのモジュール名
  ARTIFACT_PATH: ${MODULE}/main # ビルド成果物のパス
test:
  stage: test
  image: golang:1.23
  script:
    - cd ${MODULE}
    - go install gotest.tools/gotestsum@latest
    - gotestsum --junitfile report.xml -- -coverprofile=coverage.txt ./controller/... ./service/...
    - go tool cover -html=coverage.txt -o coverage.html
    - go tool cover -func=coverage.txt
  coverage: '/total:\s+\(statements\)\s+.+%/'
  artifacts:
    when: always
    paths:
      - coverage.html
    reports:
      junit: report.xml
  artifacts:
    when: always
    reports:
      junit: ${MODULE}/report.xml
  rules:
    - if: $CI_COMMIT_TAG
build:
  stage: build
  image: golang:1.23
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
