# minikube インストール手順

Ubuntu 上に minikube をインストールして Kubernetes の簡易的な環境を構築します。

## スペック

- Ubuntu20.04.1 LTS
  - CPU 2 コア以上
  - メモリ 2GB 以上
  - 空き容量 20GB 以上

## Docker のインストール

[こちら](../../../docker/Docker%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB/README.md)を参考に docker をインストールします。

## kubectl のインストール

[こちら](../../kind/kind%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB%E6%89%8B%E9%A0%86/README.md)を参考に kubectl コマンドをインストールします。

## minikube のインストール

公式ドキュメントhttps://minikube.sigs.k8s.io/docs/start/

minikube バイナリのダウンロード

```
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
```

minikube インストール

```
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

minikube を起動

```
minikube start --driver=docker
```

minikube が起動したことを確認

```
minikube status
```
