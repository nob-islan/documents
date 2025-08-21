# Kubernetes カスタムコントローラーをビルド

GitLab Runner を使って Kubernetes カスタムコントローラーのコンテナイメージをビルドします。カスタムコントローラーは kubebuilder をベースに実装されていることを前提とします。

## 設定ファイル

### .gitlab-ci.yml

```yml
stages:
  - test
  - build
variables:
  CONTROLLER: nob-controller # コントローラーのプロジェクト名
test:
  stage: test
  image:
    name: golang:1.23
  script:
    - cd ${CONTROLLER}
    - go install gotest.tools/gotestsum@latest
    - make test
    - go tool cover -html=cover.out -o coverage.html
    - go tool cover -func=cover.out
  artifacts:
    when: always
    paths:
      - ${CONTROLLER}/coverage.html
  rules:
    - if: $CI_COMMIT_TAG
build:
  stage: build
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]
  script:
    - mkdir -p /kaniko/.docker
    - echo "{\"auths\":{\"${HARBOR_HOST}\":{\"auth\":\"$(echo -n ${HARBOR_USERNAME}:${HARBOR_PASSWORD} | base64)\"}}}" > /kaniko/.docker/config.json
    - >-
      /kaniko/executor
      --context "${CI_PROJECT_DIR}/${CONTROLLER}"
      --dockerfile "${CI_PROJECT_DIR}/${CONTROLLER}/Dockerfile"
      --destination "${HARBOR_HOST}/${HARBOR_PROJECT}/${CONTROLLER}:${CI_COMMIT_TAG}"
  rules:
    - if: $CI_COMMIT_TAG
```

### Makefile

kubebuilder によって自動生成される Makefile に下記を追記します。`make deploy`で作成されるそれと同じマニフェストを`deploy`配下に配置します。`config/samples`配下のカスタムリソースマニフェストと併せてコントローラーを動かす想定です:

```Makefile
.PHONY: manifest
manifest: manifests kustomize ## Deploy controller to the K8s cluster specified in ~/.kube/config.
	cd config/manager && $(KUSTOMIZE) edit set image controller=${IMG}
	mkdir -p deploy
	$(KUSTOMIZE) build config/default > deploy/controller.yaml
```

## デプロイ手順

### カスタムコントローラープロジェクト側の操作

- カスタムコントローラープロジェクトにて各種マニフェストの生成を行います:

```shell
# export IMG={コンテナレジストリ}/{プロジェクト}/{リポジトリ}:{タグ}
export IMG=nob-harbor.ddo.jp/first-kube-operator/nob-controller:latest

# マニフェスト生成
make manifest
```

### Runner 側の操作

- タグを切って GitLab Runner を実行し、コンテナイメージをレジストリに push します。

### Kubernetes クラスタ側の操作

- 作成したマニフェストを apply してコントローラーを起動します:

```shell
# カスタムコントローラー起動
kubectl apply -f /path/to/controller.yaml

# カスタムリソース作成
kubectl apply -f /path/to/custom_resource.yaml
```
