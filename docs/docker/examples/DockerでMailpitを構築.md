# DockerでMailpitを構築

[Mailpit](https://mailpit.axllent.org/)でテスト用メールサーバを構築します。

cf. https://mailpit.axllent.org/docs/install/docker/

```yaml
services:
  mailpit:
    image: axllent/mailpit:latest
    ports:
      - "8025:8025"
      - "1025:1025"
```
