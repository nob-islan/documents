# コンテナレジストリの認証情報を登録

secret にコンテナレジストリの認証情報を登録して、プライベートなレジストリから image を pull します。

## 手順

- secret を作成します:

```shell
kubectl create secret docker-registry regcred \
  --docker-server="{docker server IP}" \
  --docker-username="{docker username}" \
  --docker-password="{docker password}"
```

- deployment.yaml に `imagePullSecrets` を追加します:

```diff
apiVersion: apps/v1
kind: Deployment
metadata:
  name: easyapp-deploy
  labels:
    app: easyapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: easyapp
  template:
    metadata:
      labels:
        app: easyapp
    spec:
      containers:
      - name: easyapp
        image: nobexample/easyapp:latest
        ports:
        - containerPort: 8080
+     imagePullSecrets:
+     - name: regcred
```
