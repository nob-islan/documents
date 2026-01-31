# Reactアプリをビルド

GitLab Runnerを使ってReactアプリケーションのコンテナイメージをビルドします。

## 設定ファイル

### Dockerfile

```Dockerfile
FROM node:24-bookworm

# 後述のci.yamlから渡される環境変数
ARG ARTIFACT_PATH

RUN npm install -g serve
COPY ${ARTIFACT_PATH} /dist

CMD ["serve", "-s", "dist"]
```

### .gitlab-ci.yml

下記ステージで構成します:

- モジュールビルド
- コンテナイメージpush

push先はharborを想定しています。

```yaml
stages:
  - build
  - push
variables:
  MODULE: easyweb # アプリのモジュール名
  ARTIFACT_PATH: ${MODULE}/dist # ビルド成果物のパス
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
