# Secretでのコンテナレジストリ登録手順

secretにコンテナレジストリの認証情報を登録して、プライベートなレジストリからimageをpullします。

cf. https://kubernetes.io/docs/concepts/configuration/secret/#docker-config-secrets

## 手順

- secretを作成します:

```shell
kubectl create secret docker-registry regcred \
  --docker-server="{docker server IP}" \
  --docker-username="{docker username}" \
  --docker-password="{docker password}"
```

- deployment.yamlに`imagePullSecrets`を追加します:

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
