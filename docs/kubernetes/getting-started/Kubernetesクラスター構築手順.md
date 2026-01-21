# Kubernetesクラスター構築手順

公式ドキュメントに従ってKubernetesクラスターを構築します。

## 事前準備

cf. https://kubernetes.io/ja/docs/setup/production-environment/tools/kubeadm/_print/

### エラー回避のための設定

swapを無効化します。

```shell
sudo swapoff -a
```

ただし、上記の方法だとノードを再起動するとswapが再度有効化されてしまいます。永続的に無効化したい場合は`/etc/fstab`ファイルのswapに関する行をコメントアウトしてリブートします。

## コントロールプレーン構築

cf. https://kubernetes.io/ja/docs/setup/production-environment/tools/kubeadm/install-kubeadm/

### コンテナランタイムのインストール

cf. https://kubernetes.io/ja/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#installing-runtime

必要な設定を追加します。

```shell
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

#### containerdのインストール

cf. https://github.com/containerd/containerd/blob/main/docs/getting-started.md

```shell
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

# containerdのインストール
sudo apt-get update
sudo apt-get install -y containerd.io

# containerdの設定
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
```

`config.toml`の`[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]`について、`SystemdCgroup = true`に書き換えます。

```shell
# SystemdCgroup設定書き換え
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/g' /etc/containerd/config.toml
# containerdの再起動
sudo systemctl restart containerd
```

### kubeadm, kubelet, kubectlのインストール

cf. https://kubernetes.io/ja/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#kubeadm-kubelet-kubectlのインストール

```shell
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gpg

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.35/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.35/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

### コントロールプレーンの起動

cf. https://kubernetes.io/ja/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/#コントロールプレーンノードの初期化

コントロールプレーンノードを初期化します。`kubeadm join`コマンドを控えておいてください。

```shell
sudo kubeadm config images pull
export APISERVER_ADVERTISE_ADDRESS=`hostname -I | awk '{print $1}'`
sudo kubeadm init \
  --pod-network-cidr=10.20.0.0/16 \
  --apiserver-advertise-address=${APISERVER_ADVERTISE_ADDRESS}
```

一般ユーザでも`kubectl`コマンドを叩けるようにします。

```shell
mkdir -p $HOME/.kube
sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### CNIのインストール

cf. https://kubernetes.io/ja/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/#pod-network

CNIプラグインを適用します。これが無いと`kubectl get node`で確認した際のノードのStatusがNotReadyのまま動きません。各CNIについては下記を参照ください:  
cf. https://kubernetes.io/ja/docs/concepts/cluster-administration/addons/#networking-and-network-policy

flannelのマニフェストをダウンロードします:

```shell
wget https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml
```

`net-conf.json`内の`Network`を先に設定したpodのcidrに合わせます:

```shell
sudo sed -i 's/"Network": "10.244.0.0\/16"/"Network": "10.20.0.0\/16"/' kube-flannel.yml
```

flannelのリソースを作成します:

```shell
kubectl apply -f kube-flannel.yml
```

flannelのリソースが作成されることを確認します:

```shell
watch kubectl get pods -n kube-flannel
```

ノードのステータスがReadyになっていれば完了です。

```shell
kubectl get nodes
```

## ワーカーノード構築

cf. https://kubernetes.io/ja/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/#join-nodes

### kubeXXXインストール

コントロールプレーン構築の「コンテナランタイムのインストール」および「kubeadm, kubelet, kubectlのインストール」と同様の手順を踏んでください。

### ノードをクラスターに参加させる

先に控えた`kubeadm join`コマンドを叩きます。しばらく経ってから`kubectl get nodes`するとノードのStatusがReadyになります。
