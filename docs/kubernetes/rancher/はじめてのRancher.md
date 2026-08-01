# はじめてのRancher

Kubernetesクラスタ管理ツール[Rancher](https://ranchermanager.docs.rancher.com/rancher-manager)を構築します。

cf. https://ranchermanager.docs.rancher.com/getting-started/quick-start-guides/deploy-rancher-manager/helm-cli

## 手順

- `helm`コマンドが必要なので[Installing Helm](https://helm.sh/ja/docs/intro/install/)に従ってインストールします。

- rancherのリポジトリを追加します:

```shell
helm repo add rancher-latest https://releases.rancher.com/server-charts/latest
```

- Rancher向けの名前空間を作成します:

```shell
kubectl create namespace cattle-system
```

- [cert-manager](https://github.com/cert-manager/cert-manager)をインストールします:

```shell
export CERT_MANAGER_VERSION=v1.21.1
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/${CERT_MANAGER_VERSION}/cert-manager.crds.yaml
```

- jetstackのリポジトリを追加します:

```shell
helm repo add jetstack https://charts.jetstack.io
```

- リポジトリを更新します:

```shell
helm repo update
```

- cert-managerをインストールします:

```shell
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace
```

- rancherをインストールします:

```shell
export RANCHER_HOSTNAME=localhost
export BOOTSTRAP_PASSWORD=p@ssw0rdp@ssw0rd
helm install rancher rancher-latest/rancher \
  --namespace cattle-system \
  --set hostname=${RANCHER_HOSTNAME} \
  --set replicas=1 \
  --set bootstrapPassword=${BOOTSTRAP_PASSWORD}
```

- Kind上に構築している場合、ServiceのタイプをNodePortに変更してクラスタ外部から疎通が取れるようにします:

```shell
kubectl patch svc rancher -n cattle-system -p '{"spec": {"type": "NodePort", "ports": [{"name": "https", "port": 443, "protocol": "TCP", "targetPort": 443, "nodePort": 30443}]}}'
```

https://localhost:30443 にアクセスするとRancherの画面が表示されます。
