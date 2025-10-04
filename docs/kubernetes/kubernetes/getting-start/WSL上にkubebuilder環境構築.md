# WSL 上に kubebuilder 環境構築

## WSL 起動

- Ubuntu インストール・起動

```shell
wsl --install -d Ubuntu-24.04
```

## docker インストール

ローカル k8s 環境: kind を動かすために docker をインストールします。

- docker インストール

```shell
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

- 一度仮想マシンからログアウト

```shell
exit
```

- Ubuntu をデフォルトのディストリビューションに指定

```shell
wsl --set-default Ubuntu-24.04
```

- Ubuntu ログイン

```shell
wsl
```

- docker がインストールされていることを確認

```
$ docker -v
Docker version 27.5.1, build 9f9e405
```

## make インストール

kubebuilder によって自動生成される make スクリプトを動かすためにコマンドをインストールします。

- make インストール

```shell
sudo apt update
sudo apt install make
```

- make がインストールされていることを確認

```
$ make --version
GNU Make 4.3
Built for x86_64-pc-linux-gnu
Copyright (C) 1988-2020 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
```

## kind インストール

ローカル k8s 環境を構築するツールです。

- kind ダウンロード、インストール

```shell
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.14.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

- kind がインストールされていることを確認

```
$ kind version
kind v0.14.0 go1.18.2 linux/amd64
```

## kubectl インストール

- kubectl ダウンロード、インストール

```shell
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl
```

- kubectl がインストールされていることを確認

```
$ kubectl version
Client Version: v1.32.1
Kustomize Version: v5.5.0
The connection to the server localhost:8080 was refused - did you specify the right host or port?
```

## go インストール

- go ダウンロード

```shell
wget https://go.dev/dl/go1.23.6.linux-amd64.tar.gz
```

- 解凍

```shell
sudo tar -C /usr/local -xzf go1.23.6.linux-amd64.tar.gz
```

- go のパスを通す

```shell
cat << 'EOF' >> ~/.profile
export PATH=$PATH:/usr/local/go/bin
EOF
```

- .profile 読み込み

```shell
source ~/.profile
```

- go がインストールされていることを確認

```
$ go version
go version go1.23.6 linux/amd64
```

## kubebuilder インストール

- kubebuilder ダウンロード、インストール

```shell
curl -L -o kubebuilder "https://go.kubebuilder.io/dl/latest/$(go env GOOS)/$(go env GOARCH)"
chmod +x kubebuilder
sudo mv ./kubebuilder /usr/local/bin/kubebuilder
```

- kubebuilder がインストールされていることを確認

```
$ kubebuilder version
Version: main.version{KubeBuilderVersion:"4.5.0", KubernetesVendor:"1.31.0", GitCommit:"7153119ca900994b70507edbde59771ac824f2d9", BuildDate:"2025-01-21T08:46:54Z", GoOs:"linux", GoArch:"amd64"}
```

## VSCode への拡張機能導入

- 拡張機能インストール

```shell
code --install-extension golang.go
code --install-extension ms-kubernetes-tools.vscode-kubernetes-tools
code --install-extension esbenp.prettier-vscode
```

## VSCode を開く

```shell
code .
```
