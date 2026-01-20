# Web-based terminalを有効化

cf. https://argo-cd.readthedocs.io/en/stable/operator-manual/web_based_terminal/

## 手順

- ConfigMap: `argocd-cm` に下記設定を追記します:

```yaml
data:
  exec.enabled: "true"
```

- ClusterRole: `argocd-server` に下記設定を追記します（namespaced modeの場合は同名のRoleに追記）:

```yaml
- apiGroups:
    - ""
  resources:
    - pods/exec
  verbs:
    - create
```
