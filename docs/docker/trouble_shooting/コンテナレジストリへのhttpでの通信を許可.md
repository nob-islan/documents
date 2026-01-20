# コンテナレジストリへのhttpでの通信を許可

docker pull / push時に`Error response from daemon: Get "-": http: server gave HTTP response to HTTPS client`エラーが発生した場合の対処方法です。

## 手順

- 下記をpullしたいサーバの`/etc/docker/daemon.json`に追記してください。

```json
{ "insecure-registries": ["${harborサーバのIPアドレス}:80"] }
```

- 下記でdockerを再起動してください。

```shell
sudo systemctl restart docker
```
