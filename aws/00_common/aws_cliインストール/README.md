# AWS CLI インストール

[公式ドキュメント](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/getting-started-install.html)を見ればいけるはず。

- 必要なパッケージインストール

```
sudo apt update
sudo apt install -y curl unzip
```

- ツールのダウンロード

```
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
```

- 展開

```
unzip awscliv2.zip
```

- インストール

```
sudo ./aws/install
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
