# MinIO オブジェクトストレージを暗号化する

SSE-KMS による暗号化をお試しします。

## 手順

### KES サーバ構築

- root ユーザになります。

  ```shell
  sudo su -
  ```

- [公式ドキュメント](https://min.io/docs/kes/tutorials/getting-started/)から KES をダウンロードします。

  ```shell
  wget https://github.com/minio/kes/releases/latest/download/kes-linux-amd64
  chmod +x ./kes-linux-amd64
  mv ./kes-linux-amd64 /usr/local/bin/kes
  ```

- KES 実行用の自己証明書を作成します。

  ```shell
  kes identity new --ip "127.0.0.1" --key "private.key" --cert "public.crt" localhost
  ```

- MinIO 認証情報を作成します。

  ```shell
  kes identity new --key=client.key --cert=client.crt MinIO
  ```

- （オプション）ID を再度確認します。

  ```shell
  kes identity of client.crt
  ```

- `config.yml`を下記内容で作成します。

  ```yml
  address: 0.0.0.0:7373 # Listen on all network interfaces on port 7373

  admin:
    identity: disabled # We disable the admin identity since we don't need it in this guide

  tls:
    key: private.key # The KES server TLS private key
    cert: public.crt # The KES server TLS certificate

  policy:
    my-app:
      allow:
        - /v1/key/create/minio-*
        - /v1/key/generate/minio-*
        - /v1/key/decrypt/minio-*
      identities:
        - { identity of crt } # Use the identity of your client.crt

  keystore:
    fs:
      path: ./ # Choose a directory for the secret keys
  ```

- KES サーバを起動します。

  ```shell
  kes server --config config.yml --auth off
  ```

### MinIO サーバ構築

- MinIO をインストールします。

  ```shell
  wget https://dl.min.io/server/minio/release/linux-amd64/archive/minio_20241107005220.0.0_amd64.deb -O minio.deb
  sudo dpkg -i minio.deb
  ```

- 各種環境変数をセットします。

  ```shell
  # KESサーバのエンドポイント
  export MINIO_KMS_KES_ENDPOINT=https://127.0.0.1:7373
  # MinIOクライアントの資格情報
  export MINIO_KMS_KES_CERT_FILE=client.crt
  export MINIO_KMS_KES_KEY_FILE=client.key
  # 暗号化キーを指定しなかった場合のデフォルトキー
  export MINIO_KMS_KES_KEY_NAME=minio-default-key
  # 信頼するKESサーバ証明書
  export MINIO_KMS_KES_CAPATH=public.crt
  # MinIOルート資格情報
  export MINIO_ROOT_USER=minio
  export MINIO_ROOT_PASSWORD=minio123
  ```

- MinIO サーバを起動します。

  ```shell
  minio server /data
  ```

### バケットの暗号化

- 事前準備として下記を実行します:

  - MinIO client インストール

  - エイリアス作成

- 暗号化キーを作成します。

  ```shell
  # config.ymlによってminio-xxxの名称のみ許可されている
  mc admin kms key create <alias> minio-key-name
  ```

- バケットを暗号化します。

  ```shell
  mc encrypt set sse-kms minio-key-name <alias>/<bucket-name>
  ```

## 参考文献

- [サーバセットアップ](https://min.io/docs/kes/tutorials/kes-for-minio/)
- [KES サーバセットアップ](https://min.io/docs/kes/tutorials/getting-started/)
- [MinIO インストール](https://min.io/docs/minio/linux/index.html)
