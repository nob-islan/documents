# Reactアプリをビルド

GitLab Runnerを使ってReactアプリケーションのコンテナイメージをビルドします。

## 設定ファイル

### `Dockerfile`

```Dockerfile
FROM node:24-bookworm

# 後述のci.yamlから渡される環境変数
ARG ARTIFACT_PATH

RUN npm install -g serve
COPY ${ARTIFACT_PATH} /dist

CMD ["serve", "-s", "dist"]
```

### `.gitlab-ci.yml`

cf.

- [Vitest JUnit Reporter](https://vitest.dev/guide/reporters.html#junit-reporter)
- [Unit test report examples](https://docs.gitlab.com/ci/testing/unit_test_report_examples/)
- [Build Docker images with BuildKit](https://docs.gitlab.com/ci/docker/using_buildkit/)

下記ステージで構成します:

- UT一括実行
  - テスト結果およびカバレッジの達成率についてはパイプラインのジョブ上から確認できます。
  - カバレッジの詳細についてはアーティファクトに出力しているのでダウンロードすることで確認できます。
- モジュールビルド
- コンテナイメージpush
  - push先はharborを想定しています。

```yaml
stages:
  - test
  - build
  - push
variables:
  MODULE: easyweb # アプリのモジュール名
  ARTIFACT_PATH: ${MODULE}/dist # ビルド成果物のパス
test:
  image: node:24-bookworm
  stage: test
  script:
    - cd ${MODULE}
    - npm install
    - npx vitest --reporter=junit --outputFile=junit.xml --coverage # カバレッジレポートを出力するために依存関係の追加が必要なことに注意
  artifacts:
    when: always
    paths:
      - ${MODULE}/coverage
    reports:
      junit:
        - ${MODULE}/junit.xml
  rules:
    - if: $CI_COMMIT_TAG
build:
  stage: build
  image: node:24-bookworm
  script:
    - cd ${MODULE}
    - npm install
    - npm run build
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
  script: # registry.insecure=trueを付与してHTTP通信を許可
    - |
      buildctl-daemonless.sh build \
        --frontend dockerfile.v0 \
        --local context=${CI_PROJECT_DIR} \
        --local dockerfile=${MODULE} \
        --opt build-arg:ARTIFACT_PATH=${ARTIFACT_PATH} \
        --output type=image,name=${HARBOR_HOST}/${HARBOR_PROJECT}/${MODULE}:${CI_COMMIT_TAG},push=true,registry.insecure=true
  rules:
    - if: $CI_COMMIT_TAG
```
