`# DockerでRustFSを構築

cf. https://github.com/rustfs/rustfs/blob/main/README.md

- マウント用ディレクトリを作成します:

```shell
# Create data and logs directories
mkdir -p volumes/data volumes/logs

# Change the owner of these directories
sudo chown -R 10001:10001 volumes
```

- 下記で`docker-compose.yaml`を作成します:

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

http://localhost:9001 でログイン画面にアクセスできます。`rustfsadmin / rustfsadmin`でログインできます。
