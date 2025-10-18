# Kubernetes から http 通信でコンテナレジストリと疎通する

http 通信でコンテナレジストリと疎通をとり、イメージを pull する方法です。

## 手順

- ワーカーノードの`/etc/containerd/config.toml`に下記を追記します:

```diff
       [plugins."io.containerd.grpc.v1.cri".registry.configs]
+        [plugins."io.containerd.grpc.v1.cri".registry.configs."{コンテナレジストリのIP}:80".tls]
+          insecure_skip_verify = true
```

```diff
       [plugins."io.containerd.grpc.v1.cri".registry.mirrors]
+        [plugins."io.containerd.grpc.v1.cri".registry.mirrors."{コンテナレジストリのIP}:80"]
+          endpoint = ["http://{コンテナレジストリのIP}:80"]
```

- containerd を再起動します:

```shell
sudo systemctl restart containerd
```
