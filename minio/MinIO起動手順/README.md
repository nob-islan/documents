# MinIO 起動手順

cf. https://min.io/docs/minio/container/index.html

下記の内容で`docker-compose.yml`を作成する：

```yml
version: "3.6"
services:
  minio:
    image: minio/minio:latest
    container_name: nob-minio
    environment:
      MINIO_ROOT_USER: root
      MINIO_ROOT_PASSWORD: password
    command: server /data --console-address ":9090"
    ports:
      - 9000:9000
      - 9090:9090
    volumes:
      - type: bind
        source: "./data"
        target: "/data"
```
