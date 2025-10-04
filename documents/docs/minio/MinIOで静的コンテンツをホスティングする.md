# MinIO で静的コンテンツをホスティングする

静的ウェブサイトをホスティングして外部公開します。

## 前提

- MinIO が起動している
- `mc`コマンドが叩ける状態になっている
- エイリアス`nob`が登録されている

## 手順

- バケットを作成します:

```shell
mc mb nob/first-bucket
```

- バケットのポリシーを設定します:

```shell
mc anonymous set download nob/first-bucket
```

- バケットに公開したいコンテンツ一式をコピーします:

```shell
mc cp -r ./public nob/first-bucket
```

- 外部公開用 URL にアクセスします:

http://{minio_ip}:{http_port}/first-bucket/public/index.html
