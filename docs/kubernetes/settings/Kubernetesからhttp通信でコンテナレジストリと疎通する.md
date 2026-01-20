# Kubernetesからhttp通信でコンテナレジストリと疎通する

http通信でコンテナレジストリと疎通をとり、イメージをpullする方法です。

## 手順

cf. https://github.com/containerd/containerd/blob/main/docs/hosts.md

- ワーカーノードで下記を実行します:

```shell
# config.toml修正
sudo sed -i 's|config_path = '"'"'/etc/containerd/certs.d:/etc/docker/certs.d'"'"'|config_path = '"'"'/etc/containerd/certs.d'"'"'|g' /etc/containerd/config.toml

# hosts設定ファイル作成
sudo mkdir -p /etc/containerd/certs.d/{コンテナレジストリのIP}:80
sudo tee /etc/containerd/certs.d/{コンテナレジストリのIP}:80/hosts.toml << 'EOF'
server = "http://{コンテナレジストリのIP}:80"

[host."http://{コンテナレジストリのIP}:80"]
  capabilities = ["pull", "resolve"]
  skip_verify = true
EOF
```

- containerdを再起動します:

```shell
sudo systemctl restart containerd
```
