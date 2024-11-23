# Tips

MinIO の検証等で出てきた細かいナレッジです。

## MinIO クライアント

cf. https://min.io/docs/minio/linux/reference/minio-mc.html?ref=docs

### インストール

```shell
# ダウンロード
wgethttps://dl.min.io/client/mc/release/linux-amd64/mc

# 権限変更
chmod +x ./mc

# パスを通す
mv ./mc /usr/local/bin

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
