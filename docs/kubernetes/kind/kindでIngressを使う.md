# kindでIngressを使う

cf. https://kind.sigs.k8s.io/docs/user/ingress

## 手順

サンプルとして、`/sample/greet`および`/sample/bye`エンドポイントを用意したアプリをデプロイすることを想定します。

### クラスタ作成

Ingress向けにポートを開放したクラスタを構築する必要があるので注意してください:

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
        protocol: TCP
      - containerPort: 443
        hostPort: 443
        protocol: TCP
```

### リソース作成

- Ingress nginxを起動:

```shell
kubectl apply -f https://kind.sigs.k8s.io/examples/ingress/deploy-ingress-nginx.yaml
```

- リソースが構築されるまで待機:

```shell
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

- Ingressリソース作成

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sample-ingress
spec:
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

- 動作確認用アプリリソース作成

```yaml
kind: Service
apiVersion: v1
metadata:
  name: sample-service
spec:
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

- curlで疎通確認をとります:

```
$ curl {kind IP}:80/sample/greet
Hello, World!

$ curl {kind IP}:80/sample/bye
GoodBye, World!
```
