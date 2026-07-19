# Kanikoでコンテナイメージをビルド・プッシュ

[kaniko](https://github.com/chainguard-forks/kaniko)を使ってコンテナイメージを作成するためのGitLab CI向け設定を記載します。

cf.

- https://gitlab.com/gitlab-ci-utils/container-images/kaniko
- https://gitlab.com/gitlab-org/gitlab/-/blob/hmehra-ci-token-git-clone/doc/ci/docker/using_kaniko.md

## 設定

### 環境変数

GitLab上に、下記要領で環境変数を登録しておいてください:

- `HARBOR_HOST`: {harborサーバのIP}:80
- `HARBOR_USERNAME`: `robot$nobo`などアカウント名
- `HARBOR_PASSWORD`: アクセストークン
- `HARBOR_PROJECT`: harbor上のプロジェクト名

### `.gitlab-ci.yml`

```yaml
stages:
  - test
variables:
  MODULE: easyapp # アプリのモジュール名
  ARTIFACT_PATH: main # ビルド成果物のパス
push:
  stage: push
  image:
    name: registry.gitlab.com/gitlab-ci-utils/container-images/kaniko:debug
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
