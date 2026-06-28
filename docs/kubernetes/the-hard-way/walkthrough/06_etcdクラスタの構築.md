# 6. `etcd`クラスタの構築

Kubernetesクラスタの状態を保存する[etcd](https://github.com/etcd-io/etcd)を構築します。

## 事前準備

`etcd`向けsystemdユニットファイルを作成します。

```shell
mkdir units
cat << EOF > units/etcd.service
[Unit]
Description=etcd
Documentation=https://github.com/etcd-io/etcd

[Service]
Type=notify
ExecStart=/usr/local/bin/etcd \
  --name controller \
  --initial-advertise-peer-urls http://127.0.0.1:2380 \
  --listen-peer-urls http://127.0.0.1:2380 \
  --listen-client-urls http://127.0.0.1:2379 \
  --advertise-client-urls http://127.0.0.1:2379 \
  --initial-cluster-token etcd-cluster-0 \
  --initial-cluster controller=http://127.0.0.1:2380 \
  --initial-cluster-state new \
  --data-dir=/var/lib/etcd
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

`etcd`バイナリファイルおよびsystemdユニットファイルを`kube-c01`にコピーします。

```shell
scp \
  downloads/controller/etcd \
  downloads/client/etcdctl \
  units/etcd.service \
  nob@kube-c01:~/
```

## `etcd`クラスタの設定

### `etcd`バイナリのインストール

```shell
ssh nob@kube-c01 "sudo mv etcd etcdctl /usr/local/bin/"
```

### `etcd`サーバーの設定

証明書を配置します。

```shell
ssh nob@kube-c01 "sudo mkdir -p /etc/etcd /var/lib/etcd"
ssh nob@kube-c01 "sudo chmod 700 /var/lib/etcd"
ssh nob@kube-c01 "sudo cp ca.crt kube-api-server.key kube-api-server.crt /etc/etcd/"
```

systemdユニットファイルを作成します。

```shell
ssh nob@kube-c01 "sudo mv etcd.service /etc/systemd/system/"
```

## `etcd`クラスタの起動

`etcd`クラスタを起動します。

```shell
ssh nob@kube-c01 "sudo systemctl daemon-reload"
ssh nob@kube-c01 "sudo systemctl enable etcd"
ssh nob@kube-c01 "sudo systemctl start etcd"
```

etcdクラスタのメンバーを一覧表示して起動確認を行います。

```shell
ssh nob@kube-c01 etcdctl member list
```

```
$ ssh nob@kube-c01 etcdctl member list
6702b0a34e2cfd39, started, controller, http://127.0.0.1:2380, http://127.0.0.1:2379, false
```

次: [コントロールプレーンの構築](./07_コントロールプレーンの構築.md)
