# カスタムコントローラーのimageをビルド・プッシュ

Kubebuilderで実装したカスタムコントローラーについて、コンテナイメージをビルドおよびプッシュする手順を記載します。

## 手順

### ビルド・プッシュ

- yamlマニフェストの生成およびCRDの登録を行います。

```shell
# export IMG={コンテナレジストリ}/{プロジェクト}/{リポジトリ}:{タグ}
export IMG=harbor.nob/nob/nob-controller:latest
```

- コンテナイメージをビルドします:

```shell
make docker-build
```

- コンテナイメージをpushします:

```shell
make docker-push
```

### imageを使ってコントローラー起動

- プッシュしたコンテナイメージを使ってローカルでコントローラーを起動できます。

```shell
make deploy
```

- コントローラーが動いていることを確認します。

```shell
# kubectl get deployment -n {goプロジェクト名}-system
kubectl get deployment -n nob-controller-system
```

- CRのマニフェストファイルをapplyすればReconcileが始まります。

```shell
# kubectl apply -f {CRマニフェストファイルパス}
kubectl apply -f config/samples/nobcontroller_v1_nob.yaml
```

- 下記コマンドで後片付けができます。

```shell
make undeploy
```
