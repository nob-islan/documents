# はじめてのsquid

## インストール

```shell
sudo apt update
sudo apt install squid
```

## 設定ファイルの書き方

下記で`/etc/squid/squid.conf`に各種設定を記載後、`sudo systemctl restart squid`で再起動すると設定が適用される。

### acl

下記の構成で記載する:

```
acl {aclの名称} {aclの種類} {値}
```

- `aclの名称`: 任意の名前
- `aclの種類`: IPネットワークであれば`src`, ポート番号であれば`port`など
- `値`: IPネットワークであれば`10.0.0.0/8`, ポート番号であれば`80`など

### aclに対する制御

下記の構成で記載する:

```
http_access [allow|deny] {acl名}
```

## 設定例

- プライベートIPからのアクセスのみ許可する設定

```ini
include /etc/squid/conf.d/*.conf

http_port 3128

acl internal_ip src 10.0.0.0/8

http_access allow internal_ip
http_access deny all

coredump_dir /var/spool/squid
```
