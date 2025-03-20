# Kubernetes クラスター構築手順

公式ドキュメントに従って Kubernetes クラスターを構築します。

## 事前準備

cf. https://kubernetes.io/ja/docs/setup/production-environment/tools/kubeadm/_print/

### マシン

VirtualBox 上で仮想マシンを立てて構築します。ドキュメントに記載されている最低条件ギリギリです。

- メモリ：2GB
- CPU：2 コア
- HDD: 32GB
- OS: Ubuntu 20.04.3

### エラー回避のための設定

swap を無効化します。

```
sudo swapoff -a
```

ただし、上記の方法だとノードを再起動すると swap が再度有効化されてしまいます。永続的に無効化したい場合は`/etc/fstab`ファイルの swap に関する行をコメントアウトしてリブートします。

## コントロールプレーン構築

### ランタイムのインストール

cf. https://kubernetes.io/ja/docs/setup/production-environment/container-runtimes/

必要な設定を追加します。

```
cat | sudo tee /etc/modules-load.d/containerd.conf <<EOF
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

# 必要なカーネルパラメータの設定をします。これらの設定値は再起動後も永続化されます。
cat | sudo tee /etc/sysctl.d/99-kubernetes-cri.conf <<EOF
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
net.bridge.bridge-nf-call-ip6tables = 1
EOF

sudo sysctl --system
```

containerd をインストールします。

```
# HTTPS越しのリポジトリの使用をaptに許可するためにパッケージをインストール
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
```

```
# Docker公式のGPG鍵を追加
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

```
# Dockerのaptリポジトリの追加
sudo add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) \
    stable"
```

```
# containerdのインストール
sudo apt-get update
sudo apt-get install -y containerd.io
```

```
# containerdの設定
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
```

Ubuntu 22.04 あたりから、上記 config.toml の `[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]` について、`SystemdCgroup = true` に書き換えないといけなくなったようです。

```
# containerdの再起動
sudo systemctl restart containerd
```

### kubeadm, kubelet, kubectl のインストール

cf. https://kubernetes.io/ja/docs/setup/production-environment/tools/kubeadm/_print/#kubeadm-kubelet-kubectlのインストール

```
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gpg

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

### コントロールプレーンの起動

cf. https://kubernetes.io/ja/docs/setup/production-environment/tools/kubeadm/_print/#pg-134ed1f6142a98e6ac681a1ba4920e53

コントロールプレーンノードを初期化します。`kubeadm join`コマンドを控えておいてください。

```
sudo kubeadm init
```

一般ユーザでも`kubectl`コマンドを叩けるようにします。

```
mkdir -p $HOME/.kube
sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

CNI プラグインを適用します。これが無いと`kubectl get node`で確認した際のノードの Status が`NotReady`のまま動きません。  
cf. https://www.weave.works/docs/net/latest/kubernetes/kube-addon/#-installation

```
kubectl apply -f https://github.com/weaveworks/weave/releases/download/v2.8.1/weave-daemonset-k8s.yaml
```

## ワーカーノード構築

cf. https://kubernetes.io/ja/docs/setup/production-environment/tools/kubeadm/_print/#join-nodes

### kubeXXX インストール

コントロールプレーン構築の[ランタイムのインストール](#ランタイムのインストール)および[kubeadm, kubelet, kubectl のインストール](#kubeadm-kubelet-kubectlのインストール)と同様の手順を踏んでください。

### ノードをクラスターに参加させる

先に控えた`kubeadm join`コマンドを叩きます。しばらく経ってから`kubectl get nodes`するとノードの Status が`Ready`になります。
