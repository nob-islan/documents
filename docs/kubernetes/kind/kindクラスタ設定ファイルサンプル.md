# kindクラスタ設定ファイルサンプル

- ワーカーノード2台を起動

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  # コントロールプレーン1台
  - role: control-plane
  # ワーカーノード2台
  - role: worker
  - role: worker
```

- NodePort向けのポートを開放

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      # ServiceのNodePortに30080を指定するとホストマシンの30070へのアクセスがワーカーノードの30080に転送される
      - containerPort: 30080
        hostPort: 30070
        protocol: TCP
  - role: worker
  - role: worker
```
