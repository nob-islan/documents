# Go CLI をビルド

GitLab Runner を使って Go の CLI アプリをビルドします。

## 設定ファイル

### .gitlab-ci.yml

cf.

- [Releases](https://docs.gitlab.com/user/project/releases/)
- [Job artifacts](https://docs.gitlab.com/api/job_artifacts/)

下記ステージで構成します:

- ビルド
  - `go build`でバイナリを作成します。
  - 複数 OS, アーキに対応する場合はそれぞれのバージョンに対してビルドしてください。
- リリース
  - `release-cli`コマンドを使います。
    - FIXME: `glab`への移行が推奨されていますが、http 通信での login ができないようだったので見送っています。
  - build ジョブで作成した artifact をダウンロードし、release 時の asset に追加します。

```yml
stages:
  - build
  - release
variables:
  MODULE: easycli # アプリのモジュール名
  COMMAND: cmd/${MODULE} # バイナリの生成場所
build:
  stage: build
  image: golang:1.23
  script:
    - cd ${COMMAND}
    - GOOS=linux GOARCH=arm64 go build -o ${MODULE}_${CI_COMMIT_TAG}_linux_arm64
    - GOOS=linux GOARCH=amd64 go build -o ${MODULE}_${CI_COMMIT_TAG}_linux_amd64
  artifacts:
    paths:
      - ${COMMAND}/${MODULE}_${CI_COMMIT_TAG}_*
    expire_in: "10 days"
  rules:
    - if: $CI_COMMIT_TAG
release:
  stage: release
  image: registry.gitlab.com/gitlab-org/release-cli:latest
  script:
    - |
      release-cli create \
        --name "${CI_COMMIT_TAG}" \
        --tag-name "${CI_COMMIT_TAG}" \
        --description "Release ${CI_COMMIT_TAG}" \
        --assets-link "{\"name\":\"${MODULE}_${CI_COMMIT_TAG}_linux_arm64 \", \"url\":\"${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/jobs/artifacts/${CI_COMMIT_TAG}/raw/${COMMAND}/${MODULE}_${CI_COMMIT_TAG}_linux_arm64?job=build\"}" \
        --assets-link "{\"name\":\"${MODULE}_${CI_COMMIT_TAG}_linux_amd64 \", \"url\":\"${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/jobs/artifacts/${CI_COMMIT_TAG}/raw/${COMMAND}/${MODULE}_${CI_COMMIT_TAG}_linux_amd64?job=build\"}"
  rules:
    - if: $CI_COMMIT_TAG
```
