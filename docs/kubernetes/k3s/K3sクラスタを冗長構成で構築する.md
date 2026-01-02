# K3s クラスタを冗長構成で構築する

K3s にて、

- コントロールプレーン: 3 台
- ワーカーノード: 3 台

の構成のクラスタを構築します。

## 事前準備

コントロールプレーンに対して kubectl を実行するプロキシサーバを用意しておいてください。

## 手順

cf.

- https://docs.k3s.io/datastore/ha-embedded

### コントロールプレーン

#### 最初のコントロールプレーン

```shell
curl -sfL https://get.k3s.io | K3S_TOKEN=SECRET sh -s - server \
    --cluster-init \
    --tls-san {プロキシサーバのIP}
```

#### 2 台目以降のコントロールプレーン

```shell
curl -sfL https://get.k3s.io | K3S_TOKEN=SECRET sh -s - server \
    --server https://{プロキシサーバのIP}:6443 \
    --tls-san {プロキシサーバのIP}
```

### ワーカーノード

```shell
curl -sfL https://get.k3s.io | K3S_TOKEN=SECRET sh -s - agent \
    --server https://{プロキシサーバのIP}:6443
```
