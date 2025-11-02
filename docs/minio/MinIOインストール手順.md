# MinIO インストール手順

コミュニティ版の最新バージョンはソースコードでのみ配布されているため、go 環境を用意する必要があるので注意してください。

cf. https://github.com/minio/minio

## 手順

- MinIO をインストールします:

```shell
 go install github.com/minio/minio@latest
```

- MinIO を起動します:

```shell
minio server ./data
```
