# はじめての Let's Encript

Let's Encript を使って nginx で SSL 通信ができるようにします。

## 手順

### ドメイン取得

Let's Encript で証明書を作成するにはドメインが必要です（IP アドレスのみだと不可）。[Dynamic DO!.jp](https://ddo.jp/contact.php) などから無料でドメインを発行できます。また、ドメイン発行に必要なアドレスは[Proton](https://proton.me/)で無料発行できます。

### 証明書作成

あらかじめ nginx をインストールした後、下記を打鍵してください:

```shell
# nginx向けcertbotインストール
sudo apt update
sudo apt install certbot python3-certbot-nginx

# SSL/TLS証明書取得
sudo certbot --nginx -d {ドメイン名}
```

上記コマンド完了後、nginx の設定ファイルに自動で SSL 通信向けの設定が追記され、`https://{ドメイン名}`でアクセスできるようになっています。

## それ以外のコマンド

```shell
# 証明書の作成のみ行う
certbot certonly --standalone -d {ドメイン名}
```
