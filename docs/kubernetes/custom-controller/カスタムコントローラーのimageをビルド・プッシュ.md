# カスタムコントローラーの image をビルド・プッシュ

kubebuilder で実装したカスタムコントローラーについて、コンテナイメージをビルドおよびプッシュする手順を記載します。

## 手順

### ビルド・プッシュ

- yaml マニフェストの生成および CRD の登録を行います。

```shell
# export IMG={コンテナレジストリ}/{プロジェクト}/{リポジトリ}:{タグ}
export IMG=harbor.nob/nob/nob-controller:latest
```

- コンテナイメージをビルドします:

```shell
make docker-build
```

- コンテナイメージを push します:

```shell
make docker-push
```

### image を使ってコントローラー起動

プッシュしたコンテナイメージを使ってローカルでコントローラーを起動できます。

```shell
make deploy
```
