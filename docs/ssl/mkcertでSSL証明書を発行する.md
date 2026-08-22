# mkcertでSSL証明書を発行する

[mkcert](https://github.com/FiloSottile/mkcert)を使ってSSL向け証明書を発行します。

## 手順

### インストール

- `certutil`をインストールします:

```shell
sudo apt update
sudo apt install libnss3-tools
```

- `mkcert`をインストールします:

```shell
sudo apt install mkcert
```

### ローカルCAの作成

```shell
mkcert -install
```

### 証明書の作成

```shell
mkcert \
  -cert-file server.crt \
  -key-file server.key \
  ${コンテンツサーバのホスト名} ${コンテンツサーバのIP}
```
