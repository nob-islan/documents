# PostfixからMailpitにメールを配送する

Postfixから、Mailpitなどのテスト用メールサーバにメールを配送します。

## 設定ファイル作成

### `/etc/postfix/main.cf`

- 下記設定を記載します:

```ini
relayhost = [localhost]:1025
```

- 下記設定を削除します:

```ini
default_transport = error
relay_transport = error
```

- 全てのメールをMailpitに配送する場合は`mydestination`の設定を削除します。

## 設定ファイル適用

- Postfixを再起動します。

```shell
sudo systemctl restart postfix
```

## 動作確認

```shell
sendmail test@example.com <<EOF
Subject: Mailpit Test
From: sender@example.com
To: test@example.com

Hello Mailpit!
EOF
```
