# 4. 認証用のKubernetes構成ファイルの生成

[kubeconfig](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/)ファイルを作成し、Kubernetes APIサーバへの疎通および認証を通します。

## クライアント認証の作成

`kubelet`および`admin`ユーザ向けのkubeconfigファイルを作成します。

### `kubelet`向けKubernetes設定ファイル

`kubelet`サービス用のkubeconfigファイルを生成します。

```shell
for HOST in kube-w01 kube-w02; do
  kubectl config set-cluster kubernetes-the-hard-way \
    --certificate-authority=ca.crt \
    --embed-certs=true \
    --server=https://kube-c01.kubernetes.local:6443 \
    --kubeconfig=${HOST}.kubeconfig

  kubectl config set-credentials system:node:${HOST} \
    --client-certificate=${HOST}.crt \
    --client-key=${HOST}.key \
    --embed-certs=true \
    --kubeconfig=${HOST}.kubeconfig

  kubectl config set-context default \
    --cluster=kubernetes-the-hard-way \
    --user=system:node:${HOST} \
    --kubeconfig=${HOST}.kubeconfig

  kubectl config use-context default \
    --kubeconfig=${HOST}.kubeconfig
done
```

ファイルが生成されていることを確認します。

```shell
ls kube-w*.kubeconfig
```

```
$ ls kube-w*.kubeconfig
kube-w01.kubeconfig  kube-w02.kubeconfig
```

### `kube-proxy`向けKubernetes設定ファイル

`kube-proxy`サービス用のkubeconfigファイルを生成します。

```shell
kubectl config set-cluster kubernetes-the-hard-way \
  --certificate-authority=ca.crt \
  --embed-certs=true \
  --server=https://kube-c01.kubernetes.local:6443 \
  --kubeconfig=kube-proxy.kubeconfig

kubectl config set-credentials system:kube-proxy \
  --client-certificate=kube-proxy.crt \
  --client-key=kube-proxy.key \
  --embed-certs=true \
  --kubeconfig=kube-proxy.kubeconfig

kubectl config set-context default \
  --cluster=kubernetes-the-hard-way \
  --user=system:kube-proxy \
  --kubeconfig=kube-proxy.kubeconfig

kubectl config use-context default \
  --kubeconfig=kube-proxy.kubeconfig
```

ファイルが生成されていることを確認します。

```shell
ls kube-proxy.kubeconfig
```

```
$ ls kube-proxy.kubeconfig
kube-proxy.kubeconfig
```

### `kube-controller-manager`向けKubernetes設定ファイル

`kube-controller-manager`サービス用のkubeconfigファイルを生成します。

```shell
kubectl config set-cluster kubernetes-the-hard-way \
  --certificate-authority=ca.crt \
  --embed-certs=true \
  --server=https://kube-c01.kubernetes.local:6443 \
  --kubeconfig=kube-controller-manager.kubeconfig

kubectl config set-credentials system:kube-controller-manager \
  --client-certificate=kube-controller-manager.crt \
  --client-key=kube-controller-manager.key \
  --embed-certs=true \
  --kubeconfig=kube-controller-manager.kubeconfig

kubectl config set-context default \
  --cluster=kubernetes-the-hard-way \
  --user=system:kube-controller-manager \
  --kubeconfig=kube-controller-manager.kubeconfig

kubectl config use-context default \
  --kubeconfig=kube-controller-manager.kubeconfig
```

ファイルが生成されていることを確認します。

```shell
ls kube-controller-manager.kubeconfig
```

```
$ ls kube-controller-manager.kubeconfig
kube-controller-manager.kubeconfig
```

### `kube-scheduler`向けKubernetes設定ファイル

`kube-scheduler`サービス用のkubeconfigファイルを生成します。

```shell
kubectl config set-cluster kubernetes-the-hard-way \
  --certificate-authority=ca.crt \
  --embed-certs=true \
  --server=https://kube-c01.kubernetes.local:6443 \
  --kubeconfig=kube-scheduler.kubeconfig

kubectl config set-credentials system:kube-scheduler \
  --client-certificate=kube-scheduler.crt \
  --client-key=kube-scheduler.key \
  --embed-certs=true \
  --kubeconfig=kube-scheduler.kubeconfig

kubectl config set-context default \
  --cluster=kubernetes-the-hard-way \
  --user=system:kube-scheduler \
  --kubeconfig=kube-scheduler.kubeconfig

kubectl config use-context default \
  --kubeconfig=kube-scheduler.kubeconfig
```

ファイルが生成されていることを確認します。

```shell
ls kube-scheduler.kubeconfig
```

```
$ ls kube-scheduler.kubeconfig
kube-scheduler.kubeconfig
```

### `admin`ユーザ向けKubernetes設定ファイル

`admin`ユーザ用のkubeconfigファイルを生成します。

```shell
kubectl config set-cluster kubernetes-the-hard-way \
  --certificate-authority=ca.crt \
  --embed-certs=true \
  --server=https://127.0.0.1:6443 \
  --kubeconfig=admin.kubeconfig

kubectl config set-credentials admin \
  --client-certificate=admin.crt \
  --client-key=admin.key \
  --embed-certs=true \
  --kubeconfig=admin.kubeconfig

kubectl config set-context default \
  --cluster=kubernetes-the-hard-way \
  --user=admin \
  --kubeconfig=admin.kubeconfig

kubectl config use-context default \
  --kubeconfig=admin.kubeconfig
```

ファイルが生成されていることを確認します。

```shell
ls admin.kubeconfig
```

```
$ ls admin.kubeconfig
admin.kubeconfig
```

## Kubernetes構成ファイルの配布

`kube-controller-manager`および`kube-scheduler`向けのkubeconfigファイルを`kube-c01`に配布します。

```shell
scp admin.kubeconfig \
  kube-controller-manager.kubeconfig \
  kube-scheduler.kubeconfig \
  nob@kube-c01:~/
```

`kubelet`および`kube-proxy`向けのkubeconfigファイルを`kube-w01`, `kube-w02`に配布します。

```shell
for HOST in kube-w01 kube-w02; do
  ssh nob@${HOST} "sudo mkdir -p /var/lib/{kube-proxy,kubelet}"

  scp kube-proxy.kubeconfig nob@${HOST}:~/
  ssh nob@${HOST} "sudo mv ~/kube-proxy.kubeconfig /var/lib/kube-proxy/kubeconfig"

  scp ${HOST}.kubeconfig nob@${HOST}:~/
  ssh nob@${HOST} "sudo mv ~/${HOST}.kubeconfig /var/lib/kubelet/kubeconfig"
done
```

次: [データ暗号化設定とキーの生成](./05_データ暗号化設定とキーの生成.md)
