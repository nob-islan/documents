# RabbitMQ管理CLIツール利用方法

RabbitMQを管理するコマンドラインツールのリファレンスです。

## `rabbitmqctl`

cf. https://www.rabbitmq.com/docs/man/rabbitmqctl.8

## `rabbitmqadmin`

cf. https://www.rabbitmq.com/docs/management-cli

### 認証方法

`rabbitmqadmin`は認証情報を記載した上で実行する必要があります。

- 設定ファイルを作成します:

```conf
[default]
username = "admin"
password = "password"
```

- ファイルを指定してコマンドを実行します:

```shell
rabbitmqadmin --config /path/to/rabbitmqadmin.conf show overview
```
