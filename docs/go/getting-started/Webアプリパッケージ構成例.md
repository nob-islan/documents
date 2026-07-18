# Webアプリパッケージ構成例

GoでWebアプリケーションを開発する際のプロジェクトのパッケージ構成について一つの指針となるサンプルを記載します。

```shell
.
├── api                  # APIドキュメント
├── cmd                  # エントリポイント
├── internal
│   ├── apperrors        # 独自エラー定義およびそのハンドリング
│   ├── application      # アプリケーション層
│   │   └── usecase      # 業務処理
│   │       └── params   # 業務処理の入力・出力モデル
│   ├── bootstrap        # 依存性の注入およびルーティング
│   ├── domain           # ドメイン構造体、ビジネスロジックおよびrepositoryインターフェース
│   ├── infrastructure   # インフラストラクチャ層
│   │   ├── persistence  # データベース向け定義
│   │   │   └── table    # テーブル定義に対応した構造体
│   │   └── repository   # ドメイン操作の実装
│   ├── logging          # ログ出力制御
│   └── presentation     # プレゼンテーション層
│       └── handler      # APIとしての外部契約
│           ├── model    # APIのリクエスト・レスポンス構造体
│           └── router   # httpリクエストのルーティング
└── scripts              # 開発支援ツール
```

## `api`

swaggerなどのAPIドキュメント、およびそれを生成する関数を格納するパッケージです。

## `cmd`

アプリケーションのエントリポイントとなる関数を格納するパッケージです。基本的に`main.go`のみが格納されます。

## `internal/apperrors`

アプリケーション内で独自に定義するエラーおよびそのハンドリング関数を格納するパッケージです。

## `internal/application`

アプリケーションの業務処理実装を格納するパッケージです。

### `internal/application/usecase`

業務処理を行う関数を格納するパッケージです。関数内に直接処理を実装するか、`domain`内の処理を呼び出す形で業務を実施します。

#### `internal/application/usecase/params`

業務処理の入力・出力モデルとなる構造体を格納するパッケージです。

## `internal/bootstrap`

依存性の注入およびルーティングの設定を行い、各APIの実装を行うパッケージです。

## `internal/domain`

業務処理の中心となるドメイン構造体およびそれを操作する`repository`インターフェースを格納するパッケージです。

1つの`domain`で完結する業務処理についてはこのパッケージ内で実装してください。

## `internal/infrastructure`

データベースや他APIなどの外部接続に関する設定を行う関数を格納するパッケージです。

### `internal/infrastructure/persistence`

データベース向けの定義を格納するパッケージです。

#### `internal/infrastructure/persistence/table`

データベースの各テーブル定義に対応した構造体を格納するパッケージです。

### `internal/infrastructure/repository`

`domain`とデータベース間とでデータを操作する関数を格納するパッケージです。

## `internal/logging`

ログレベル別の文言出力など、ログ出力を制御するパッケージです。

## `internal/presentation`

APIとしての外部契約を格納するパッケージです。

### `internal/presentation/handler`

リクエストモデルのjsonの解析およびバリデーションを行なって、業務処理を呼び出すハンドラ関数を格納するパッケージです。

#### `internal/presentation/handler/model`

APIのリクエスト・レスポンスモデルとなる構造体を格納するパッケージです。

#### `internal/presentation/handler/router`

httpリクエストのルーティングを行う関数を格納するパッケージです。

## `scripts`

テストカバレッジの作成やAPIドキュメントの自動生成などの開発支援ツールを格納するパッケージです。
