# K3s インストール手順

シングルノードで縮小版 Kubernetes を構築できる [K3s](https://docs.k3s.io/) の構築手順について記載します。

## 手順

cf. https://docs.k3s.io/quick-start

下記コマンドで `kubectl` コマンドなども含めてインストールされます:

```shell
# root以外でもkubectlを実行可能にするオプションを付与
curl -sfL https://get.k3s.io | sh -s - server --write-kubeconfig-mode=644
```

各種設定オプションについては[公式ドキュメント](https://docs.k3s.io/installation/configuration)に記載されています。

## Tips

k8s や kind などと挙動に差異が出る箇所について記載します。

### kubeconfig のパス

cf. https://docs.k3s.io/cluster-access

kubeconfig の設定が記載されているファイルのパスが他と異なります:

```
root@nob-k3s:~# ls -l /etc/rancher/k3s/k3s.yaml
-rw------- 1 root root 2957 Nov  8 12:09 /etc/rancher/k3s/k3s.yaml
```

下記のようなエラーが発生した場合、`export KUBECONFIG=/etc/rancher/k3s/k3s.yaml` すると解決します:

```
root@nob-k3s:~# argo submit -n argo --watch https://raw.githubusercontent.com/argoproj/argo-workflows/main/examples/hello-world.yaml
Error: invalid configuration: no configuration has been provided, try setting KUBERNETES_MASTER environment variable
```
