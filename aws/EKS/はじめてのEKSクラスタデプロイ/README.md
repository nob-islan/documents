# はじめての EKS クラスタデプロイ

cf. https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/getting-started-eksctl.html

`eksctl` コマンドを使って EKS クラスタをデプロイします。

## セットアップ

cf. https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/setting-up.html

各種ツールをインストールします。

### AWS CLI

cf. https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/install-awscli.html

- 必要なパッケージを準備

```shell
sudo apt update
sudo apt install unzip
```

- AWS CLI ダウンロード

```shell
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
```

- 解凍

```shell
unzip awscliv2.zip
```

- インストール

```shell
sudo ./aws/install
```

- インストールされていることを確認

```shell
aws --version
```

- 認証情報設定

```shell
# 下記を設定します
# Access Key ID [None]: {アクセスキー}
# Secret Access Key [None]: {シークレットキー}
# Default region name [None]: {リージョン}
# Default output format [None]: json
aws configure
```

### `kubectl`

cf. https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/install-kubectl.html#linux_amd64_kubectl

- `kubectl` ダウンロード

```shell
curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.33.0/2025-05-01/bin/linux/amd64/kubectl
```

- 実行アクセス許可

```shell
chmod +x ./kubectl
```

- バイナリをコピー

```shell
mkdir -p $HOME/bin && cp ./kubectl $HOME/bin/kubectl && export PATH=$HOME/bin:$PATH
```

- シェルの初期化ファイル追記

```shell
echo 'export PATH=$HOME/bin:$PATH' >> ~/.bashrc
```

- インストールされていることを確認

```shell
kubectl version --client
```

### `eksctl`

cf. https://eksctl.io/installation/

- `eksctl` ダウンロード

```shell
ARCH=amd64
PLATFORM=$(uname -s)_$ARCH
curl -sLO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_$PLATFORM.tar.gz"
```

- 解凍

```shell
tar -xzf eksctl_$PLATFORM.tar.gz -C /tmp && rm eksctl_$PLATFORM.tar.gz
```

- バイナリを配置

```shell
sudo mv /tmp/eksctl /usr/local/bin
```

- インストールされていることを確認

```shell
eksctl version
```
