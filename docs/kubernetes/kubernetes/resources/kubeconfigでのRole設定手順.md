# kubeconfig での Role 設定手順

`kubeconfig`を記載することで Role によって Kubernetes の操作権限を制御します。

cf.

- [サービスアカウント](https://kubernetes.io/ja/docs/concepts/security/service-accounts/)
- [RBAC 認可を使用する](https://kubernetes.io/ja/docs/reference/access-authn-authz/rbac/)
- [kubeconfig ファイルを使用してクラスターアクセスを組織する](https://kubernetes.io/ja/docs/concepts/configuration/organize-cluster-access-kubeconfig/)

## 手順

例として、Pod の参照のみ可能な kubeconfig を作成します。

- ServiceAccount を作成します:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: pod-reader
  namespace: default
```

- Role を作成します:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list"]
```

- RoleBinding を作成します:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
  - kind: ServiceAccount
    name: pod-reader
    namespace: default
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

- 認証トークンを作成します:

```shell
kubectl create token pod-reader -n default
```

- `kubeconfig`を作成します:

```yaml
apiVersion: v1
kind: Config
clusters:
  - name: my-cluster
    cluster:
      server: https://<API_SERVER>
      #certificate-authority-data: <CA_DATA> # base64 encoded
      insecure-skip-tls-verify: true
users:
  - name: pod-reader
    user:
      token: <TOKEN>
contexts:
  - name: pod-reader-context
    context:
      cluster: my-cluster
      namespace: default
      user: pod-reader
current-context: pod-reader-context
```

- `kubeconfig`を適用します:

```shell
export KUBECONFIG=path/to/config
```
