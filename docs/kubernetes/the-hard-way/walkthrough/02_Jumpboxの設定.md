# 2. Jumpboxの設定

各種ノードへのモジュール配布およびリモートでのコマンド実行を担うjumpboxをセットアップします。

## コマンドのインストール

必要なコマンドをインストールします。

```shell
sudo apt update
sudo apt install -y wget curl vim openssl
```

## バイナリのダウンロード

必要なバイナリ一覧について記載した`downloads.txt`を作成します。ダウンロード元の情報については下記を参照してください。

- [dl.k8s.io](https://dl.k8s.io/)
  - [kubectl](https://kubernetes.io/docs/reference/kubectl/kubectl/)
  - [kube-apiserver](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-apiserver/)
  - [kube-scheduler](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-scheduler/)
  - [kube-proxy](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-proxy/)
  - [kubelet](https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/)
- [cri-tools](https://github.com/kubernetes-sigs/cri-tools/)
- [runc](https://github.com/opencontainers/runc/)
- [CNI plugins](https://github.com/containernetworking/plugins/)
- [containerd](https://github.com/containerd/containerd/)
- [etcd](https://github.com/etcd-io/etcd/)

```shell
ARCH=$(dpkg --print-architecture)
KUBECTL_VERSION=v1.35.5
KUBE_APISERVER_VERSION=v1.35.5
KUBE_CONTROLLER_MANAGER_VERSION=v1.35.5
KUBE_SCHEDULER_VERSION=v1.35.5
KUBE_PROXY_VERSION=v1.35.5
KUBELET_VERSION=v1.35.5
CRI_TOOLS_VERSION=v1.35.0
RUNC_VERSION=v1.4.3
CNI_PRUGINS_VERSION=v1.8.0
CONTAINERD_VERSION=2.2.5
ETCD_VERSION=v3.6.13

cat << EOF > downloads.txt
https://dl.k8s.io/${KUBECTL_VERSION}/bin/linux/${ARCH}/kubectl
https://dl.k8s.io/${KUBE_APISERVER_VERSION}/bin/linux/${ARCH}/kube-apiserver
https://dl.k8s.io/${KUBE_CONTROLLER_MANAGER_VERSION}/bin/linux/${ARCH}/kube-controller-manager
https://dl.k8s.io/${KUBE_SCHEDULER_VERSION}/bin/linux/${ARCH}/kube-scheduler
https://dl.k8s.io/${KUBE_PROXY_VERSION}/bin/linux/${ARCH}/kube-proxy
https://dl.k8s.io/${KUBELET_VERSION}/bin/linux/${ARCH}/kubelet
https://github.com/kubernetes-sigs/cri-tools/releases/download/${CRI_TOOLS_VERSION}/crictl-${CRI_TOOLS_VERSION}-linux-${ARCH}.tar.gz
https://github.com/opencontainers/runc/releases/download/${RUNC_VERSION}/runc.${ARCH}
https://github.com/containernetworking/plugins/releases/download/${CNI_PRUGINS_VERSION}/cni-plugins-linux-${ARCH}-${CNI_PRUGINS_VERSION}.tgz
https://github.com/containerd/containerd/releases/download/v${CONTAINERD_VERSION}/containerd-${CONTAINERD_VERSION}-linux-${ARCH}.tar.gz
https://github.com/etcd-io/etcd/releases/download/${ETCD_VERSION}/etcd-${ETCD_VERSION}-linux-${ARCH}.tar.gz
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
tar -xvf downloads/crictl-${CRI_TOOLS_VERSION}-linux-${ARCH}.tar.gz -C downloads/worker/
tar -xvf downloads/containerd-${CONTAINERD_VERSION}-linux-${ARCH}.tar.gz --strip-components 1 -C downloads/worker/
tar -xvf downloads/cni-plugins-linux-${ARCH}-${CNI_PRUGINS_VERSION}.tgz -C downloads/cni-plugins/
tar -xvf downloads/etcd-${ETCD_VERSION}-linux-${ARCH}.tar.gz -C downloads/ --strip-components 1 etcd-${ETCD_VERSION}-linux-${ARCH}/etcdctl etcd-${ETCD_VERSION}-linux-${ARCH}/etcd
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
