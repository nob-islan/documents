# はじめてのLet's Encript

Let's Encriptを使います。

## ドメイン取得

Let's Encriptで証明書を作成するにはドメインが必要です（IPアドレスのみだと不可）。[Dynamic DO!.jp](https://ddo.jp/contact.php) などから無料でドメインを発行できます。また、ドメイン発行に必要なアドレスは[メルアドぽいぽい](https://m.kuku.lu/ja.php)で無料発行できます。

## 証明書作成

```shell
# certbotインストール
sudo apt update
sudo apt install certbot

# 証明書の作成を行う
certbot certonly --standalone -d {ドメイン名}
```

## nginx向け証明書設定

Let's Encriptを使ってnginxでSSL通信ができるようにします。あらかじめnginxをインストールした後、下記を打鍵してください:

```shell
# nginx向けcertbotインストール
sudo apt update
sudo apt install certbot python3-certbot-nginx

# SSL/TLS証明書取得
sudo certbot --nginx -d {ドメイン名}
```

上記コマンド完了後、nginxの設定ファイルに自動でSSL通信向けの設定が追記され、`https://{ドメイン名}`でアクセスできるようになっています。
