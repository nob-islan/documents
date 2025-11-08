# K3s インストール手順

シングルノードで縮小版 Kubernetes を構築できる [K3s](https://docs.k3s.io/) の構築手順について記載します。

## 手順

cf. https://docs.k3s.io/ja/quick-start

下記コマンドで `kubectl` コマンドなども含めてインストールされます:

```shell
curl -sfL https://get.k3s.io | sh -
```

各種設定オプションについては[公式ドキュメント](https://docs.k3s.io/ja/installation/configuration)に記載されています。
