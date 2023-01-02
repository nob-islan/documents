# kindでECRのプライベートリポジトリからimageをpull

cf. [公式ドキュメント](https://kind.sigs.k8s.io/docs/user/private-registries/)  
ちょっとハマったので書く。

## 事前準備

- ECRリポジトリ
  - 事前にimageをpushしておく
- kindサーバ
  - [こちら](../../../aws/00_common/AWS_CLI%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB.md)を参考にして`aws`コマンドが叩けるようにしておく
- AWSアクセスキー・シークレットキー
  - kindサーバに認証情報を登録しておく用

## 構築

### ECRリポジトリ

- 画面からリポジトリを作成する
- 下記の要領でDockerfileを作成し、pushしておく
```
FROM ubuntu:20.04

RUN mkdir /nob && echo 'Hello, ECR!' > /nob/hello
```

### kindサーバ

#### 下準備
- `aws configure`コマンドで認証情報を登録する
- ECRリポジトリ上の`プッシュコマンドの表示`を参考にログインしておく
- `~/.docker/config.json`に認証情報が記載されている　はず
```
{
	"auths": {
		"667444918077.dkr.ecr.ap-northeast-1.amazonaws.com": {
			"auth": "QVdTO~~~~"
		}
	}
}
```

#### クラスタ構築
- `first-ecr-cluster.yml`を記載してクラスタを起動する
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraMounts: #各ノードに認証情報が記載されたファイルをコピーする
  - containerPath: /var/lib/kubelet/config.json
    hostPath: /home/ubuntu/.docker/config.json
  extraPortMappings:
  - containerPort: 30080
    hostPort: 30070
    protocol: TCP
- role: worker
  extraMounts:
  - containerPath: /var/lib/kubelet/config.json
    hostPath: /home/ubuntu/.docker/config.json
- role: worker
  extraMounts:
  - containerPath: /var/lib/kubelet/config.json
    hostPath: /home/ubuntu/.docker/config.json
```
- deployment, serviceを記載して、Arco CD用のリポジトリに格納する
```yaml
apiVersion: apps/v1
kind: Deployment
metadata: 
  name: first-ecr-deployment
spec: 
  selector: 
    matchLabels: 
      app: first-ecr
  replicas: 3
  template: 
    metadata: 
      labels: 
        app: first-ecr
    spec: 
      containers: 
      - name: first-ecr
        image: 667444918077.dkr.ecr.ap-northeast-1.amazonaws.com/first-ecr:1.0.1
        tty: true
        ports: 
        - containerPort: 80
```
```yaml
apiVersion: v1
kind: Service
metadata: 
  name: first-ecr-service
spec: 
  type: NodePort
  ports: 
  - port: 8099
    targetPort: 80
    protocol: TCP
    nodePort: 30090
  selector: 
    app: first-ecr
```
- [Arco_CDを起動する](../kind%E3%81%A7ArgoCD%E3%82%92%E4%BD%BF%E3%81%86/README.md)