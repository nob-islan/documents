# kind インストール手順

ローカルでマルチノード k8s 環境を立ち上げるツールである kind をインストールします。

## スペック

- Ubuntu20.04.1 LTS
  - メモリ 2GB 以上
  - 空き容量 20GB 以上

## インストール手順

### 前提

`docker`および`kubectl`をインストールしてください。

cf.

- https://docs.docker.com/engine/install/
- https://kubernetes.io/docs/tasks/tools/#kubectl

### kind のインストール

kind のダウンロード

```
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.14.0/kind-linux-amd64
```

【M1 Mac 対応】kind のダウンロード

```
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.14.0/kind-linux-arm64
```

kind バイナリを実行可能にする

```
chmod +x ./kind
```

kind バイナリを PATH に通す

```
sudo mv ./kind /usr/local/bin/kind
```

インストールされていることを確認

```
kind version
```

## 使い方

```
# クラスタ構築
kind create cluster
```

コントロールプレーンオンリーのクラスタが立ち上がります。

```
# クラスタ削除
kind delete cluster
```

クラスタが消えます。

```
# マルチノードクラスタ構築
kind create cluster --config first-kind.yaml
```

## クラスタ設定 yaml サンプル

- ワーカーノード 2 台を起動

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  # コントロールプレーン1台
  - role: control-plane
  # ワーカーノード2台
  - role: worker
  - role: worker
```

- NodePort 向けのポートを開放

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      # ServiceのNodePortに30080を指定するとホストマシンの30070へのアクセスがワーカーノードの30080に転送される
      - containerPort: 30080
        hostPort: 30070
        protocol: TCP
  - role: worker
  - role: worker
```
