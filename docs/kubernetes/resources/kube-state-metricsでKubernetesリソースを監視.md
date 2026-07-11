# kube-state-metricsでKubernetesリソースを監視

[kube-state-metrics](https://kubernetes.io/ja/docs/concepts/cluster-administration/kube-state-metrics/)を用いて、Pod数やServiceの状態などKubernetes上のリソース状態を監視します。

## インストール

cf. https://kubernetes.github.io/kube-state-metrics/

- [helm](https://helm.sh/)でkube-state-metricsをインストールします:

```shell
helm repo add kube-state-metrics https://kubernetes.github.io/kube-state-metrics
helm install kube-state-metrics kube-state-metrics/kube-state-metrics
```

- Serviceが起動していることを確認します:

```shell
kubectl get service -l app.kubernetes.io/name=kube-state-metrics
```

- 外部から疎通が取れるようにtypeを`NodePort`に変更します:

```shell
kubectl patch service kube-state-metrics -p '{"spec": {"type": "NodePort", "ports": [{"nodePort": 30800, "port": 8080, "protocol": "TCP", "targetPort": 8080}]}}'
```

- メトリクスが作成されていることを確認します:

```shell
curl {Kubernetes cluster IP}:30800/metrics
```

参照できるメトリクス一覧については[公式ドキュメント](https://github.com/kubernetes/kube-state-metrics/tree/main/docs)を参照ください。
