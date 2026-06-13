# Goアプリをビルド

GitLab Runnerを使ってGoアプリケーションのコンテナイメージをビルドします。

## 設定ファイル

### `Dockerfile`

```Dockerfile
FROM golang:1.25

# 後述のci.yamlから渡される環境変数
ARG ARTIFACT_PATH

COPY ${ARTIFACT_PATH} /main

CMD ["/main"]
```

### `.gitlab-ci.yml`

cf.

- [UT結果をWebで確認](https://docs.gitlab.com/ee/ci/testing/unit_test_report_examples.html#go)
- [コードカバレッジ](https://docs.gitlab.com/ci/testing/code_coverage.html)
- [ジョブのアーティファクト](https://docs.gitlab.com/ee/ci/jobs/job_artifacts.html)
- [BuildKitでDockerイメージを作成](https://docs.gitlab.com/ci/docker/using_buildkit/)

下記ステージで構成します:

- UT一括実行
  - テスト結果およびカバレッジの達成率についてはパイプラインのジョブ上から確認できます。
  - カバレッジの詳細についてはアーティファクトに出力しているのでダウンロードすることで確認できます。
  - 下記サンプルでは、カバレッジの正確な計測のために`handler`, `usecase`, `repository`パッケージ配下のみテストしています。
- モジュールビルド
- コンテナイメージpush
  - push先はharborを想定しています。

```yaml
stages:
  - test
  - build
  - push
variables:
  MODULE: easyapp # アプリのモジュール名
  ARTIFACT_PATH: main # ビルド成果物のパス
test:
  stage: test
  image: golang:1.25
  script:
    - go install gotest.tools/gotestsum@latest
    - gotestsum --junitfile report.xml -- -coverprofile=coverage.txt ./internal/handler ./internal/usecase ./internal/infrastructure/repository
    - go tool cover -html=coverage.txt -o coverage.html
    - go tool cover -func=coverage.txt
  coverage: '/total:\s+\(statements\)\s+.+%/'
  artifacts:
    when: always
    paths:
      - coverage.html
    reports:
      junit: report.xml
  rules:
    - if: $CI_COMMIT_TAG
build:
  stage: build
  image: golang:1.25
  script:
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
    name: moby/buildkit:rootless
    entrypoint: [""]
  variables:
    BUILDKITD_FLAGS: --oci-worker-no-process-sandbox
  before_script:
    - mkdir -p ~/.docker
    - echo "{\"auths\":{\"$HARBOR_HOST\":{\"username\":\"$HARBOR_USERNAME\",\"password\":\"$HARBOR_PASSWORD\"}}}" > ~/.docker/config.json
  script:
    - |
      buildctl-daemonless.sh build \
        --frontend dockerfile.v0 \
        --local context=. \
        --local dockerfile=. \
        --opt build-arg:ARTIFACT_PATH=${ARTIFACT_PATH} \
        --output type=image,name=${HARBOR_HOST}/${HARBOR_PROJECT}/${MODULE}:${CI_COMMIT_TAG},push=true,registry.insecure=true
  rules:
    - if: $CI_COMMIT_TAG
```
