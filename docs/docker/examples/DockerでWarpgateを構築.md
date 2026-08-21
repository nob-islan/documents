# DockerでWarpgateを構築

[Warpgate](https://warpgate.null.page/)を使ってブラウザからSSH接続を行います。

## 手順

cf. https://warpgate.null.page/getting-started-on-docker/

- docker-compose関連ファイルをダウンロードします:

```shell
curl -O https://raw.githubusercontent.com/warp-tech/warpgate/refs/heads/main/docker/docker-compose.yml
curl -O https://raw.githubusercontent.com/warp-tech/warpgate/refs/heads/main/docker/Dockerfile
```

- ボリューム向けディレクトリを作成します:

```shell
mkdir data/
```

- 設定ファイルのセットアップを行います:

```shell
docker compose run warpgate setup
```

- コンテナを起動します:

```shell
docker compose up -d
```

コンテナ起動後、https://localhost:8888 でGUIにアクセスできます。
