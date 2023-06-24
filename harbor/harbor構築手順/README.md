# harbor 構築手順

![docker_hubのドキュメント](https://hub.docker.com/r/bitnami/harbor-registry/)に従って構築していきます。

## 起動

下記コマンドで、必要なソース類のダウンロードおよびコンテナの起動を実行します。

```
curl -LO https://raw.githubusercontent.com/bitnami/containers/main/bitnami/harbor-portal/docker-compose.yml
curl -L https://github.com/bitnami/containers/archive/main.tar.gz | tar xz --strip=2 containers-main/bitnami/harbor-portal && cp -RL harbor-portal/config . && rm -rf harbor-portal
docker-compose up
```
