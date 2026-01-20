# swaggoでAPIドキュメント作成

API設計書の作成方法について説明します。swagによってコメントからswaggerを自動生成するようにしています。

cf.

- https://github.com/swaggo/http-swagger
- https://github.com/swaggo/swag

## ライブラリインストール

下記コマンドでswagおよびhttp-swaggerをインストールします:

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

+ // @title Easy App
+ // @version 1.0.0
+ // @descriptionサンプルのREST APIです。
+ //
+ // @BasePath /api/v1
  func main() {

	  fmt.Println("Server started at http://localhost:8080")
	  log.Fatal(http.ListenAndServe(":8080", router.Routing()))
  }
```

### router/base.go

swaggerページへのルーティングを設定します。

```diff
  package router

  import (
	  "easyapp/internal/infrastructure"
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

	  // データベースに接続
	  db := infrastructure.ConnectDB()

	  // 各handlerに紐づくルーティングを設定
	  m := http.NewServeMux()

+	  // swagger UIのルーティング
+	  m.Handle("/swagger/", httpSwagger.WrapHandler)

	  // users
	  NewUsersRouter(db).SetRouting(m)

	  return m
  }
```

### handler/users_handler.go

各APIのインターフェース仕様を記載します:

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

  // 認証のハンドラインターフェースです。
  type UsersHandler interface {

	  // 認証処理を呼び出します。
	  Login(w http.ResponseWriter, r *http.Request)

	  // ユーザ情報取得処理を呼び出します。
	  Me(w http.ResponseWriter, r *http.Request)
  }

  type usersHandler struct {
	  usersUsecase usecase.UsersUsecase
  }

  func NewUsersHandler(usersUsecase usecase.UsersUsecase) UsersHandler {
	  return &usersHandler{usersUsecase: usersUsecase}
  }

+ // @Summary 認証
+ // @Description 認証処理を行います。リクエストに不備があった場合はエラーレスポンスを返します。
+ // @Tags Users
+ // @Accept json
+ // @Produce json
+ // @Param LoginReq body model.LoginReq true "認証向けのリクエストモデル"
+ // @Success 200 {object} model.LoginRes "正常に処理された場合"
+ // @Failure 422 {object} apperrors.sampleErrorRes "エラーが発生した場合"
+ // @Router /login [post]
  func (h *usersHandler) Login(w http.ResponseWriter, r *http.Request) {

	  req := model.NewLoginReq(r)

	  out, err := h.usersUsecase.Login(payload.NewLoginIn(req.Name, req.Password))
	  if err != nil {
		  apperrors.HandleError(w, err)
		  return
	  }

	  res := model.NewLoginRes(out.Valid())
	  w.Header().Set("Content-Type", "application/json")
	  w.WriteHeader(http.StatusOK)
	  json.NewEncoder(w).Encode(res)
  }

+ // @Summary ユーザ情報取得
+ // @Description ユーザ情報を取得します。
+ // @Tags Users
+ // @Accept json
+ // @Produce json
+ // @Param MeReq query model.MeReq false "ユーザ情報取得向けのリクエストモデル"
+ // @Success 200 {object} model.MeRes "正常に処理された場合"
+ // @Router /me [get]
  func (h *usersHandler) Me(w http.ResponseWriter, r *http.Request) {

	  req := model.NewMeReq(r)

	  out := h.usersUsecase.Me(payload.NewMeIn(req.Name))

	  res := model.NewMeRes(out.Name(), out.Age())
	  w.Header().Set("Content-Type", "application/json")
	  w.WriteHeader(http.StatusOK)
	  json.NewEncoder(w).Encode(res)
  }
```

### model/users_model.go

各モデルクラスのexample記載します:

```diff
  package model

  import (
	  "encoding/json"
	  "net/http"
  )

  // 認証向けのリクエストモデルです。
  type LoginReq struct {
-	  Name     string `json:"name"`     // ユーザ名
-	  Password string `json:"password"` // パスワード
+	  Name     string `json:"name" example:"nob"`        // ユーザ名
+	  Password string `json:"password" example:"passwd"` // パスワード
  }

  func NewLoginReq(r *http.Request) LoginReq {

	  var req LoginReq
	  decoder := json.NewDecoder(r.Body)
	  if err := decoder.Decode(&req); err != nil {
		  return *new(LoginReq)
	  }
	  return req
  }

  // 認証向けのレスポンスモデルです。
  type LoginRes struct {
- 	  Valid bool `json:"valid"` // 認証可否
+	  Valid bool `json:"valid" example:"true"` // 認証可否
  }

  func NewLoginRes(valid bool) LoginRes {
	  return LoginRes{Valid: valid}
  }

  // ユーザ情報取得向けのリクエストモデルです。
  type MeReq struct {
- 	  Name string `json:"name"` // ユーザ名
+	  Name string `json:"name" example:"nob"` // ユーザ名
  }

  func NewMeReq(r *http.Request) MeReq {
	  return MeReq{Name: r.URL.Query().Get("name")}
  }

  // ユーザ情報取得向けのレスポンスモデルです。
  type MeRes struct {
-	  Name string `json:"name"` // ユーザ名
-	  Age  int    `json:"age"`  // 年齢
+	  Name string `json:"name" example:"nob"` // ユーザ名
+	  Age  int    `json:"age" example:"13"`   // 年齢
  }

  func NewMeRes(name string, age int) MeRes {
	  return MeRes{Name: name, Age: age}
  }
```

### apperrors/sample_error.go

例外発生時レスポンスモデルのexampleを記載します:

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

下記コマンドでswaggerドキュメントを生成します:

```shell
swag init -o ./api -g cmd/main.go
```

アプリを起動します:

```shell
go run cmd/main.go
```

アプリ起動後、http://localhost:8080/swagger/index.html でswaggerドキュメントを確認できます。
