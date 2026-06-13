# Argo Workflows構築手順

Argo Workflowsを構築します。

cf. https://argo-workflows.readthedocs.io/en/latest/quick-start/

## 構築手順

- Argo Workflowsのバージョンを指定します（see also; https://github.com/argoproj/argo-workflows）:

```shell
ARGO_WORKFLOWS_VERSION="v4.0.6"
```

- Argo Workflowsをインストールします:

```shell
kubectl create namespace argo
kubectl apply --server-side -n argo -f "https://github.com/argoproj/argo-workflows/releases/download/${ARGO_WORKFLOWS_VERSION}/quick-start-minimal.yaml"
```

- Argo WorkflowsのAPI Serverにアクセスできるよう、サービスタイプを変更します:

```shell
# ロードバランサがある場合 type: LoadBalancer
kubectl patch svc argo-server -n argo -p '{"spec": {"type": "LoadBalancer"}}'

# ロードバランサがない場合 type: NodePort
kubectl patch svc argo-server -n argo -p '{"spec": {"type": "NodePort", "ports": [{"name": "web", "port": 2746, "protocol": "TCP", "targetPort": 2746, "nodePort": 32746}]}}'
```

- 完了後、https://localhost:32746 からGUIにアクセスできます。

- Argo Workflows CLIをインストールします（cf. https://github.com/argoproj/argo-workflows/releases/）:

```shell
# Detect OS
ARGO_OS="darwin"
if [[ "$(uname -s)" != "Darwin" ]]; then
  ARGO_OS="linux"
fi

# Download the binary
curl -sLO "https://github.com/argoproj/argo-workflows/releases/download/v4.0.6/argo-$ARGO_OS-amd64.gz"

# Unzip
gunzip "argo-$ARGO_OS-amd64.gz"

# Make binary executable
chmod +x "argo-$ARGO_OS-amd64"

# Move binary to path
sudo mv "./argo-$ARGO_OS-amd64" /usr/local/bin/argo

# Test installation
argo version
```
