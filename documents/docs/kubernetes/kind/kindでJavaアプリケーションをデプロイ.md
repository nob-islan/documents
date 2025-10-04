# kind で Java アプリケーションをデプロイ

DB との繋ぎこみすら行わない、curl による疎通確認をするだけのアプリケーションを kind 上でデプロイします。

## 事前準備

- kind のインストールされたマシン

## デプロイ手順

### ディレクトリ構成

```
first-k8s-restapi
    ├─docker
    │   ├─Dockerfile
    │   └─jar
    │       └─app-0.0.1-SNAPSHOT.jar
    └─kube
        ├─java-cluster.yml
        ├─java-deployment.yml
        └─java-service.yml
```

### デプロイ手順

#### クラスタ構築

`java-cluster.yml`には、

- ワーカーノードを 2 台にすること
- service 向けのポートを 30080 にすること
- 外部からは 30070 ポートで通信すること

が記載されています。

```yml
# クラスタ構築
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  # コントロールプレーン1台
  - role: control-plane
    extraPortMappings:
      # ServiceのnodePortとして指定するポート
      - containerPort: 30080
        # ホスト側のポートを指定
        hostPort: 30070
  # ワーカーノード2台
  - role: worker
  - role: worker
```

以下のコマンドで`java-cluster`クラスターを構築します。

```
kind create cluster --config java-cluster.yml --name java-cluster
```

#### docker イメージ作成

`Dockerfile`では、openjdk17 をベースとして、

- ログ格納用のディレクトリを作成すること
- jar ファイルをコピーしておくこと
- Pod 作成時に java アプリケーションを起動すること

が記載されています。

```Dockerfile
FROM openjdk:17

RUN mkdir -p /nob/server/jar
RUN mkdir /nob/server/log

COPY ./jar/app-0.0.1-SNAPSHOT.jar /nob/server/jar

CMD java -jar /nob/server/jar/app-0.0.1-SNAPSHOT.jar
```

`first-k8s-restapi/docker`にて docker イメージを作成します。`-t`オプションで名前をつけておきます。

```
docker build ./ -t nob-openjdk17
```

各ワーカーノードに docker イメージをロードします。これを忘れるとデプロイメント起動時に Pod が image を取得できずに`CrashLoopBackOff`し続けます。

```
kind load docker-image nob-openjdk17 --name java-cluster
```

#### デプロイメント起動

`java-deployment.yml`で Pod に関する設定を記載します。`containers`配下にて、ローカルの`nob-openjdk17`を使うことを宣言しています。

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: java-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: java-app
  template:
    metadata:
      labels:
        app: java-app
    spec:
      containers:
        - name: java-containers
          image: nob-openjdk17:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
```

デプロイメントを apply します。

```
kubectl apply -f java-deployment.yml
```

#### サービス起動

`java-service.yml`によって外部から通信できるようにします。

```yml
apiVersion: v1
kind: Service
metadata:
  name: java-service
spec:
  type: NodePort
  ports:
    - name: "java-port"
      protocol: "TCP"
      port: 8080
      nodePort: 30080
  selector:
    app: java-app
```

サービスを apply します。

```
kubectl apply -f java-service.yml
```

#### 動作確認

`curl http://${kindサーバのIPアドレス}:30070/{path}`でレスポンスが返って来れば正常動作しています。
