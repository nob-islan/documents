# kindインストール手順

ローカルでマルチノードk8s環境を立ち上げるツールであるkindをインストールします。

cf. https://kind.sigs.k8s.io/docs/user/quick-start/

## インストール手順

### 前提

`docker`および`kubectl`をインストールしてください。

cf.

- https://docs.docker.com/engine/install/
- https://kubernetes.io/docs/tasks/tools/#kubectl

### kindのインストール

kindのダウンロード

```shell
# For AMD64 / x86_64
[ $(uname -m) = x86_64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.32.0/kind-linux-amd64

# For ARM64
[ $(uname -m) = aarch64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.32.0/kind-linux-arm64
```

kindバイナリを実行可能にする

```shell
chmod +x ./kind
```

kindバイナリをPATHに通す

```shell
sudo mv ./kind /usr/local/bin/kind
```

インストールされていることを確認

```shell
kind version
```

## 使い方

```shell
# クラスタ構築
kind create cluster
```

コントロールプレーンオンリーのクラスタが立ち上がります。

```shell
# クラスタ削除
kind delete cluster
```

クラスタが消えます。

```shell
# マルチノードクラスタ構築
kind create cluster --config first-kind.yaml
```
