# K3sからhttp通信でコンテナレジストリと疎通する

http通信でコンテナレジストリと疎通をとり、イメージをpullする方法です。

## 手順

cf. https://docs.k3s.io/installation/private-registry#without-tls

- `/etc/rancher/k3s/registries.yaml` を下記内容で作成します:

```yaml
mirrors:
  {コンテナレジストリのIP}:80:
    endpoint:
      - "http://{コンテナレジストリのIP}:80"
configs:
  "{コンテナレジストリのIP}:80":
    auth:
      username: xxxxxx # this is the registry username
      password: xxxxxx # this is the registry password
```

- K3sを再起動します:

```shell
sudo systemctl restart k3s
```
