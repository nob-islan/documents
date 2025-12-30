# Argo CD 構築手順

Argo CD を構築します。

cf. https://argo-cd.readthedocs.io/en/stable/getting_started/

## 構築手順

- Argo CD をインストールします:

```shell
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

- Argo CD の API Server にアクセスできるよう、サービスタイプを変更します:

```shell
# ロードバランサがある場合 type: LoadBalancer
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# ロードバランサがない場合 type: NodePort
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort", "ports": [{"name": "http", "port": 80, "protocol": "TCP", "targetPort": 8080, "nodePort": 30080}]}}'
```

- Argo CD CLI をインストールします:

```shell
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64
```

- CLI がインストールされていることを確認します:

```shell
argocd version
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
