# 9. `kubectl`の設定

リモートでKubernetesを操作するために`kubectl`のセットアップを行います。

## 管理者向けKubernetes設定ファイルの作成

adminユーザ向けkubeconfigファイルを作成します。`~/.kube/config`に出力されます。

```shell
kubectl config set-cluster kubernetes-the-hard-way \
  --certificate-authority=ca.crt \
  --embed-certs=true \
  --server=https://kube-c01.kubernetes.local:6443

kubectl config set-credentials admin \
  --client-certificate=admin.crt \
  --client-key=admin.key

kubectl config set-context kubernetes-the-hard-way \
  --cluster=kubernetes-the-hard-way \
  --user=admin

kubectl config use-context kubernetes-the-hard-way
```

`kubectl`が実行できることを確認します。

```shell
kubectl get nodes
```

```
$ kubectl get nodes
NAME       STATUS   ROLES    AGE   VERSION
kube-w01   Ready    <none>   45s   v1.35.5
kube-w02   Ready    <none>   48s   v1.35.5
```

次: [Podネットワークの割り当て](./10_Podネットワークの割り当て.md)
