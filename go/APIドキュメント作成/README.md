# API ドキュメント作成

API 設計書の作成方法について説明します。`swag`によってコメントから swagger を自動生成するようにしています。

cf.

- [インストール手順](https://github.com/swaggo/http-swagger)
- [具体的な書き方](https://github.com/swaggo/swag)

## 作成手順

- `swag`インストール

  ```shell
  go install github.com/swaggo/swag/cmd/swag@latest
  ```

- `http-swagger`ダウンロード

  ```shell
  go get -u github.com/swaggo/http-swagger
  ```

- swagger 向けコメント記載

  URI やリクエスト・レスポンスに関する情報は handler メソッド上に記載します:

  ```go
  // @Summary ユーザ作成
  // @Description リクエストの内容でユーザを作成します。
  // @Tags Users
  // @Accept json
  // @Produce json
  // @Param UserRegistReq body reqres.UserRegistReq true "ユーザ新規登録リクエスト"
  // @Success 200 {object} reqres.UserRegistRes
  // @Success 400 {object} errs.validateErrorRes
  // @Router /user [post]
  func (h *userInfoHandler) Regist(w http.ResponseWriter, r *http.Request) {
  ```

  モデルの各パラメータに関する説明のコメントがそのまま swagger に反映されます。

  ```go
  // ユーザ登録向けリクエストモデルです。
  type UserRegistReq struct {
  	Username string `json:"username" example:"nob"` // ユーザ名
  	Age      int    `json:"age" example:"13"`       // 年齢
  }

  // ユーザ登録向けレスポンスモデルです。
  type UserRegistRes struct {
  	Message string `json:"message" example:"Success"` // 登録成否
  }
  ```

- swagger ファイル出力

  ```shell
  swag init
  ```

  `docs`配下に json ファイルが出力されます。

- swagger ルーティング

  出力した swagger.json をアプリ上でルーティングするため、下記設定を追記します:

  ```go
  import (
      "net/http"

      _ "firstapp/docs" // 自モジュール配下のdocsをimportしないとswagger画面で500エラーとなるので注意

      httpSwagger "github.com/swaggo/http-swagger"
  )
  ```

  ```go
  // 各ハンドラに紐づくルーティングを設定
  m := http.NewServeMux()

  // swagger UI のルーティング
  m.Handle("/swagger/", httpSwagger.WrapHandler)
  ```

  アプリ起動後、下記から swagger を参照できます:

  ```
  http://localhost:8080/swagger/index.html
  ```
