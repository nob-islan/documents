# Tips

MinIO の検証等で出てきた細かいナレッジです。

## MinIO クライアント

cf. https://min.io/docs/minio/linux/reference/minio-mc.html?ref=docs

### インストール

```shell
# ダウンロード
curl https://dl.min.io/client/mc/release/linux-amd64/mc \
  --create-dirs \
  -o $HOME/minio-binaries/mc

# 権限変更
chmod +x $HOME/minio-binaries/mc

# 環境変数追記
export PATH=$PATH:$HOME/minio-binaries/

# インストールされていることを確認
mc --help
```

### エイリアス

- エイリアス一覧

  ```shell
  mc alias list
  ```

- エイリアス登録

  ```shell
  # アクセスキー、シークレットキーは画面から発行できます
  mc alias set {エイリアス名} http://sample.com:9000 {アクセスキー} {シークレットキー}
  ```

- バケットのオブジェクト一覧

  ```shell
  mc ls {エイリアス名}/{バケット名}
  ```

### GitLab との連携

https://blog.min.io/gitlab-minio/
