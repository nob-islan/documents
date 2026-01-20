# Ingress構築手順

クラスタ外部からのHTTP/HTTPS通信を制御するIngressの構築および動作確認手順です。

## 参考文献

- [Ingress official document](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [Ingress Installation Guide](https://kubernetes.github.io/ingress-nginx/deploy/)

## 手順

サンプルとして、`/api/v1/greet`および`/api/v1/bye`エンドポイントを用意したアプリをデプロイすることを想定します。

### リソース作成

- Ingress Controllerをインストールします:

```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.13.2/deploy/static/provider/cloud/deploy.yaml
```

- Ingressリソースを作成します:

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
            path: /api
            backend:
              service:
                name: sample-service
                port:
                  number: 8080
```

- ServiceおよびDeploymentを作成します:

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

- Ingressが待ち受けているポートを確認します:

```
$ kubectl get svc ingress-nginx-controller -n ingress-nginx
NAME                       TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)                      AGE
ingress-nginx-controller   LoadBalancer   10.105.79.217   <pending>     80:31522/TCP,443:30602/TCP   4m13s
```

- curlで疎通確認をとります:

```
$ curl localhost:31522/api/v1/greet
Hello, World!

$ curl localhost:31522/api/v1/bye
GoodBye, World!
```

- ロードバランサーがデプロイされている場合は、クラスタ外から疎通をとることができます:

```
$ kubectl get svc ingress-nginx-controller -n ingress-nginx
NAME                       TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)                      AGE
ingress-nginx-controller   LoadBalancer   10.105.79.217   192.168.151.61   80:31522/TCP,443:30602/TCP   8m46s
```

```
% curl 192.168.151.61/api/v1/greet
Hello, World!

% curl 192.168.151.61/api/v1/bye
GoodBye, World!
```
