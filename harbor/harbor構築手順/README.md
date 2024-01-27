# harbor 構築手順

[docker_hub のドキュメント](https://hub.docker.com/r/bitnami/harbor-registry/)に従って構築していきます。

## 起動

下記コマンドで、必要なソース類のダウンロードおよびコンテナの起動を実行します。

```shell
curl -LO https://raw.githubusercontent.com/bitnami/containers/main/bitnami/harbor-portal/docker-compose.yml
curl -L https://github.com/bitnami/containers/archive/main.tar.gz | tar xz --strip=2 containers-main/bitnami/harbor-portal && cp -RL harbor-portal/config . && rm -rf harbor-portal
docker-compose up
```

- 起動前に`EXT_ENDPOINT`を変更してください。これが pull, push などをする際のアドレスとなります。
- 初期ユーザ名は`admin`です。パスワードは下記コマンドで確認できます。

```shell
cat docker-compose.yml | grep HARBOR_ADMIN_PASSWORD
```

## リポジトリの管理

- `Robot Accounts`からアカウントを作成して、アクセストークンを取得すれば、属人化しないアカウントで pull, push などができます。下記コマンドでログインできます。

```shell
docker login ${harborサーバのIPアドレス} -u ${robot_name} -p ${access_token}
```

`robot_name`をクオートで囲まないとエラーになるので注意してください。

## Tips

各種トラブルシュートです。

### docker pull 時に`Error response from daemon: Get "-": http: server gave HTTP response to HTTPS client`エラー

- 下記を pull したいサーバの`/etc/docker/daemon.json`に追記してください。

```json
{ "insecure-registries": [${harborサーバのIPアドレス}] }
```

- 下記で docker を再起動してください。

```shell
sudo systemctl restart docker
```
