# Kubernetes カスタムコントローラーをビルド

GitLab Runner を使って Kubernetes カスタムコントローラーのコンテナイメージをビルドします。カスタムコントローラーは kubebuilder をベースに実装されていることを前提とします。

## 設定ファイル

### .gitlab-ci.yml

```yml
stages:
  - build
variables:
  CONTROLLER: nob-controller # コントローラーのプロジェクト名
image_build:
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

kubebuilder によって自動生成される Makefile に下記を追記します:

```Makefile
.PHONY: manifest
manifest: manifests kustomize ## Deploy controller to the K8s cluster specified in ~/.kube/config.
	cd config/manager && $(KUSTOMIZE) edit set image controller=${IMG}
	$(KUSTOMIZE) build config/default > config/samples/controller.yml
```

## デプロイ手順

### Runner 側の操作

- タグを切って GitLab Runner を実行し、コンテナイメージをレジストリに push します。

### カスタムコントローラープロジェクト側の操作

- カスタムコントローラープロジェクトにて各種マニフェストの生成を行います:

```shell
# export IMG={コンテナレジストリ}/{プロジェクト}/{リポジトリ}:{タグ}
export IMG=nob-harbor.ddo.jp/first-kube-operator/nob-controller:latest

# マニフェスト生成
make manifest
```

### Kubernetes クラスタ側の操作

- 作成したマニフェストを apply してコントローラーを起動します:

```shell
# カスタムコントローラー起動
kubectl apply -f /path/to/controller.yml

# カスタムリソース作成
kubectl apply -f /path/to/custom-resource.yml
```
