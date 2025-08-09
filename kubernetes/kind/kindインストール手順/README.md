# kind インストール手順

ローカルでマルチノード k8s 環境を立ち上げるツールである kind をインストールします。

## スペック

- Ubuntu20.04.1 LTS
  - メモリ 2GB 以上
  - 空き容量 20GB 以上

## インストール手順

`Docker`および`kubectl`が必要なので併せてインストールします。

### Docker のインストール

[Docker インストール](../../../docker/Docker%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB/README.md)を参考にインストールします。

### kubectl のインストール

kubectl のダウンロード

```
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
```

【M1 Mac 対応】kubectl のダウンロード

```
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/arm64/kubectl"
```

kubectl のチェックサムファイルをダウンロード

```
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"
```

【M1 Mac 対応】kubectl のチェックサムファイルをダウンロード

```
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/arm64/kubectl.sha256"
```

チェックサムファイルに対して kubectl バイナリを検証

```
echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check
```

kubectl のインストール

```
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

インストールされていることを確認

```
kubectl version --client
```

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
kind create cluster --config first-kind.yml
```

以下の yaml に従って、マルチノードのクラスタが立ち上がります。

```yml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  # コントロールプレーン1台
  - role: control-plane
  # ワーカーノード2台
  - role: worker
  - role: worker
```
