# ローカル用Postfixを構築

ローカルで動かせるPostfixサーバを立てます。

cf. https://www.postfix.org/STANDARD_CONFIGURATION_README.html

## 構築手順

- Postfixをインストールします。

```shell
sudo apt update
sudo apt install postfix
```

- 画面に表示された`Postfix Configuration`の選択肢で`Local only`を選択します。

- バージョンを表示し、インストールが成功していることを確認します。

```shell
# バージョン確認
postconf | grep mail_version
```

- 設定ファイルのバックアップを取ります。

```shell
sudo cp /etc/postfix/main.cf /etc/postfix/main.cf.org
```

- 設定ファイルを編集します:
  - `/etc/postfix/main.cf`
    - `home_mailbox = Maildir/`: メールボックスの形式設定

- Postfixを再起動します。

```shell
sudo systemctl restart postfix
```

- Dovecotをインストールします。

```shell
sudo apt install dovecot-core dovecot-pop3d dovecot-imapd
```

- メールディレクトリを作成します。

```shell
maildirmake.dovecot ~/Maildir
```

- 設定ファイルを編集します:
  - `/etc/dovecot/dovecot.conf`
    - `protocols = imap pop3`: 使用するプロトコル
    - `listen = *`: IPv4のみ使用
  - `/etc/dovecot/conf.d/10-mail.conf`
    - `mail_driver = maildir`
    - `mail_home = /home/%{user | username}`
    - `mail_path = ~/Maildir`
  - `/etc/dovecot/conf.d/10-auth.conf`
    - `auth_mechanisms = plain login`
  - `/etc/dovecot/conf.d/10-ssl.conf`
    - `ssl = no`: SSL未使用

- dovecotを再起動します。

```shell
sudo systemctl restart dovecot
```

## メール送信テスト

- テスト用ユーザを作成します。

```shell
sudo adduser test-user
```

- ディレクトリの書き込み権限を変更します。

```shell
sudo chmod 777 /var/spool/mail
```

- 自分自身にメールを送信します。下記はコマンド例およびその出力です。

```shell
telnet localhost 25
```

```
nob@postfix:~$ telnet localhost 25
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
220 postfix ESMTP Postfix (Ubuntu)
```

```shell
helo localhost
```

```
helo localhost
250 postfix
```

```shell
mail from: test-user@postfix
```

```
mail from: test-user@postfix
250 2.1.0 Ok
```

```shell
rcpt to: test-user@postfix
```

```
rcpt to: test-user@postfix
250 2.1.5 Ok
```

```shell
data
```

```
data
354 End data with <CR><LF>.<CR><LF>
```

```shell
'This is a mail send test.'
'Can you read this mail?'
.
```

```
'This is a mail send test.'
'Can you read this mail?'
.
250 2.0.0 Ok: queued as B57AF57DF
```

```shell
quit
```

```
quit
221 2.0.0 Bye
Connection closed by foreign host.
```

## メール受信テスト

- 受信確認のコマンド例およびその出力です。

```shell
telnet localhost 143
```

```
nob@postfix:~$ telnet localhost 143
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
* OK [CAPABILITY IMAP4rev1 LOGIN-REFERRALS ID ENABLE IDLE SASL-IR LITERAL+ AUTH=PLAIN AUTH=LOGIN] Dovecot ready.
```

```shell
1 login test-user p@ssw0rd
```

```
1 login test-user p@ssw0rd
1 OK [CAPABILITY IMAP4rev1 SASL-IR LOGIN-REFERRALS ID ENABLE IDLE SORT SORT=DISPLAY THREAD=REFERENCES THREAD=REFS THREAD=ORDEREDSUBJECT MULTIAPPEND URL-PARTIAL CATENATE UNSELECT CHILDREN NAMESPACE UIDPLUS LIST-EXTENDED I18NLEVEL=1 CONDSTORE QRESYNC ESEARCH ESORT SEARCHRES WITHIN CONTEXT=SEARCH LIST-STATUS BINARY MOVE REPLACE SNIPPET=FUZZY PREVIEW=FUZZY PREVIEW SPECIAL-USE STATUS=SIZE SAVEDATE COMPRESS=DEFLATE INPROGRESS NOTIFY LITERAL+] Logged in
```

```shell
2 list "" *
```

```
2 list "" *
* LIST (\HasNoChildren) "." INBOX
2 OK List completed (0.013 + 0.000 + 0.012 secs).
```

```shell
3 select INBOX
```

```
3 select INBOX
* FLAGS (\Answered \Flagged \Deleted \Seen \Draft)
* OK [PERMANENTFLAGS (\Answered \Flagged \Deleted \Seen \Draft \*)] Flags permitted.
* 1 EXISTS
* 1 RECENT
* OK [UNSEEN 1] First unseen.
* OK [UIDVALIDITY 1785591263] UIDs valid
* OK [UIDNEXT 2] Predicted next UID
3 OK [READ-WRITE] Select completed (0.007 + 0.000 + 0.006 secs).
```

```shell
4 fetch 1 body[]
```

```
4 fetch 1 body[]
* 1 FETCH (FLAGS (\Seen \Recent) BODY[] {438}
Return-Path: <test-user@postfix>
X-Original-To: test-user@postfix
Delivered-To: test-user@postfix
Received: from localhost (localhost [127.0.0.1])
	by postfix (Postfix) with SMTP id B57AF57DF
	for <test-user@postfix>; Sat, 01 Aug 2026 13:30:44 +0000 (UTC)
Message-Id: <20260801133114.B57AF57DF@postfix>
Date: Sat, 01 Aug 2026 13:30:44 +0000 (UTC)
From: test-user@postfix

'This is a mail send test.'
'Can you read this mail?'
)
4 OK Fetch completed (0.001 + 0.000 secs).
```

```shell
5 logout
```

```
5 logout
* BYE Logging out
5 OK Logout completed (0.001 + 0.000 secs).
Connection closed by foreign host.
```
