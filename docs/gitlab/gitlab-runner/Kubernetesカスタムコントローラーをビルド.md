# Kubernetes カスタムコントローラーをビルド

GitLab Runner を使って Kubernetes カスタムコントローラーのコンテナイメージをビルドします。カスタムコントローラーは Kubebuilder をベースに実装されていることを前提とします。

## 設定ファイル

### .gitlab-ci.yml

cf.

- [Using kaniko](https://docs.gitlab.com/ee/ci/docker/using_kaniko.html)
- [release](https://docs.gitlab.com/ci/yaml/#release)

下記ステージで構成します:

- テスト
  - テスト関数を一括実行し、カバレッジを出力します。
- ビルド
  - タグが切られたタイミングで、kaniko を使ってコントローラーのコンテナイメージをビルドします。
  - 並行して、コントローラーデプロイ向けのマニフェストファイルを生成し、artifact に含めます。
- リリース
  - 上記イメージビルドに併せてリリースを作成します。リリース画面からコントローラーのマニフェストがダウンロードできます。

```yaml
stages:
  - test
  - build
  - release
variables:
  CONTROLLER: nob-controller # コントローラー名
test:
  stage: test
  image:
    name: golang:1.24
  script:
    - go install gotest.tools/gotestsum@latest
    - make test
build_image:
  stage: build
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
      --destination "${HARBOR_HOST}/${HARBOR_PROJECT}/${CONTROLLER}:$CI_COMMIT_TAG"
  rules:
    - if: $CI_COMMIT_TAG
build_manifest:
  stage: build
  image:
    name: alpine/k8s:1.34.1
  script:
    - cd ${CI_PROJECT_DIR}/config/manager && kustomize edit set image controller=${HARBOR_HOST}/${HARBOR_PROJECT}/${CONTROLLER}:$CI_COMMIT_TAG
    - cd ${CI_PROJECT_DIR} && mkdir deploy
    - kustomize build config/default > deploy/${CONTROLLER}.yaml
  artifacts:
    when: always
    paths:
      - deploy/${CONTROLLER}.yaml
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
        - name: ${CONTROLLER}.yaml
          filepath: /${CONTROLLER}.yaml
          url: ${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/jobs/artifacts/${CI_COMMIT_TAG}/raw/deploy/${CONTROLLER}.yaml?job=build_manifest
  rules:
    - if: $CI_COMMIT_TAG
```

## 成果物の利用手順

カスタムリソースを利用する際は下記マニフェストを利用してください:

- コントローラー: release からマニフェスト yaml をダウンロード
- カスタムリソース: `config/samples/` 配下の向けマニフェスト yaml
