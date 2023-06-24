# harbor 構築手順

[docker_hub のドキュメント](https://hub.docker.com/r/bitnami/harbor-registry/)に従って構築していきます。

## 起動

下記コマンドで、必要なソース類のダウンロードおよびコンテナの起動を実行します。

```
curl -LO https://raw.githubusercontent.com/bitnami/containers/main/bitnami/harbor-portal/docker-compose.yml
curl -L https://github.com/bitnami/containers/archive/main.tar.gz | tar xz --strip=2 containers-main/bitnami/harbor-portal && cp -RL harbor-portal/config . && rm -rf harbor-portal
docker-compose up
```

- 起動前に`EXT_ENDPOINT`を変更してください。これが pull, push などをする際のアドレスとなります。
- 初期ユーザ名は`admin`です。パスワードは下記コマンドで確認できます。

```
cat docker-compose.yml | grep HARBOR_ADMIN_PASSWORD
```
