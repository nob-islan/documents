# 2. Jumpboxの設定

各種ノードへのモジュール配布およびリモートでのコマンド実行を担う`jumpbox`をセットアップします。

## コマンドのインストール

必要なコマンドをインストールします。

```shell
sudo apt update
sudo apt install -y wget curl vim openssl git
```

## バイナリのダウンロード

必要なバイナリ一覧について記載した`downloads.txt`を作成します。TODO バージョン調整、環境変数化

```shell
ARCH=$(dpkg --print-architecture)
cat << EOF > downloads.txt
https://dl.k8s.io/v1.32.3/bin/linux/${ARCH}/kubectl
https://dl.k8s.io/v1.32.3/bin/linux/${ARCH}/kube-apiserver
https://dl.k8s.io/v1.32.3/bin/linux/${ARCH}/kube-controller-manager
https://dl.k8s.io/v1.32.3/bin/linux/${ARCH}/kube-scheduler
https://dl.k8s.io/v1.32.3/bin/linux/${ARCH}/kube-proxy
https://dl.k8s.io/v1.32.3/bin/linux/${ARCH}/kubelet
https://github.com/kubernetes-sigs/cri-tools/releases/download/v1.32.0/crictl-v1.32.0-linux-${ARCH}.tar.gz
https://github.com/opencontainers/runc/releases/download/v1.3.0-rc.1/runc.${ARCH}
https://github.com/containernetworking/plugins/releases/download/v1.6.2/cni-plugins-linux-${ARCH}-v1.6.2.tgz
https://github.com/containerd/containerd/releases/download/v2.1.0-beta.0/containerd-2.1.0-beta.0-linux-${ARCH}.tar.gz
https://github.com/etcd-io/etcd/releases/download/v3.6.0-rc.3/etcd-v3.6.0-rc.3-linux-${ARCH}.tar.gz
EOF
```

```shell
wget -q --show-progress \
  --https-only \
  --timestamping \
  -P downloads \
  -i downloads.txt
```

ダウンロードできていることを確認します。

```shell
ls -oh downloads
```

```
$ ls -oh downloads
total 566M
-rw-rw-r-- 1 nob 51M Jan  6  2025 cni-plugins-linux-amd64-v1.6.2.tgz
-rw-rw-r-- 1 nob 38M Mar 18  2025 containerd-2.1.0-beta.0-linux-amd64.tar.gz
-rw-rw-r-- 1 nob 19M Dec  9  2024 crictl-v1.32.0-linux-amd64.tar.gz
-rw-rw-r-- 1 nob 23M Mar 27  2025 etcd-v3.6.0-rc.3-linux-amd64.tar.gz
-rw-rw-r-- 1 nob 89M Mar 12  2025 kube-apiserver
-rw-rw-r-- 1 nob 83M Mar 12  2025 kube-controller-manager
-rw-rw-r-- 1 nob 64M Mar 12  2025 kube-proxy
-rw-rw-r-- 1 nob 63M Mar 12  2025 kube-scheduler
-rw-rw-r-- 1 nob 55M Mar 12  2025 kubectl
-rw-rw-r-- 1 nob 74M Mar 12  2025 kubelet
-rw-rw-r-- 1 nob 12M Mar  4  2025 runc.amd64
```

ダウンロードしたファイルを展開します。

```shell
mkdir -p downloads/{client,cni-plugins,controller,worker}
tar -xvf downloads/crictl-v1.32.0-linux-${ARCH}.tar.gz -C downloads/worker/
tar -xvf downloads/containerd-2.1.0-beta.0-linux-${ARCH}.tar.gz --strip-components 1 -C downloads/worker/
tar -xvf downloads/cni-plugins-linux-${ARCH}-v1.6.2.tgz -C downloads/cni-plugins/
tar -xvf downloads/etcd-v3.6.0-rc.3-linux-${ARCH}.tar.gz -C downloads/ --strip-components 1 etcd-v3.6.0-rc.3-linux-${ARCH}/etcdctl etcd-v3.6.0-rc.3-linux-${ARCH}/etcd
mv downloads/{etcdctl,kubectl} downloads/client/
mv downloads/{etcd,kube-apiserver,kube-controller-manager,kube-scheduler} downloads/controller/
mv downloads/{kubelet,kube-proxy} downloads/worker/
mv downloads/runc.${ARCH} downloads/worker/runc
rm -rf downloads/*gz
```

展開したファイルに実行権を付与します。

```shell
chmod +x downloads/{client,cni-plugins,controller,worker}/*
```

## `kubectl`のインストール

`kubectl`コマンドをインストールします。

```shell
sudo cp downloads/client/kubectl /usr/local/bin/
```

`kubectl`コマンドを実行できることを確認します。

```shell
kubectl version --client
```

```
$ kubectl version --client
Client Version: v1.32.3
Kustomize Version: v5.5.0
```

次: [認証局の割り当ておよびTLS証明書の作成](./03_認証局の割り当てとTLS証明書の作成.md)
