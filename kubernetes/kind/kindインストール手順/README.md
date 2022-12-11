# kindインストール手順
ローカルでマルチノードk8s環境を立ち上げるツールであるkindをインストールする。  

## スペック
- Ubuntu20.04.1 LTS
  - メモリ 2GB以上
  - 空き容量20GB以上

## インストール手順
<!-- `brew`コマンドを使ってインストールできる。 -->
`Docker`および`kubectl`が必要なので併せてインストールする。
### Dockerのインストール

[Dockerインストール](../../../docker/Docker%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB/README.md)を参考にインストールする。

### kubectlのインストール

必要パッケージのインストール
```
sudo apt-get update && sudo apt-get install -y apt-transport-https gnupg2
```
```
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
```
```
echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee -a /etc/apt/sources.list.d/kubernetes.list
```

kubectlのインストール
```
sudo apt-get update
sudo apt-get install -y kubectl
```

kubectlバイナリをPATHに通す
```
sudo mv /usr/bin/kubectl /usr/local/bin/kubectl
```

kubectlがインストールされていること、およびバージョンを確認する
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

<!-- ### Homebrewのインストール

必要なパッケージをインストール
```
sudo apt-get install curl git build-essential
```

Homebrewをインストール
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

パスを通すために、インストール時に出た以下のコマンドを実行
```
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv"' >> /home/$USER/.profile
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
```

### kindのインストール

kindをインストール
```
brew install kind
```

kindのバージョンを確認
```
kind version
``` -->

## 使い方

```
# クラスタ構築
kind create cluster
```
コントロールプレーンオンリーのクラスタが立ち上がる。  


```
# クラスタ削除
kind delete cluster
```
クラスタが消える

```
# マルチノードクラスタ構築
kind create cluster --config first-kind.yml
```
以下のyamlに従って、マルチノードのクラスタが立ち上がる。
```yaml:first-kind.yml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
# コントロールプレーン1台
- role: control-plane
# ワーカーノード2台
- role: worker
- role: worker
```
