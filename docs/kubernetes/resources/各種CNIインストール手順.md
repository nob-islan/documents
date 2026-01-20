# 各種CNIインストール手順

各種CNIを使ってのKubernetesクラスタ構築手順を記載します。

cf. https://kubernetes.io/ja/docs/concepts/cluster-administration/addons/#networking-and-network-policy

## flannel

cf. https://github.com/flannel-io/flannel#deploying-flannel-manually

### 手順

- kubelet, kubeadm, kubectlインストール後、コントロールプレーンノードを初期化します:

```shell
# sudo kubeadm init \
#   --pod-network-cidr={podのcidr} \
#   --apiserver-advertise-address={コントロールプレーンノードのIP}
sudo kubeadm init \
  --pod-network-cidr=10.20.0.0/16 \
  --apiserver-advertise-address=192.168.1.1
```

- flannelのマニフェストをダウンロードします:

```shell
wget https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml
```

- `net-conf.json`内の`Network`を先に設定したpodのcidrに合わせます:

```yaml
net-conf.json: |
  {
    "Network": "10.244.0.0/16", 
    "EnableNFTables": false,
    "Backend": {
      "Type": "vxlan"
    }
  }
```

- flannelのリソースを作成します:

```shell
kubectl apply -f kube-flannel.yml
```

- flannelのリソースが作成されることを確認します:

```shell
watch kubectl get pods -n kube-flannel
```

## Calico

cf. https://docs.tigera.io/calico/latest/getting-started/kubernetes/self-managed-onprem/onpremises#install-calico

### 手順

- kubelet, kubeadm, kubectlインストール後、コントロールプレーンノードを初期化します:

```shell
# sudo kubeadm init \
#   --pod-network-cidr={podのcidr} \
#   --apiserver-advertise-address={コントロールプレーンノードのIP}
sudo kubeadm init \
  --pod-network-cidr=10.20.0.0/16 \
  --apiserver-advertise-address=192.168.1.1
```

- Tigera operatorおよびCRDをインストールします:

```shell
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.30.2/manifests/operator-crds.yaml
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.30.2/manifests/tigera-operator.yaml
```

- カスタムリソースの設定ファイルをダウンロードします:

```shell
curl https://raw.githubusercontent.com/projectcalico/calico/v3.30.2/manifests/custom-resources.yaml -O
```

- `custom-resources.yaml`の`spec.calicoNetwork.ipPools.cidr`を先に設定したpodのcidrに合わせます:

```yml
Installation
apiVersion: operator.tigera.io/v1
kind: Installation
metadata:
  name: default
spec:
  # Configures Calico networking.
  calicoNetwork:
    ipPools:
    - name: default-ipv4-ippool
      blockSize: 26
      cidr: 192.168.0.0/16 # 👈👈👈👈👈
      encapsulation: VXLANCrossSubnet
      natOutgoing: Enabled
      nodeSelector: all()
```

- Calicoのリソースを作成します:

```shell
kubectl create -f custom-resources.yaml
```

- Calicoのリソースが作成されることを確認します:

```shell
watch kubectl get pods -n calico-system
```
