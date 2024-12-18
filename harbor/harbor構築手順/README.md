# harbor 構築手順

[ドキュメント](https://goharbor.io/docs/2.12.0/install-config/)に従って構築していきます。

## 起動

- `docker`をインストールします。
- [リリースページ](https://github.com/goharbor/harbor/releases)から tar ファイルをダウンロードします。
- tar ファイルを展開します。

  ```shell
  tar xzvf ${ダウンロードしたファイル}
  ```

- `harbor.yml`をテンプレートからコピーして作成します。

  ```shell
  cp harbor.yml.tmpl harbor.yml
  ```

- `harbor.yml`を編集します。
  - ホスト名を記載します。
  - http または https 通信いずれかの設定をコメントアウトします。
    - https 通信をする場合は証明書の配置が必要です。
- シェルを使って起動します。

  ```shell
  sudo ./install.sh
  ```

初期ユーザ/パスワードは`admin/Harbor12345`です。

## リポジトリの管理

- `Robot Accounts`からアカウントを作成して、アクセストークンを取得すれば、属人化しないアカウントで pull, push などができます。下記コマンドでログインできます。

```shell
docker login ${harborサーバのIPアドレス} -u ${robot_name} -p ${access_token}
```

`robot_name`をクオートで囲まないとエラーになるので注意してください。

## Tips

各種トラブルシュートです。

### docker pull 時に`Error response from daemon: Get "-": http: server gave HTTP response to HTTPS client`エラー

- 下記を pull したいサーバの`/etc/docker/daemon.json`に追記してください。

```json
{ "insecure-registries": [${harborサーバのIPアドレス}] }
```

- 下記で docker を再起動してください。

```shell
sudo systemctl restart docker
```
