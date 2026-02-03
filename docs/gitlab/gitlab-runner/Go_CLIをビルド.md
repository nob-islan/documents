# Go CLIをビルド

GitLab Runnerを使ってGoのCLIアプリをビルドします。

## 設定ファイル

### `.gitlab-ci.yml`

cf.

- [Job artifacts](https://docs.gitlab.com/api/job_artifacts/)
- [Releases](https://docs.gitlab.com/user/project/releases/)

下記ステージで構成します:

- ビルド
  - `go build`でバイナリを作成します。
    - サンプルとしてlinux向けのarm64, amd64対応版をビルドしています。
  - 複数OS, アーキに対応する場合はそれぞれのバージョンに対してビルドしてください。
- リリース
  - `gitlab-cli`を使います。
  - buildジョブで作成したartifactをダウンロードし、release時のassetに追加します。

```yaml
stages:
  - build
  - release
variables:
  MODULE: easycli # アプリのモジュール名
  COMMAND: cmd/${MODULE} # バイナリの生成場所
build:
  stage: build
  image: golang:1.24
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
  image: registry.gitlab.com/gitlab-org/cli:latest
  script:
    - echo "Running the release job."
  release:
    tag_name: ${CI_COMMIT_TAG}
    name: ${CI_COMMIT_TAG}
    description: Release version ${CI_COMMIT_TAG}
    assets:
      links:
        - name: ${MODULE}_${CI_COMMIT_TAG}_linux_arm64
          url: ${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/jobs/artifacts/${CI_COMMIT_TAG}/raw/${COMMAND}/${MODULE}_${CI_COMMIT_TAG}_linux_arm64?job=build
        - name: ${MODULE}_${CI_COMMIT_TAG}_linux_amd64
          url: ${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/jobs/artifacts/${CI_COMMIT_TAG}/raw/${COMMAND}/${MODULE}_${CI_COMMIT_TAG}_linux_amd64?job=build
  rules:
    - if: $CI_COMMIT_TAG
```
