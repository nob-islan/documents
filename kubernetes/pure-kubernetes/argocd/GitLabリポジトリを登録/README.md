# GitLab リポジトリを登録

ArgoCD に GitLab のリポジトリを登録し、マニフェストから k8s リソースをデプロイできるようにします。

cf. https://argo-cd.readthedocs.io/en/release-1.8/user-guide/private-repositories/

## 手順

- プライベートリポジトリの認証情報を登録します:

```shell
argocd repo add http://{GitLab リポジトリのURL} --username {username} --password {password}
```
