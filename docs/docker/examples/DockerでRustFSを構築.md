# Docker で RustFS を構築

cf. https://github.com/rustfs/rustfs/blob/main/README.md

- マウント用ディレクトリを作成します:

```shell
# Create data and logs directories
mkdir volumes && cd volumes
mkdir -p data logs

# Change the owner of these directories
sudo chown -R 10001:10001 data logs
```

- 下記で docker-compose を作成します:

```yaml
services:
  rustfs:
    container_name: rustfs
    image: rustfs/rustfs:latest
    ports:
      - 9000:9000
      - 9001:9001
    volumes:
      - ./volumes/data:/data
      - ./volumes/logs:/logs
```

- コンテナを起動します:

```shell
docker compose --profile observability up -d
```
