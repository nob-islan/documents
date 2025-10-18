# Web-based terminal を有効化

cf. https://argo-cd.readthedocs.io/en/stable/operator-manual/web_based_terminal/

## 手順

- ConfigMap: argocd-cm に下記設定を追記します:

```yaml
data:
  exec.enabled: "true"
```

- ClusterRole: argocd-server に下記設定を追記します（namespaced mode の場合は同名の Role に追記）:

```yaml
- apiGroups:
    - ""
  resources:
    - pods/exec
  verbs:
    - create
```

- argocd-server を再起動します:

```shell
kubectl rollout restart deployment argocd-server
```
