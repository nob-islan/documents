# DockerでGiteaを構築

cf. https://docs.gitea.com/installation/install-with-docker-rootless

- マウント用ディレクトリを作成します:

```shell
mkdir -p volumes/gitea/{data,config}
sudo chown 1000:1000 volumes/config/ volumes/data/
```

- 下記で`docker-compose.yaml`を作成します:

```yaml
services:
  server:
    image: docker.gitea.com/gitea:1.25.3-rootless
    restart: always
    volumes:
      - ./volumes/data:/var/lib/gitea
      - ./volumes/config:/etc/gitea
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "2222:2222"
```
