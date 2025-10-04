# image を push する

リポジトリ上で確認できる`プッシュコマンドの表示`を見ればいけるはず。

## 事前準備

- [AWS CLI をインストール](../00_common/AWS_CLIをインストール.md)
- `IAM` -> `ユーザー` -> `認証情報`からアクセスキーを発行
- `aws configure`コマンドで上のアクセスキー、シークレットキーを登録

## push

- ログイン

```shell
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin ${リポジトリのURL}
```

- image のビルド（リポジトリ名 ≒ イメージ名）

```shell
docker build -t ${リポジトリ名} .
```

- バージョン情報などのタグ付け

```shell
docker tag ${リポジトリ名}:latest ${リポジトリのURL}/${リポジトリ名}:${タグ}
```

- push

```shell
docker push ${リポジトリのURL}/${リポジトリ名}:${タグ}
```
