# はじめてのftpサーバ

FTPサーバを構築し、クライアントからテスト向けファイルを転送します。

## 構築手順

ftpプロトコルの通信を待ち受けるサーバを構築します。

- vsftpdインストール

```shell
sudo apt update
sudo apt install -y vsftpd
```

- ftp通信用ユーザ作成

```shell
sudo useradd -m ftpuser && sudo passwd ftpuser
```

- `/etc/vsftpd.conf`編集

```conf
# クライアントを待ち受ける
listen=YES

# IPv6を無効
listen_ipv6=NO

# 匿名ユーザを禁止
anonymous_enable=NO

# ローカルユーザのログインを許可
local_enable=YES

# 書き込み操作を許可
write_enable=YES

# ディレクトリ上に.messageファイルがある場合にその内容を表示
dirmessage_enable=YES

# ローカルタイムゾーンを使用
use_localtime=YES

# ログを/var/log配下に記録
xferlog_enable=YES

# ポート20を使用
connect_from_port_20=YES

# ローカルユーザをホームディレクトリ配下に束縛
chroot_local_user=YES

# chroot時にvsftpdが内部利用するディレクトリ
secure_chroot_dir=/var/run/vsftpd/empty

# PAMの設定ファイル向け設定
pam_service_name=vsftpd

# FTPS向け設定
rsa_cert_file=/etc/ssl/certs/ssl-cert-snakeoil.pem
rsa_private_key_file=/etc/ssl/private/ssl-cert-snakeoil.key
ssl_enable=NO
```

- 書き込み用のサブディレクトリ作成

```shell
# 書き込み用のサブディレクトリを作る
sudo mkdir -p /home/ftpuser/ftp
sudo chmod a-w /home/ftpuser
sudo chown ftpuser:ftpuser /home/ftpuser/ftp
```

- 起動および有効化

```shell
sudo systemctl start vsftpd
sudo systemctl enable vsftpd
```

## 送信手順

- テスト用ファイル作成

```shell
echo "This is a ftp test file" > testfile.txt
```

- ftpログイン

```shell
ftp {ftpサーバのIP}
```

- `ftp>`プロンプト取得後、ファイル送信

```shell
cd ftp
put testfile.txt
```
