# Docker で RabbitMQ を構築

cf. https://www.rabbitmq.com/docs/download

```yaml
services:
  rabbitmq:
    container_name: rabbitmq
    image: rabbitmq:4-management
    hostname: rabbitmq # これを指定しないと再起動のたびにホスト名が変わってキューを保持できない
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS=password
    ports:
      - 5672:5672
      - 15672:15672
    volumes:
      - ./volumes/rabbitmq:/var/lib/rabbitmq
```

- amqp プロトコルの疎通は 5672 ポートに対して行います。
- Web 画面のアクセスは 15672 ポートに対して行います。
- `rabbitmqctl`, `rabbitmqadmin` コマンドが使えます。
