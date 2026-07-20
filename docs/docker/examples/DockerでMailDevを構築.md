# DockerでMailDevを構築

[MailDev](https://github.com/maildev/maildev)でテスト用メールサーバを構築します。

```yaml
services:
  maildev:
    image: maildev/maildev
    ports:
      - "1080:1080"
      - "1025:1025"
```
