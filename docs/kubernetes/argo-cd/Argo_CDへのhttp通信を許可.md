# Argo CDへのhttp通信を許可

cf. https://argo-cd.readthedocs.io/en/latest/operator-manual/ingress/#ambassador

## 手順

- ConfigMap: `argocd-cmd-params-cm` に下記設定を追加します:

```yaml
data:
  server.insecure: "true"
```

- `argocd-server` を再起動します:

```shell
kubectl rollout restart deployment -n argocd argocd-server
```
