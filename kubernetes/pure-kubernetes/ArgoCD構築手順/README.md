# ArgoCD 構築手順

ArgoCD を構築します。

cf. https://argo-cd.readthedocs.io/en/stable/getting_started/

## 構築手順

- ArgoCD をインストールします:

```shell
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

- ArgoCD CLI をインストールします:

```shell
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64
```

- admin ユーザのパスワードを取得します:

```shell
argocd admin initial-password -n argocd
```

- admin ユーザでログインします:

```shell
argocd login {ARGOCD_SERVER}
```

- admin ユーザのパスワードを更新します:

```shell
argocd account update-password
```
