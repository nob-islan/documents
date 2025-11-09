# Kubernetes カスタムコントローラーをビルド

GitLab Runner を使って Kubernetes カスタムコントローラーのコンテナイメージをビルドします。カスタムコントローラーは kubebuilder をベースに実装されていることを前提とします。

## 設定ファイル

### .gitlab-ci.yml

cf.

- [Using kaniko](https://docs.gitlab.com/ee/ci/docker/using_kaniko.html)
- [Code coverage](https://docs.gitlab.com/ci/testing/code_coverage/)
- [GitLab CLI](https://docs.gitlab.com/editor_extensions/gitlab_cli/)

下記ステージで構成します:

- テスト実行
  - テスト関数を一括実行し、カバレッジを出力します。
- イメージビルド
  - kaniko を使ってコントローラーのコンテナイメージをビルドします。
  - `.env`ファイルについて main ブランチと差分がある場合のみ実行されます。
    - `TAG`が書き換わってバージョンが上がる場合のみ実行される想定です。
  - 各種環境変数は`.env`で管理しますが、harbor のユーザ ID およびシークレットキーについてはセキュリティの関係上 GitLab の Environment 上で管理することを想定しています。
- リリース
  - `.env`が書き換わったブランチ（i.e., バージョンが上がったブランチ）がマージされたタイミングでリリースタグを作成します。

```yaml
stages:
  - test
  - build
  - release
test:
  stage: test
  image:
    name: golang:1.24
  script:
    - . ${CI_PROJECT_DIR}/.env
    - cd ${CONTROLLER}
    - go install gotest.tools/gotestsum@latest
    - make test
    - go tool cover -html=cover.out -o ../coverage.html
    - go tool cover -func=cover.out
  artifacts:
    when: always
    paths:
      - coverage.html
build:
  stage: build
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]
  script:
    - . ${CI_PROJECT_DIR}/.env
    - mkdir -p /kaniko/.docker
    - echo "{\"auths\":{\"${HARBOR_HOST}\":{\"auth\":\"$(echo -n ${HARBOR_USERNAME}:${HARBOR_PASSWORD} | base64)\"}}}" > /kaniko/.docker/config.json
    - >-
      /kaniko/executor
      --context "${CI_PROJECT_DIR}/${CONTROLLER}"
      --dockerfile "${CI_PROJECT_DIR}/${CONTROLLER}/Dockerfile"
      --destination "${HARBOR_HOST}/${HARBOR_PROJECT}/${CONTROLLER}:${TAG}"
  rules:
    - if: $CI_COMMIT_BRANCH
      changes:
        compare_to: "refs/heads/main"
        paths:
          - ".env"
release:
  stage: release
  image: registry.gitlab.com/gitlab-org/cli:latest
  script:
    - . ${CI_PROJECT_DIR}/.env
    - glab auth login --hostname ${CI_SERVER_HOST} --job-token ${CI_JOB_TOKEN} --api-host ${CI_SERVER_HOST}:80 --api-protocol http
    - glab release create ${TAG}
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      changes:
        - ".env"
```

### Makefile

環境変数の管理向けに`.env`ファイルを作成します。プロジェクトのルートディレクトリ直下に配置し、gitlab-ci.yml および Makefile から読み取れるようにします:

```shell
TAG=v1.0.0
HARBOR_HOST=nob-harbor.ddo.jp
HARBOR_PROJECT=first-kube-operator
CONTROLLER=nob-controller
IMG=${HARBOR_HOST}:80/${HARBOR_PROJECT}/${CONTROLLER}:${TAG}
```

kubebuilder によって自動生成される Makefile に下記を追記し、`make release`コマンドを用意します。`make deploy`で作成されるそれと同じマニフェストを`deploy`配下に配置します。`config/samples`配下のカスタムリソースマニフェストと併せてコントローラーを動かす想定です:

```Makefile
include ../.env
```

```Makefile
.PHONY: release
release: manifests kustomize ## Deploy controller to the K8s cluster specified in ~/.kube/config.
	cd config/manager && $(KUSTOMIZE) edit set image controller=${IMG}
	mkdir -p deploy
	$(KUSTOMIZE) build config/default > deploy/controller.yaml
```

## デプロイ手順

任意の feature ブランチにて下記手順を踏むことでデプロイが進みます:

- `.env`を書き換えてバージョンを更新します。
- `make release`コマンドでカスタムコントローラープロジェクトにて各種マニフェストの生成を行います:
- push 時に runner が動き、コンテナイメージが push されます。
- 作業ブランチがマージされたタイミングでリリースタグが切られます。

## 成果物の利用手順

マニフェストを apply してリソースを利用する際は`deploy`配下のコントローラー向けマニフェストおよび`config/samples`配下のカスタムリソース向けマニフェストを利用してください。
