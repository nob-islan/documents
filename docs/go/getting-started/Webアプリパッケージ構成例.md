# Web アプリパッケージ構成例

Go プロジェクトのパッケージ構成について一つの指針となるサンプルを記載します。

```shell
.
├── api                 # APIドキュメント
├── cmd                 # エントリポイント
├── internal
│   ├── apperrors       # 独自エラー定義およびそのハンドリング
│   ├── domain          # ドメイン構造体
│   ├── handler         # APIリクエストをハンドリング、業務処理呼び出し
│   │   ├── model       # APIのリクエスト・レスポンス構造体
│   │   └── router      # httpリクエストのルーティング
│   ├── infrastructure  # データベースなど外部接続設定
│   │   └── repository  # データベースへのアクセス
│   ├── logging         # ログ出力制御
│   └── usecase         # 業務処理
│       └── payload     # 業務処理の入力・出力モデル
└── scripts             # 開発支援ツール
```

## パッケージ解説

### api

swagger などの API ドキュメント、およびそれを生成する関数を格納するパッケージです。

### cmd

アプリケーションのエントリポイントとなる関数を格納するパッケージです。基本的に `main.go` のみが格納されます。

### internal/apperrors

アプリケーション内で独自に定義するエラーおよびそのハンドリング関数を格納するパッケージです。

### internal/domain

業務処理の中心となるドメイン構造体およびそれを取得する repository インターフェースを格納するパッケージです。

値のチェックなど、1 つの domain で完結する業務処理についてはこのパッケージ内で実装してください。

repository の戻り値について、ドメイン構造体とテーブル定義とが 1:1 対応している場合は domain を戻し、そうでない場合はテーブル定義に対応する構造体を internal/infrastructure/entity パッケージを新設してその中で定義し、usecase 内で entity から domain への変換を行ってください。

### internal/handler

リクエストモデルの json の解析およびバリデーションを行なって、業務処理を呼び出すハンドラ関数を格納するパッケージです。

### internal/handler/model

API のリクエスト・レスポンスモデルとなる構造体を格納するパッケージです。

### internal/handler/router

http リクエストのルーティングを行う関数を格納するパッケージです。

### internal/infrastructure

データベースや他 API などの外部接続に関する設定を行う関数を格納するパッケージです。

### internal/infrastructure/repository

データベースにアクセスして SQL を実行する関数を格納するパッケージです。

### internal/logging

ログレベル別の文言出力など、ログ出力を制御するパッケージです。

### internal/usecase

業務処理を行う関数を格納するパッケージです。関数内に直接処理を実装するか、domain 内の処理を呼び出す形で業務を実施します。

### internal/usecase/payload

業務処理の入力・出力モデルとなる構造体を格納するパッケージです。

### scripts

テストカバレッジの作成や API ドキュメントの自動生成などの開発支援ツールを格納するパッケージです。
