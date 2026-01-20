# Argo Workflowsへのhttp通信を許可

cf. https://github.com/argoproj/argo-workflows/discussions/6836

## 手順

- Deployment: `argo-server`に下記設定を追加します:

```diff
 spec:
   template:
     spec:
       containers:
       - args:
         - server
         - --auth-mode
         - server
         - --auth-mode
         - client
+        - --secure=false
```

```diff
 spec:
   template:
     spec:
       containers:
         readinessProbe:
           failureThreshold: 3
           httpGet:
             path: /
             port: 2746
-            scheme: HTTPS
+            scheme: HTTP
```

- `argo-server`を再起動します:

```shell
kubectl rollout restart deploy -n argo argo-server
```
