# Ingress 構築手順

クラスタ外部からの HTTP/HTTPS 通信を制御する Ingress の構築および動作確認手順です。

## 参考文献

- [Ingress official document](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [Ingress Installation Guide](https://kubernetes.github.io/ingress-nginx/deploy/)

## 手順

サンプルとして、`/sample/greet`および`/sample/bye`エンドポイントを用意したアプリをデプロイすることを想定します。

### リソース作成

- Ingress Controller をインストールします:

```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.13.2/deploy/static/provider/cloud/deploy.yaml
```

- Ingress リソースを作成します:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sample-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  ingressClassName: nginx
  rules:
    - http:
        paths:
          - pathType: Prefix
            path: /sample
            backend:
              service:
                name: sample-service
                port:
                  number: 8080
```

- Service および Deployment を作成します:

```yaml
kind: Service
apiVersion: v1
metadata:
  name: sample-service
spec:
  type: NodePort
  selector:
    app: sample
  ports:
    - port: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-deploy
  labels:
    app: sample
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sample
  template:
    metadata:
      labels:
        app: sample
    spec:
      containers:
        - name: sample
          image: nobexample/easyapp:latest
          ports:
            - containerPort: 8080
```

### 動作確認

- Ingress が待ち受けているポートを確認します:

```shell
kubectl get svc ingress-nginx-controller -n ingress-nginx
```

- curl で疎通確認をとります:

```
$ curl localhost:31579/sample/greet
Hello, World!

$ curl localhost:31579/sample/bye
GoodBye, World!
```
