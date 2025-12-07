# Kubernetes から http 通信でコンテナレジストリと疎通する

http 通信でコンテナレジストリと疎通をとり、イメージを pull する方法です。

## 手順

cf. https://github.com/containerd/containerd/blob/main/docs/hosts.md

- ワーカーノードで下記を実行します:

```shell
sudo mkdir -p /etc/containerd/certs.d/{コンテナレジストリのIP}:80
sudo tee /etc/containerd/certs.d/{コンテナレジストリのIP}:80/hosts.toml << 'EOF'
server = "http://{コンテナレジストリのIP}:80"

[host."http://{コンテナレジストリのIP}:80"]
  capabilities = ["pull", "resolve"]
  skip_verify = true
EOF
```

- containerd を再起動します:

```shell
sudo systemctl restart containerd
```
