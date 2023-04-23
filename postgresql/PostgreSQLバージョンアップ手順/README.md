# PostgreSQL バージョンアップ手順

`pg_upgrade`コマンドを使った PostgreSQL のバージョンアップ手順です。例として 12 -> 13 の手順を記載します。

## 事前準備

### バックアップを取る

WIP

## バージョンアップ手順

リポジトリの追加

```
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
```

GPG 鍵の追加

```
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
```

パッケージの更新

```
sudo apt-get update
```

新しいバージョンのインストール

```
sudo apt-get install postgresql-13
```

新しいバージョンのクラスタサービスが起動していることを確認

```
systemctl status postgresql@13-main.service
```

サービスの状態を確認（`enabled`であれば OK）

```
systemctl is-enabled postgresql
```

サービスの停止

```
sudo systemctl stop postgresql.service
```

postgres ユーザになる

```
sudo su - postgres
```

アップグレード実施

```
 /usr/lib/postgresql/13/bin/pg_upgrade \
     --old-datadir=/var/lib/postgresql/12/main \
     --new-datadir=/var/lib/postgresql/13/main \
     --old-bindir=/usr/lib/postgresql/12/bin \
     --new-bindir=/usr/lib/postgresql/13/bin \
     --old-options '-c config_file=/etc/postgresql/12/main/postgresql.conf' \
     --new-options '-c config_file=/etc/postgresql/13/main/postgresql.conf'
```

一般ユーザに戻る

```
exit
```

新しいバージョンの`postgresql.conf`についてポート番号などを変更

```
sudo vim /etc/postgresql/13/main/postgresql.conf
```

`port = 5433`になっているため、`port = 5432`とすれば OK。また、`listen_addresses`についてもコメントアウトを外し、`localhost` -> `*`に変更

古いバージョンについても同様にポート番号などを変更

```
sudo vim /etc/postgresql/12/main/postgresql.conf
```

`port = 5432` -> `port = 5433`

また、必要であれば`pg_hba.conf`についても新しいファイルに設定を追記

```
sudo vim /etc/postgresql/13/main/pg_hba.conf
```

サービスを起動

```
sudo systemctl start postgresql.service
```

postgres ユーザに戻り、`psql`などで接続先が新しいバージョンになっていることを確認

オプティマイザの統計情報を収集

```
./analyze_new_cluster.sh
```

古いバージョンの削除

```
sudo apt-get remove postgresql-12
sudo rm -rf /etc/postgresql/12/
```

postgres ユーザにて`delete_old_cluster.sh`を実行

```
sudo su - postgres
./delete_old_cluster.sh
```
