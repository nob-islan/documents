# acme.shでIPアドレスに対してSSL証明書を発行する

`acme.sh`を使って、ドメイン不要のSSL証明書を発行します。

cf.

- https://github.com/acmesh-official/acme.sh
- https://github.com/acmesh-official/acme.sh/wiki/Profile-selection

## 手順

- ルートユーザに昇格します:

```shell
sudo su -
```

- `acme.sh`をインストールします:

```shell
curl https://get.acme.sh | sh -s email=my@example.com
```

- エイリアスを設定します（任意）:

```shell
alias acme.sh=/root/.acme.sh/acme.sh
```

- SSL証明書を発行します:

```shell
acme.sh --issue \
    --server letsencrypt \
    -d {IP address} \
    --standalone \
    --certificate-profile shortlived \
    --days 3
```
