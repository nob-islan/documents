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

- Calico のリソースが作成されることを確認します:

```shell
watch kubectl get pods -n calico-system
```
