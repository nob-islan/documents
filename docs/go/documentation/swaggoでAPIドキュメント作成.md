# swaggo で API ドキュメント作成

API 設計書の作成方法について説明します。swag によってコメントから swagger を自動生成するようにしています。

cf.

- https://github.com/swaggo/http-swagger
- https://github.com/swaggo/swag

## ライブラリインストール

下記コマンドで swag および http-swagger をインストールします:

```shell
go install github.com/swaggo/swag/cmd/swag@latest
go get -u github.com/swaggo/http-swagger
```

## 実装

### cmd/main.go

アプリケーションの概要およびメタ情報を追記します。

```diff
  package main

  import (
	  "easyapp/internal/handler/router"
	  "fmt"
	  "log"
	  "net/http"
  )

+ // @title Easy App API
+ // @version 1.0.0
+ // @description サンプルのREST APIです。
+ //
+ // @BasePath /v1/api
  func main() {

  	  fmt.Println("Server started at http://localhost:8080")
	  log.Fatal(http.ListenAndServe(":8080", router.Routing()))
  }
```

### router/base.go

swagger ページへのルーティングを設定します。

```diff
  package router

  import (
	  "net/http"

+	  _ "easyapp/api"

+	  httpSwagger "github.com/swaggo/http-swagger"
  )

  // routerのインターフェースです。
  type Router interface {

	  // ルーティング情報をセットします。
	  SetRouting(m *http.ServeMux)
  }

  // APIのベースURI
  const basePath string = "/api/v1"

  // ルーティングを設定します。
  func Routing() *http.ServeMux {

	  // 各handlerに紐づくルーティングを設定
	  m := http.NewServeMux()

+	  // swagger UI のルーティング
+	  m.Handle("/swagger/", httpSwagger.WrapHandler)

	  // sample
	  NewSampleRouter().SetRouting(m)

	  return m
}
```

### handler/sample_handler.go

各 API のインターフェース仕様を記載します:

```diff
  package handler

  import (
	  "easyapp/internal/apperrors"
	  "easyapp/internal/handler/model"
	  "easyapp/internal/usecase"
	  "easyapp/internal/usecase/payload"
	  "encoding/json"
	  "net/http"
  )

  // サンプルハンドラのインターフェースです。
  type SampleHandler interface {

	  // 挨拶メッセージを返します。
	  Greeting(w http.ResponseWriter, r *http.Request)

	  // ユーザ登録処理を行います。
	  Regist(w http.ResponseWriter, r *http.Request)
  }

  type sampleHandler struct {
	  sampleUsecase usecase.SampleUsecase
  }

  func NewSampleHandler(sampleUsecase usecase.SampleUsecase) SampleHandler {
	 return sampleHandler{sampleUsecase: sampleUsecase}
  }

+ // @Summary 挨拶メッセージ取得
+ // @Description 入力されたユーザ名に対して挨拶メッセージを返します。
+ // @Tags Sample
+ // @Accept json
+ // @Produce json
+ // @Param GreetReq query model.GreetReq false "挨拶APIのリクエストモデル"
+ // @Success 200 {object} model.GreetRes "正常に処理された場合"
+ // @Router /greet [get]
  func (h sampleHandler) Greeting(w http.ResponseWriter, r *http.Request) {

	  req := model.NewGreetReq(r)

	  out := h.sampleUsecase.Greeting(payload.NewGreetIn(req.Name))

	  res := model.NewGreetRes(out.Message())
	  w.Header().Set("Content-Type", "application/json")
	  w.WriteHeader(http.StatusOK)
	  json.NewEncoder(w).Encode(res)
  }

+ // @Summary ユーザ情報登録
+ // @Description ユーザ登録処理を行います。登録に成功した場合のみ正常レスポンスを返し、それ以外はエラーレスポンスを返します。
+ // @Tags Sample
+ // @Accept json
+ // @Produce json
+ // @Param RegistReq body model.RegistReq true "登録APIのリクエストモデル"
+ // @Success 200 {object} model.RegistRes "正常に処理された場合"
+ // @Failure 422 {object} apperrors.sampleErrorRes "エラーが発生した場合"
+ // @Router /user [post]
  func (h sampleHandler) Regist(w http.ResponseWriter, r *http.Request) {

	  req := model.NewRegistReq(r)

	  out, err := h.sampleUsecase.Regist(payload.NewRegistIn(req.Name, req.Age))
	  if err != nil {
		  apperrors.HandleError(w, err)
		  return
	  }

	  res := model.NewRegistRes(out.Message())
	  w.Header().Set("Content-Type", "application/json")
	  w.WriteHeader(http.StatusOK)
	  json.NewEncoder(w).Encode(res)
  }
```

### model/sample_model.go

各モデルクラスの example 記載します:

```diff
  package model

  import (
	  "encoding/json"
	  "net/http"
  )

  // 挨拶APIのリクエストモデルです。
  type GreetReq struct {
-	  Name string `json:"name"` // ユーザ名
+	  Name string `json:"name" example:"nob"` // ユーザ名
  }

  func NewGreetReq(r *http.Request) GreetReq {

	  return GreetReq{Name: r.URL.Query().Get("name")}
  }

  // 挨拶APIのレスポンスモデルです。
  type GreetRes struct {
-	  Message string `json:"message"` // 挨拶メッセージ
+	  Message string `json:"message" example:"Hello, nob!"` // 挨拶メッセージ
  }

  func NewGreetRes(message string) GreetRes {
	  return GreetRes{Message: message}
  }

  // 登録APIのリクエストモデルです。
  type RegistReq struct {
-	  Name string `json:"name"` // ユーザ名
-	  Age  int    `json:"age"`  // 年齢
+	  Name string `json:"name" example:"nob"` // ユーザ名
+	  Age  int    `json:"age" example:"13"`   // 年齢
  }

  func NewRegistReq(r *http.Request) RegistReq {

	  var req RegistReq
	  decoder := json.NewDecoder(r.Body)
	  if err := decoder.Decode(&req); err != nil {
		  return *new(RegistReq)
	  }
	  return req
  }

  // 登録APIのレスポンスモデルです。
  type RegistRes struct {
- 	  Message string `json:"message"` // 登録メッセージ
+ 	  Message string `json:"message" example:"登録が完了しました。"` // 登録メッセージ
  }

  func NewRegistRes(message string) RegistRes {
	  return RegistRes{Message: message}
  }
```

### apperrors/sample_error.go

例外発生時レスポンスモデルの example を記載します:

```diff
  package apperrors

  import (
	  "encoding/json"
	  "net/http"
  )

  // サンプルのエラーです。
  type SampleError struct {
	  message string // エラーメッセージ
  }

  func NewSampleError(message string) EasyappError {
	  return &SampleError{message: message}
  }

  func (e *SampleError) Error() string {
	  return e.message
  }

  func (e *SampleError) ReturnError(w http.ResponseWriter) {

	  res := sampleErrorRes{Message: e.message}
	  w.Header().Set("Content-Type", "application/json")
	  w.WriteHeader(http.StatusUnprocessableEntity)
	  json.NewEncoder(w).Encode(res)
  }

  // サンプルエラーのレスポンスモデルです。
  type sampleErrorRes struct {
-	  Message string `json:"message"` // エラーメッセージ
+	  Message string `json:"message" example:"エラーが発生しました。"` // エラーメッセージ
  }
```

## 動作確認

下記コマンドで swagger ドキュメントを生成します:

```shell
swag init -o ./api -g cmd/main.go
```

アプリを起動します:

```shell
go run cmd/main.go
```

アプリ起動後、http://localhost:8080/swagger/index.html で swagger ドキュメントを確認できます。
