# ArgoCDと連携して自動リリース

`argocd`コマンドを実行してマニフェストをsyncし、Kubernetes上のアプリケーションを自動リリースします。

cf.

- https://hub.docker.com/r/argoproj/argocd
- https://argo-cd.readthedocs.io/en/latest/user-guide/commands/argocd/

## 設定

### 環境変数

- `ARGOCD_HOST`: ArgoCDサーバのIPアドレス
- `ARGOCD_PORT`: ArgoCDサーバのポート
- `ARGOCD_USERNAME`: ArgoCDのユーザ名
- `ARGOCD_PASSWORD`: ユーザのパスワード

### `.gitlab-ci.yml`

```yaml
stages:
  - deploy
variables:
  APPNAME: easyapp # アプリ名
deploy:
  stage: deploy
  image: argoproj/argocd:latest
  script:
    - argocd login ${ARGOCD_HOST}:${ARGOCD_PORT} --username ${ARGOCD_USERNAME} --password ${ARGOCD_PASSWORD} --insecure
    - argocd app sync ${APPNAME}
    - argocd app wait ${APPNAME}
  rules:
    - if: $CI_COMMIT_TAG
```
