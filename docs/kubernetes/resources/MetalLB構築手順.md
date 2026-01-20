# MetalLB構築手順

Kubernetesクラスタに対してロードバランサを提供する **MetalLB** の構築手順です。

cf. https://metallb.io/

## 前提

Kubernetesクラスタ構築時に、CNIの選定に注意してください。少なくともflannelでは動作確認が取れています。

cf. https://metallb.io/#requirements

## インストール手順

cf. https://metallb.io/installation/

- strict ARP modeを有効化します:

```shell
# see what changes would be made, returns nonzero returncode if different
kubectl get configmap kube-proxy -n kube-system -o yaml | \
sed -e "s/strictARP: false/strictARP: true/" | \
kubectl diff -f - -n kube-system

# actually apply the changes, returns nonzero returncode on errors only
kubectl get configmap kube-proxy -n kube-system -o yaml | \
sed -e "s/strictARP: false/strictARP: true/" | \
kubectl apply -f - -n kube-system
```

- マニフェストをapplyします:

```shell
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.15.2/config/manifests/metallb-native.yaml
```

- 各種リソースが起動することを確認します:

```shell
kubectl get all -n metallb-system
```

## 設定・動作確認手順

cf. https://metallb.io/configuration/

- Serviceに割り当てるIPアドレス範囲を定義する `IPAddressPool` リソースを作成します:

```yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: first-pool
  namespace: metallb-system
spec:
  addresses:
    - 192.168.151.61-192.168.151.70
  autoAssign: true
```

```shell
kubectl apply -f ipaddresspool.yaml
```

- Layer 2 modeで起動するための `L2Advertisement` リソースを作成します:

```yaml
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: first-l2
  namespace: metallb-system
spec:
  ipAddressPools:
    - first-pool
  interfaces:
    - ens4 # ip addr show | grep 192.168.151 等でインターフェースを確認・指定
```

```shell
kubectl apply -f l2advertisement.yaml
```

- 動作確認用のnginxコンテナをデプロイします:

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

```shell
kubectl apply -f deployment.yaml
```

- サービスをデプロイします:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: first-service
spec:
  type: LoadBalancer
  ports:
    - port: 80
      protocol: TCP
  selector:
    app: first-nginx
```

```shell
kubectl apply -f service.yaml
```

- 正常に動作していれば、`EXTERNAL-IP`にIPアドレスが振られ、クラスタ外から疎通をとることができます。

```
$ kubectl get svc first-service
NAME            TYPE           CLUSTER-IP    EXTERNAL-IP      PORT(S)        AGE
first-service   LoadBalancer   10.96.50.59   192.168.151.61   80:30232/TCP   15s
```
