# はじめての dnsmasq

ローカルネットワーク向けの DNS サーバ **dnsmasq** の構築手順です。

## 構築手順

- インストール

```shell
sudo apt install dnsmasq
```

- dnsmasq で利用予定の 53 ポートを使っているプロセスを kill

```shell
# systemd-resolvedがポートを使っていることが多い
sudo lsof -i :53
sudo systemctl stop ${サービス名}
```

- `/etc/dnsmasq.conf`を編集

```conf
# DNSのポートを指定
port=53

# ドメインの無いホスト名のみ問い合わせの場合、上位DNSサーバに転送しない
domain-needed

# プライベートIPアドレスの逆引きを上位DNSサーバに転送しない
bogus-priv

# 上位DNSの設定ファイル
resolv-file=/etc/dnsmasq-resolv.conf

# ローカルエリア内のドメインを指定
local=/nob.jp/

# hostsとして参照させたいファイル
addn-hosts=/etc/dnsmasq-hosts

# ホスト名で問合せされた時、下記で指定されたドメイン名を補完
expand-hosts
domain=nob.jp
```

- `/etc/dnsmasq-hosts`を作成

```conf
192.168.151.1 ${任意のホスト名}
```

- `/etc/dnsmasq-resolv.conf`を作成

```conf
nameserver 8.8.8.8
```

- 起動

```shell
sudo systemctl start dnsmasq
```
