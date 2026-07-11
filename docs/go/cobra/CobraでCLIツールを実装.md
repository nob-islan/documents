# CobraでCLIツールを実装

[Cobra](https://cobra.dev/)を使ってGo言語でCLIツールを実装します。

## プロジェクト作成

cf. https://cobra.dev/docs/tutorials/getting-started/

- 下記コマンドでGoモジュールを初期化します。

```shell
go mod init easycli
```

- Cobra libraryおよびCobra CLI generatorをインストールします。

```shell
go get -u github.com/spf13/cobra@latest
go install github.com/spf13/cobra-cli@latest
```

- Cobraプロジェクトを初期化します。

```shell
cobra-cli init
```

- プロジェクトが正しく作成されていることを確認します。

```shell
go run main.go
```

## コマンドの作成

- コマンドを追加します。

```shell
cobra-cli add hello
```

- コマンドが正しく追加されていることを確認します。

```shell
go run main.go hello
```
