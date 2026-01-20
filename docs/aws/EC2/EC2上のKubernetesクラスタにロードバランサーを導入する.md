# EC2上のKubernetesクラスタにロードバランサーを導入する

EC2上にkubeadmで構築したKubernetesクラスタ上でLoadBalancerタイプのServiceを動かすために [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/) を導入する手順です。

cf.

- [Kubernetesアプリケーションの公開Part 2: AWS Load Balancer Controller](https://aws.amazon.com/jp/blogs/news/exposing-kubernetes-applications-part-2-aws-load-balancer-controller/)

## 事前準備

下記を用意してください:

- 2つ以上のパブリックサブネットを持つVPC
- EC2上にkubeadmで構築したKubernetesクラスタ
- [kubectl](https://kubernetes.io/ja/docs/tasks/tools/install-kubectl-linux/), [aws](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/getting-started-install.html), [helm](https://helm.sh/ja/docs/intro/install/) がインストールされた端末

## 手順

### ノードへのIAMロールのアタッチ

ワーカーノードがロードバランサーリソースを作成できるよう、ノードにIAMロールをアタッチします。

- IAMポリシーを作成します:

```shell
# IAMポリシー向けjsonをダウンロード
curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.17.0/docs/install/iam_policy.json

# IAMポリシーを作成
aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json
```

- IAMロールを作成します:

```shell
# 信頼ポリシーのjson作成
cat << EOF >> trust_policy.json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "sts:AssumeRole"
            ],
            "Principal": {
                "Service": [
                    "ec2.amazonaws.com"
                ]
            }
        }
    ]
}
EOF

# ロールの作成
aws iam create-role \
    --role-name AWSCustomerRoleForEC2KubeWorkerNode \
    --assume-role-policy-document file://trust_policy.json
```

- 作成したロールにポリシーをアタッチします:

```shell
aws iam attach-role-policy \
    --role-name AWSCustomerRoleForEC2KubeWorkerNode \
    --policy-arn {AWSLoadBalancerControllerIAMPolicyのArn}
```

- インスタンスプロファイルを作成します:

```shell
# インスタンスプロファイルを作成
aws iam create-instance-profile \
    --instance-profile-name AWSCustomerRoleForEC2KubeWorkerNode

# インスタンスプロファイルにIAMロールをアタッチ
aws iam add-role-to-instance-profile \
    --instance-profile-name AWSCustomerRoleForEC2KubeWorkerNode \
    --role-name AWSCustomerRoleForEC2KubeWorkerNode
```

- ワーカーノードの インスタンスIDを確認します:

```shell
aws ec2 describe-instances \
    --query 'Reservations[*].Instances[*].{Instance:InstanceId}' \
    --filters Name=tag-value,Values={ワーカーノードのインスタンス名}
```

- IAMロールをワーカーノードにアタッチします:

```shell
aws ec2 associate-iam-instance-profile \
    --iam-instance-profile Name=AWSCustomerRoleForEC2KubeWorkerNode \
    --instance-id {ワーカーノードのインスタンスID}
```

- ロードバランサーがワーカーノードを認識できるよう、`providerID` をノード情報として付与します（cf. https://github.com/kubernetes-sigs/aws-load-balancer-controller/issues/3708）:

```shell
kubectl patch node kube-w01 -p '{"spec":{"providerID":"aws:///{リージョン}/{ワーカーノードのインスタンスID}"}}'
```

### AWS Load Balancer Controllerのデプロイ

- `eks` リポジトリを追加します:

```shell
helm repo add eks https://aws.github.io/eks-charts
```

- AWS Load Balancer Controllerをデプロイします:

```shell
helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=nob-cluster
```

### 動作確認

- ingressリソースを作成すると、ロードバランサーが自動で作成されます:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress
  namespace: default
  annotations:
    alb.ingress.kubernetes.io/load-balancer-name: nginx-ingress
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: instance
spec:
  ingressClassName: alb
  rules:
    - http:
        paths:
          - path: /*
            pathType: ImplementationSpecific
            backend:
              service:
                name: nginx-service
                port:
                  number: 80
```

```shell
kubectl apply -f nginx-ingress.yaml
```

- 疎通確認用にnginxをデプロイします:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  namespace: default
  labels:
    app: nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:stable
          ports:
            - containerPort: 80
```

```shell
kubectl apply -f nginx-deploy.yaml
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
  namespace: default
  labels:
    app: nginx
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

```shell
kubectl apply -f nginx-svc.yaml
```
