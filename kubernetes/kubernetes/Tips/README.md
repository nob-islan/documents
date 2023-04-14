# Kubernetes Tips

Kubernetes を触ってて得られたナレッジを記録していきます。使用環境については、[Kubernetes クラスター構築手順](Kubernetesクラスター構築手順.md)を参照してください。

## トラブルシュート編

### `kubectl`コマンドを叩くと`connection refused`エラーになる

`kubectl get nodes`した際に以下のエラーメッセージが出てきました。

> The connection to the server 192.168.144.200:6443 was refused - did you specify the right host or port?

マシンを再起動したとかで`kubelet`が落ちている可能性があります。`systemctl status kubelet`を確認して、起動してなさそうなら以下の手順で復帰可能です。  
<br>
swap を無効化

```
sudo swapoff -a
```

`kubelet`リスタート

```
systemctl restart kubelet
```

### metrics-server インストール方法

`kubectl top nodes`でリソースの使用状況を確認するために、metrics-server をインストールする必要があります。  
cf: https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/#metrics-server  
<br>
インストール

```
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

ログを確認。多分動いていない。

```
kubectl logs -n kube-system -l k8s-app=metrics-server --container metrics-server
```

deployment を編集

```
kubectl edit deploy metrics-server -n kube-system
```

```diff
 spec:
   containers:
   - args:
     - --cert-dir=/tmp
     - --secure-port=4443
-    - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
+    - --kubelet-preferred-address-types=InternalIP
+    - --kubelet-insecure-tls
     - --kubelet-use-node-status-port
     - --metric-resolution=15s
```

しばらくしてから pod を確認すると、動いているはずです。

```
kubectl get pods -n kube-system
```

```
nob@kind:~/kind$ kubectl get pods -n kube-system
NAME                                                  READY   STATUS    RESTARTS   AGE
省略
metrics-server-98c4f9f68-9fnlj                        1/1     Running   0          13m
```
