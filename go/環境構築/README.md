# 環境構築

Go 言語での開発における環境構築およびモジュールの初期設定方法を記載します。

## 事前準備

- [公式サイト](https://go.dev/doc/install)から Go をインストールします。
- VSCode にて[拡張機能](https://marketplace.visualstudio.com/items?itemName=golang.Go)をインストールします。

## モジュール作成

- モジュールを初期化します:

  ```shell
  go mod init {モジュール名}
  ```

## 開発 Tips

### モジュールを実行

```shell
go run main.go
```

### モジュールをビルドして実行

```shell
go build main.go
```

```shell
./main
```

### モジュールをデバッグ

```shell
# デバッグ向けツールをインストール
go install github.com/go-delve/delve/cmd/dlv@latest
```

ソースコードにブレークポイントを置いて**F5**キーを押下するとデバッグが開始されます。
