# Argo Workflows 構築手順

Argo Workflows を構築します。

cf. https://argo-workflows.readthedocs.io/en/latest/quick-start/

## 構築手順

- Argo Workflows のバージョンを指定します（see also; https://github.com/argoproj/argo-workflows）:

```shell
ARGO_WORKFLOWS_VERSION="v3.7.3"
```

- Argo Workflows をインストールします:

```shell
kubectl create namespace argo
kubectl apply -n argo -f "https://github.com/argoproj/argo-workflows/releases/download/${ARGO_WORKFLOWS_VERSION}/quick-start-minimal.yaml"
```

- Argo Workflows の API Server にアクセスできるよう、サービスタイプを変更します:

```shell
# ロードバランサがない場合 type: NodePort
kubectl patch svc argo-server -n argo -p '{"spec": {"type": "NodePort", "ports": [{"name": "http", "port": 2746, "protocol": "TCP", "targetPort": 2746, "nodePort": 32746}]}}'
```

- Argo Workflows CLI をインストールします（cf. https://github.com/argoproj/argo-workflows/releases/）:

```shell
# Detect OS
ARGO_OS="darwin"
if [[ "$(uname -s)" != "Darwin" ]]; then
  ARGO_OS="linux"
fi

# Download the binary
curl -sLO "https://github.com/argoproj/argo-workflows/releases/download/v3.7.3/argo-$ARGO_OS-amd64.gz"

# Unzip
gunzip "argo-$ARGO_OS-amd64.gz"

# Make binary executable
chmod +x "argo-$ARGO_OS-amd64"

# Move binary to path
sudo mv "./argo-$ARGO_OS-amd64" /usr/local/bin/argo

# Test installation
argo version
```
