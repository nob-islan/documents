# React アプリをビルド

GitLab Runner を使って React アプリケーションのコンテナイメージをビルドします。

## 設定ファイル

### Dockerfile

```Dockerfile
FROM node:24-bullseye

# 後述のci.yamlから渡される環境変数
ARG ARTIFACT_PATH

RUN npm install -g serve
COPY ${ARTIFACT_PATH} /build

CMD ["serve", "-s", "build"]
```

### .gitlab-ci.yml

下記ステージで構成します:

- モジュールビルド
- コンテナイメージ push

push 先は harbor を想定しています。

```yaml
stages:
  - build
  - push
variables:
  MODULE: easyweb # アプリのモジュール名
  ARTIFACT_PATH: ${MODULE}/build # ビルド成果物のパス
build:
  stage: build
  image: node:24-bullseye
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
