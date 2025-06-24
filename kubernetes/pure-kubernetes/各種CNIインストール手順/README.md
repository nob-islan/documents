# 各種 CNI インストール手順

各種 CNI を使っての Kubernetes クラスタ構築手順を記載します。

cf. https://kubernetes.io/ja/docs/concepts/cluster-administration/addons/#networking-and-network-policy

## Calico

cf. https://docs.tigera.io/calico/latest/getting-started/kubernetes/self-managed-onprem/onpremises#install-calico

### 手順

- kubelet, kubeadm, kubectl インストール後、コントロールプレーンノードを初期化します:

```shell
# sudo kubeadm init \
#   --pod-network-cidr={podのcidr} \
#   --apiserver-advertise-address={コントロールプレーンノードのIP}
sudo kubeadm init \
  --pod-network-cidr=192.168.152.0/24 \
  --apiserver-advertise-address=192.168.1.1
```

- Tigera operator および CRD をインストールします:

```shell
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.30.2/manifests/operator-crds.yaml
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.30.2/manifests/tigera-operator.yaml
```

- カスタムリソースの設定ファイルをダウンロードします:

```shell
curl https://raw.githubusercontent.com/projectcalico/calico/v3.30.2/manifests/custom-resources.yaml -O
```

- `custom-resources.yaml`の`spec.calicoNetwork.ipPools.cidr`を先に設定した pod の cidr に合わせます:

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

- Calico のリソースを作成します:

```shell
kubectl create -f custom-resources.yaml
```

- Calico のリソースが作成されることを確認します:

```shell
watch kubectl get pods -n calico-system
```
