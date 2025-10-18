# kind から http 通信でコンテナレジストリと疎通する

Pod 起動時などに、リポジトリからコンテナイメージを pull できない場合（下記ログ参照）について、それを回避するための Kind の設定です。

```
$ kubectl describe pod sample-pod-6cf8d8d57f-6d47z
  ...中略
  Normal   Pulling    25s (x2 over 39s)  kubelet            Pulling image "192.168.151.5:80/first-kube-operator/sample-controller:latest"
  Warning  Failed     25s (x2 over 39s)  kubelet            Failed to pull image "192.168.151.5:80/first-kube-operator/sample-controller:latest": rpc error: code = Unknown desc = failed to pull and unpack image "192.168.151.5:80/first-kube-operator/sample-controller:latest": failed to resolve reference "192.168.151.5:80/first-kube-operator/sample-controller:latest": failed to do request: Head "https://192.168.151.5:80/v2/first-kube-operator/sample-controller/manifests/latest": http: server gave HTTP response to HTTPS client
  Warning  Failed     25s (x2 over 39s)  kubelet            Error: ErrImagePull
  Normal   BackOff    9s (x2 over 38s)   kubelet            Back-off pulling image "192.168.151.5:80/first-kube-operator/sample-controller:latest"
  Warning  Failed     9s (x2 over 38s)   kubelet            Error: ImagePullBackOff
```

下記のように、レジストリの IP を指定して検証スキップ設定を追加します:

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  # コントロールプレーン1台
  - role: control-plane
  # ワーカーノード2台
  - role: worker
  - role: worker
containerdConfigPatches:
  - |-
    [plugins."io.containerd.grpc.v1.cri".registry.mirrors."{レジストリのIP}:80"]
      endpoint = ["http://{レジストリのIP}:80"]
    [plugins."io.containerd.grpc.v1.cri".registry.configs."{レジストリのIP}:80".tls]
      insecure_skip_verify = true
```
