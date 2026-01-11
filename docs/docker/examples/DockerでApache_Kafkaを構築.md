# Docker で Apache Kafka を構築

cf. https://kafka.apache.org/41/getting-started/quickstart/

```yaml
services:
  kafka:
    container_name: kafka
    image: apache/kafka:4.1.1
    ports:
      - 9092:9092
    volumes:
      - ./volumes/kafka:/var/lib/kafka
```

- `/opt/kafka/bin/kafka-topics.sh` がメインのスクリプトです。
