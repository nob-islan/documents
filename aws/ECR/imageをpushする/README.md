# imageをpushする

リポジトリ上で確認できる`プッシュコマンドの表示`を見ればいけるはず。

## 事前準備

- [AWS CLIをインストール](../../00_common/AWS_CLI%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB.md)
- `IAM` -> `ユーザー` -> `認証情報`からアクセスキーを発行
- `aws configure`コマンドで上のアクセスキー、シークレットキーを登録

## push

`プッシュコマンドの表示`を参照のこと。

- ログイン
```
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin ${リポジトリのURL}
```

- imageのビルド（リポジトリ名 ≒ イメージ名）
```
docker build -t ${リポジトリ名} .
```

- バージョン情報などのタグ付け
```
docker tag ${リポジトリ名}:latest ${リポジトリのURL}/${リポジトリ名}:${タグ}
```

- push
```
docker push ${リポジトリのURL}/${リポジトリ名}:${タグ}
```