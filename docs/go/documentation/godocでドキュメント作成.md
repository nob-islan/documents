# godocでドキュメント作成

ソース内のコメントをもとにドキュメントを出力してくれる **godoc** を作成します。

## インストール

```shell
# godocインストール
go install golang.org/x/tools/cmd/godoc@latest
```

```shell
# godocコマンド実行時にエラーが発生する場合は下記を実行
sudo apt install golang-golang-x-tools
```

## ドキュメント閲覧

```shell
# go.modが配置してあるディレクトリに移動
cd {ディレクトリ}
# 8080ポートでドキュメントを公開
godoc -http=:8080
```

http://localhost:8080/pkg/{モジュール名}/ でドキュメントを確認できます。
