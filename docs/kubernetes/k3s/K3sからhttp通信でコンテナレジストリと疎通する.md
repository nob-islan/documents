# K3s から http 通信でコンテナレジストリと疎通する

http 通信でコンテナレジストリと疎通をとり、イメージを pull する方法です。

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
