# Kustomize 書き方

cf. https://kustomize.io/

## 設定ファイル書き方

ベースとなる設定と、開発環境向けの設定とが存在する想定でファイルのサンプルを記述します。

### ディレクトリ構成

```
.
├── bases
│   ├── deployment.yaml
│   ├── kustomization.yaml
│   └── service.yaml
└── overlays
    └── dev
        ├── deployment.yaml
        └── kustomization.yaml
```

- `bases`は各環境に共通する設定ファイルを配置します。
- `overlays`はそれぞれの環境固有の設定ファイルを配置します。

### 設定内容

#### bases

`kustomization.yaml`の`resources`で指定したファイルを読み込みます。

- `kustomization.yaml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
```

- `deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: first-deployment
spec:
  selector:
    matchLabels:
      app: first-nginx
  replicas: 3
  template:
    metadata:
      labels:
        app: first-nginx
    spec:
      containers:
        - name: first-nginx
          image: nginx:1.18
          ports:
            - containerPort: 80
```

- `service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: first-service
spec:
  type: NodePort
  ports:
    - name: "nginx-port"
      protocol: "TCP"
      port: 80
      nodePort: 30080
  selector:
    app: first-nginx
```

#### `overlays/dev`

`bases`で記述した設定に対し、差分となる箇所のみ記述します。下記の例では、dev のみレプリカ数が 1 となります。

- `kustomization.yaml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../bases
patches:
  - path: deployment.yaml
```

- `deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: first-deployment
spec:
  replicas: 1
```

## 使用方法

- `kustomization.yaml`の内容でマニフェストを標準出力します。

```shell
kustomize build bases/
```

```shell
# ビルドしたマニフェストでリソースを作成
kustomize build bases/ | kubectl apply -f -
```

- `kustomization.yaml`の内容でリソースを作成する:

```shell
kubectl apply -k bases/
```
