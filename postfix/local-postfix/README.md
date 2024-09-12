# ローカル用 Postfix を構築

ローカルで動かせる Postfix サーバを AWS EC2 を用いて立てます。

## 構築手順

- Postfix をインストールします。

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

- Postfix を再起動します。

  ```shell
  sudo systemctl restart postfix
  ```

- Dovecot をインストールします。

  ```shell
  sudo apt install dovecot-core dovecot-pop3d dovecot-imapd
  ```

- 設定ファイルを編集します:

  - `/etc/dovecot/dovecot.conf`
    - `protocols = imap pop3`: 使用するプロトコル
    - `listen = *`: IPv4 のみ使用
  - `/etc/dovecot/conf.d/10-mail.conf`
    - `#mail_location = mbox:~/mail:INBOX=/var/mail/%u`: もとあったファイルの場所設定をコメントアウト
    - `mail_location = maildir:~/Maildir`: ファイルの場所を指定
  - `/etc/dovecot/conf.d/10-auth.conf`
    - `disable_plaintext_auth = no`: 平文認証を許可
    - `auth_mechanisms = plain login`
  - `/etc/dovecot/conf.d/10-ssl.conf`
    - `ssl = no`: SSL 未使用

- dovecot を再起動します。

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

- 自分自身にメールを送信します。下記はコマンド例です。コメント部分は出力内容です。

  ```shell
  telnet localhost 25
  # Trying 127.0.0.1...
  # Connected to localhost.
  # Escape character is '^]'.
  # 220 ip-10-0-0-200.ap-northeast-1.compute.internal ESMTP Postfix (Ubuntu)
  helo localhost
  # 250 ip-10-0-0-200.ap-northeast-1.compute.internal
  mail from: test-user@ip-10-0-0-200.ap-northeast-1.compute.internal
  # 250 2.1.0 Ok
  rcpt to: test-user@ip-10-0-0-200.ap-northeast-1.compute.internal
  # 250 2.1.5 Ok
  data
  # 354 End data with <CR><LF>.<CR><LF>
  'This is a mail send test.'
  'Can you read this mail?'
  .
  # 250 2.0.0 Ok: queued as B956E401EA
  quit
  # 221 2.0.0 Bye
  # Connection closed by foreign host.
  ```

## メール受信テスト

- 受信確認のコマンド例です。コメント部分は出力内容です。

  ```shell
  telnet localhost 143
  # Trying 127.0.0.1...
  # Connected to localhost.
  # Escape character is '^]'.
  # * OK [CAPABILITY IMAP4rev1 SASL-IR LOGIN-REFERRALS ID ENABLE IDLE LITERAL+ AUTH=PLAIN AUTH=LOGIN] Dovecot (Ubuntu) ready.
  1 login test-user p@ssw0rd
  # 1 OK [CAPABILITY IMAP4rev1 SASL-IR LOGIN-REFERRALS ID ENABLE IDLE SORT SORT=DISPLAY THREAD=REFERENCES THREAD=REFS THREAD=ORDEREDSUBJECT MULTIAPPEND URL-PARTIAL CATENATE UNSELECT CHILDREN NAMESPACE UIDPLUS LIST-EXTENDED I18NLEVEL=1 CONDSTORE QRESYNC ESEARCH ESORT SEARCHRES WITHIN CONTEXT=SEARCH LIST-STATUS BINARY MOVE SNIPPET=FUZZY PREVIEW=FUZZY PREVIEW STATUS=SIZE SAVEDATE LITERAL+ NOTIFY SPECIAL-USE] Logged in
  2 list "" *
  # * LIST (\HasNoChildren) "." INBOX
  # 2 OK List completed (0.009 + 0.000 + 0.008 secs).
  3 select INBOX
  # * FLAGS (\Answered \Flagged \Deleted \Seen \Draft)
  # * OK [PERMANENTFLAGS (\Answered \Flagged \Deleted \Seen \Draft \*)] Flags permitted.
  # * 2 EXISTS
  # * 2 RECENT
  # * OK [UNSEEN 1] First unseen.
  # * OK [UIDVALIDITY 1726069921] UIDs valid
  # * OK [UIDNEXT 3] Predicted next UID
  # 3 OK [READ-WRITE] Select completed (0.005 + 0.000 + 0.004 secs).
  4 fetch 1 body[]
  # * 1 FETCH (FLAGS (\Seen \Recent) BODY[] {702}
  # Return-Path: <test-user@ip-10-0-0-200.ap-northeast-1.compute.internal>
  # X-Original-To: test-user@ip-10-0-0-200.ap-northeast-1.compute.internal
  # Delivered-To: test-user@ip-10-0-0-200.ap-northeast-1.compute.internal
  # Received: from localhost (localhost [127.0.0.1])
  # 	by ip-10-0-0-200.ap-northeast-1.compute.internal (Postfix) with SMTP id 03B9B401EA
  # 	for <test-user@ip-10-0-0-200.ap-northeast-1.compute.internal>; Wed, 11 Sep 2024 15:22:52 +0000 (UTC)
  # Message-Id: <20240911152259.03B9B401EA@ip-10-0-0-200.ap-northeast-1.compute.internal>
  # Date: Wed, 11 Sep 2024 15:22:52 +0000 (UTC)
  # From: test-user@ip-10-0-0-200.ap-northeast-1.compute.internal

  # 'This is a mail send test.'
  # 'Can you read this mail?'
  # )
  # 4 OK Fetch completed (0.001 + 0.000 secs).
  5 logout
  # * BYE Logging out
  # 5 OK Logout completed (0.001 + 0.000 secs).
  # Connection closed by foreign host.
  ```
