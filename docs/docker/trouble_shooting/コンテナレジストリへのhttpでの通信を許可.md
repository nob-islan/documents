# コンテナレジストリへの http での通信を許可

docker pull / push 時に`Error response from daemon: Get "-": http: server gave HTTP response to HTTPS client`エラーが発生した場合の対処方法です。

## 手順

- 下記を pull したいサーバの`/etc/docker/daemon.json`に追記してください。

```json
{ "insecure-registries": ["${harborサーバのIPアドレス}:80"] }
```

- 下記で docker を再起動してください。

```shell
sudo systemctl restart docker
```
