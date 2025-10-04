# kind で Argo CD を使う

参考: https://argo-cd.readthedocs.io/en/stable/getting_started/

## クラスタの準備

kind をインストールしておいてください。

## クラスタ起動

以下の yaml ファイルを用いてクラスタを起動します。type を`NodePort`としてクラスタ外と通信ができるようにしています。

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 30080
        hostPort: 30070
        protocol: TCP
  - role: worker
  - role: worker
```

```
kind create cluster --name first-cluster --config first-cluster.yaml
```

## Argo CD 起動

namespace を作成します。

```
kubectl create namespace argocd
```

マニフェストを読み込んで Argo CD を起動します。

```
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

`argocd-server`サービスを一部変更して NodePort に対応させます。

```
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort", "ports": [{"name": "http", "port": 80, "protocol": "TCP", "targetPort": 8080, "nodePort": 30080}]}}'
```

Argo CD CLI をインストールします。

```
curl -SL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64
```

【M1 Mac 対応】Argo CD CLI をインストールします。

```
curl -SL -o argocd-linux-arm64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-arm64
sudo install -m 555 argocd-linux-arm64 /usr/local/bin/argocd
rm argocd-linux-arm64
```

初回ログイン用のパスワードを入手します。

```
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```

CLI を使ってログインします。

```
argocd login ${ホストサーバのIPアドレス}:30070
```

パスワードを更新します。

```
argocd account update-password
```

`http://${ホストサーバのIPアドレス}:30070`にアクセスすれば GUI でログインができます。

## アプリケーションのデプロイ

事前に別途リポジトリを用意し、例えば以下のような Deployment および Service の各種マニフェストファイルを格納しておきます。

`first-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: first-deployment
spec:
  selector:
    matchLabels:
      app: first-nginx
  replicas: 3
  template:
    metadata:
      labels:
        app: first-nginx
    spec:
      containers:
        - name: first-nginx
          image: nginx:1.18
          ports:
            - containerPort: 80
```

`first-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: first-service
spec:
  type: NodePort
  ports:
    - port: 8099
      targetPort: 80
      protocol: TCP
      nodePort: 30080
  selector:
    app: first-nginx
```

GUI にて「+ NEW APP」を押下して、以下を入力します。

- Application Name: 任意のアプリ名
- Project: "default"
- Repository URL: リポジトリの URL（例: https://github.com/1ruyamaguchi/argocd-first-kube-deploy.git）
- Revision: "HEAD"
- Path: デプロイに使うファイルのパス
- Cluster: "https://kubernetes.default.svc"
- Namespace: "default"

プライベートリポジトリを指定する場合は下記のコマンドで認証を通してください:

```
argocd repo add https://gitlab.com/nob/first-cluster-inspection.git --username <username> --password <password>
```

アプリケーションが作成されていることを確認します。

```
argocd app get ${Application Name}
```

アプリケーションをデプロイします。

```
argocd app sync ${Application Name}
```
