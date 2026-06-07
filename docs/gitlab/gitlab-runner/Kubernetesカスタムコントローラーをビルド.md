# Kubernetesカスタムコントローラーをビルド

GitLab Runnerを使ってKubernetesカスタムコントローラーのコンテナイメージをビルドします。カスタムコントローラーはKubebuilderをベースに実装されていることを前提とします。

## 設定ファイル

### `.gitlab-ci.yml`

cf.

- [Build Docker images with BuildKit](https://docs.gitlab.com/ci/docker/using_buildkit/)
- [release](https://docs.gitlab.com/ci/yaml/#release)

下記ステージで構成します:

- テスト
  - テスト関数を一括実行し、カバレッジを出力します。
- ビルド
  - タグが切られたタイミングで、BuildKitを使ってコントローラーのコンテナイメージをビルドします。
  - 並行して、コントローラーデプロイ向けのマニフェストファイルを生成し、artifactに含めます。
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
    name: golang:1.25
  script:
    - go install gotest.tools/gotestsum@latest
    - make test
build_image:
  stage: build
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
        --local context=. \
        --local dockerfile=. \
        --output type=image,name=${HARBOR_HOST}/${HARBOR_PROJECT}/${CONTROLLER}:${CI_COMMIT_TAG},push=true,registry.insecure=true
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

- コントローラー: releaseからマニフェストyamlをダウンロード
- カスタムリソース: `config/samples/`配下の向けマニフェストyaml
