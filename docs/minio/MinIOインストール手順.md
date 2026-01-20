# MinIOインストール手順

コミュニティ版の最新バージョンはソースコードでのみ配布されているため、go環境を用意する必要があるので注意してください。

cf. https://github.com/minio/minio

## 手順

- MinIOをインストールします:

```shell
 go install github.com/minio/minio@latest
```

- MinIOを起動します:

```shell
minio server ./data
```
