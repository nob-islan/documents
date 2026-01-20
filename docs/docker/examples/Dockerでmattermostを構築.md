# DockerでMattermostを構築

cf. https://docs.mattermost.com/install/install-docker.html

## 手順

- リポジトリをクローンします:

```shell
git clone https://github.com/mattermost/docker
cd docker
```

- envファイルをコピーします。コピー後、`DOMAIN`の項目を適切な値に修正してください:

```shell
cp env.example .env
```

- 必要なディレクトリを作成し、権限を設定します:

```shell
mkdir -p ./volumes/app/mattermost/{config,data,logs,plugins,client/plugins,bleve-indexes}
sudo chown -R 2000:2000 ./volumes/app/mattermost
```

- （httpsで通信をする場合のみ）あらかじめ用意しておいたSSL通信向けの証明書および秘密鍵を配置します:

```shell
mkdir -p ./volumes/web/cert
cp /path/to/cert.pem ./volumes/web/cert/cert.pem
cp /path/to/privkey.pem ./volumes/web/cert/key-no-password.pem
```

- nginx無しで起動します:

```shell
# http://{IPアドレス}:8065にアクセスできるようになればOK
sudo docker compose -f docker-compose.yaml -f docker-compose.without-nginx.yaml up -d
```

- （httpsで通信をする場合のみ）nginx込みで起動します:

```shell
# https://{ドメイン名}にアクセスできるようになればOK
sudo docker compose -f docker-compose.yaml -f docker-compose.nginx.yaml up -d
```
