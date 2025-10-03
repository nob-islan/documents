# はじめての nfs サーバ

## サーバ側手順

- `nfs-kernel-server`をインストールします:

```shell
sudo apt update
sudo apt install nfs-kernel-server
```

- 共有用ディレクトリを作成します:

```shell
sudo mkdir -p /data/share
sudo chown nobody:nogroup /data/share
sudo chmod 777 /data/share
```

- `/etc/exports`を設定します:

```shell
# cf. https://docs.redhat.com/ja/documentation/red_hat_enterprise_linux/5/html/deployment_guide/s1-nfs-server-config-exports
# 今回は特定のIPについて、/data/share配下に読み書き権限を付与
cat << EOF > /etc/exports
/data/share {client IP}(rw,sync,no_subtree_check)
EOF
```

- 設定を反映させてプロセスを再起動します:

```shell
sudo exportfs -ar
sudo systemctl restart nfs-kernel-server
```

## クライアント側手順

- `nfs-common`をインストールします:

```shell
sudo apt update
sudo apt install nfs-common
```

- マウント向けディレクトリを作成します:

```shell
sudo mkdir -p /mnt/nfs/data
```

- マウントを設定します:

```shell
sudo mount -t nfs {server IP}:/data/share /mnt/nfs/data
```
