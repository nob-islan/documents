# Webアプリパッケージ構成例

GoでWebアプリケーションを開発する際のプロジェクトのパッケージ構成について一つの指針となるサンプルを記載します。

```shell
.
├── api                  # APIドキュメント
├── assets
│   ├── static           # js, css, favicon等
│   └── templates        # html
├── cmd                  # エントリポイント
├── internal
│   ├── apperrors        # 独自エラー定義およびそのハンドリング
│   ├── domain           # ドメイン構造体
│   ├── handler          # APIリクエストをハンドリング、業務処理呼び出し
│   │   ├── model        # APIのリクエスト・レスポンス構造体
│   │   └── router       # httpリクエストのルーティング
│   ├── infrastructure   # データベースなど外部接続設定
│   │   ├── persistence  # データベースへのアクセス
│   │   │   └── table    # テーブル定義に対応した構造体
│   │   └── repository   # ドメイン操作
│   ├── logging          # ログ出力制御
│   └── usecase          # 業務処理
│       └── params       # 業務処理の入力・出力モデル
└── scripts              # 開発支援ツール
```

## パッケージ解説

### `api`

swaggerなどのAPIドキュメント、およびそれを生成する関数を格納するパッケージです。

### `assets`

静的コンテンツを格納するパッケージです。本パッケージの直下に`assets.go`を設け、`go:embed`を使ってこれらの静的ファイルを呼び出します。

### `cmd`

アプリケーションのエントリポイントとなる関数を格納するパッケージです。基本的に`main.go`のみが格納されます。

### `internal/apperrors`

アプリケーション内で独自に定義するエラーおよびそのハンドリング関数を格納するパッケージです。

### `internal/domain`

業務処理の中心となるドメイン構造体およびそれを取得するrepositoryインターフェースを格納するパッケージです。

値のチェックなど、1つのdomainで完結する業務処理についてはこのパッケージ内で実装してください。

### `internal/handler`

リクエストモデルのjsonの解析およびバリデーションを行なって、業務処理を呼び出すハンドラ関数を格納するパッケージです。

### `internal/handler/model`

APIのリクエスト・レスポンスモデルとなる構造体を格納するパッケージです。

### `internal/handler/router`

httpリクエストのルーティングを行う関数を格納するパッケージです。

### `internal/infrastructure`

データベースや他APIなどの外部接続に関する設定を行う関数を格納するパッケージです。

### `internal/infrastructure/persistence`

データベースにアクセスしてSQLを実行する関数を格納するパッケージです。各domain単位でファイルを作成し、SQL群とdomainとが1:1に対応するようにしてください。

### `internal/infrastructure/persistence/table`

データベースの各テーブル定義に対応した構造体を格納するパッケージです。

### `internal/infrastructure/repository`

persistence配下の処理を呼び出し、domainおよびデータベース間でデータを操作する関数を格納するパッケージです。

### `internal/logging`

ログレベル別の文言出力など、ログ出力を制御するパッケージです。

### `internal/usecase`

業務処理を行う関数を格納するパッケージです。関数内に直接処理を実装するか、domain内の処理を呼び出す形で業務を実施します。

### `internal/usecase/params`

業務処理の入力・出力モデルとなる構造体を格納するパッケージです。

### `scripts`

テストカバレッジの作成やAPIドキュメントの自動生成などの開発支援ツールを格納するパッケージです。
