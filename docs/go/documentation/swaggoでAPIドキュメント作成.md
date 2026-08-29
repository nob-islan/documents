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

下記コマンドでswaggerドキュメントを初期化します:

```shell
swag init -o ./api -g cmd/server/main.go
```

## 実装

### `cmd/server/main.go`

アプリケーションの概要およびメタ情報を追記します。

```go
package main

import (
	"easyapp/internal/bootstrap"
	"fmt"
	"log"
	"net/http"
)

// @title Easy App
// @version 1.0.0
// @description サンプルのREST APIです。
//
// @BasePath /api/v1
func main() {

	fmt.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", bootstrap.NewServer()))
}

```

### `bootstrap/server.go`

swaggerページへのルーティングを設定します。

```go
package bootstrap

import (
	"easyapp/internal/application/usecase"
	"easyapp/internal/infrastructure"
	"easyapp/internal/infrastructure/repository"
	"easyapp/internal/presentation/handler"
	"easyapp/internal/presentation/router"
	"net/http"

	_ "easyapp/api" // apiパッケージ配下のドキュメントをimport

	httpSwagger "github.com/swaggo/http-swagger" // http-swaggerをimport
)

// 依存性の注入を行い、アプリケーションの構築を行います。
func NewServer() http.Handler {

	// データベースに接続
	db := infrastructure.ConnectDB()

	// 各handlerに紐づくルーティングを設定
	m := http.NewServeMux()

	// swagger UIのルーティング
	m.Handle("/swagger/", httpSwagger.WrapHandler)

	// user
	router.SetUserHandlerRouting(
		m,
		handler.NewUserHandler(
			usecase.NewUserUsecase(
				repository.NewUserRepository(
					db,
				),
			),
		),
	)

	return m
}
```

### `handler/presentation/user_handler.go`

各APIのインターフェース仕様を関数部分に記載します:

```go
package handler

import (
	"easyapp/internal/application/usecase"
	"easyapp/internal/application/usecase/params"
	"easyapp/internal/presentation/handler/model"
	"encoding/json"
	"net/http"
)

// 認証のhandlerです。
type UserHandler struct {
	userUsecase usecase.UserUsecase
}

func NewUserHandler(userUsecase usecase.UserUsecase) UserHandler {
	return UserHandler{userUsecase: userUsecase}
}

// @Summary 認証
// @Description 認証処理を行います。リクエストに不備があった場合はエラーレスポンスを返します。
// @Tags User
// @Accept json
// @Produce json
// @Param LoginReq body model.LoginReq true "認証向けのリクエストモデル"
// @Success 200 {object} model.LoginRes "正常に処理された場合"
// @Failure 422 {object} apperrors.easyappBusinessErrorRes "エラーが発生した場合"
// @Router /login [post]
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {

	req := model.NewLoginReq(r)

	out := h.userUsecase.Login(r.Context(), params.NewLoginIn(req.Name, req.Password))

	res := model.NewLoginRes(out.Valid())
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

// @Summary ユーザ情報取得
// @Description ユーザ情報を取得します。
// @Tags User
// @Accept json
// @Produce json
// @Param UserReq query model.UserReq false "ユーザ情報取得向けのリクエストモデル"
// @Success 200 {object} model.UserRes "正常に処理された場合"
// @Router /user [get]
func (h *UserHandler) User(w http.ResponseWriter, r *http.Request) {

	req := model.NewUserReq(r)

	out, err := h.userUsecase.User(r.Context(), params.NewUserIn(req.Name))
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(
			struct {
				Message string `json:"message"`
			}{
				Message: err.Error(),
			},
		)
		return
	}

	res := model.NewUserRes(out.Name(), out.Age())
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}
```

### `model/user_model.go`

各モデルクラスのexample記載します:

```go
package model

import (
	"encoding/json"
	"net/http"
)

// 認証向けのリクエストモデルです。
type LoginReq struct {
	Name     string `json:"name" example:"nob"`        // ユーザ名
	Password string `json:"password" example:"passwd"` // パスワード
}

func NewLoginReq(r *http.Request) LoginReq {

	var req LoginReq
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		return LoginReq{}
	}
	return req
}

// 認証向けのレスポンスモデルです。
type LoginRes struct {
	Valid bool `json:"valid" example:"true"` // 認証可否
}

func NewLoginRes(valid bool) LoginRes {
	return LoginRes{Valid: valid}
}

// ユーザ情報取得向けのリクエストモデルです。
type UserReq struct {
	Name string `json:"name" example:"nob"` // ユーザ名
}

func NewUserReq(r *http.Request) UserReq {
	return UserReq{Name: r.URL.Query().Get("name")}
}

// ユーザ情報取得向けのレスポンスモデルです。
type UserRes struct {
	Name string `json:"name" example:"nob"` // ユーザ名
	Age  int    `json:"age" example:"13"`   // 年齢
}

func NewUserRes(name string, age int) UserRes {
	return UserRes{Name: name, Age: age}
}
```

### `apperrors/easyapp_business_error.go`

例外発生時レスポンスモデルのexampleを記載します:

```go
package apperrors

// easyappの業務エラー向け構造体です。想定内のエラーが発生した場合に返るエラーです。
type EasyappBusinessError struct {
	message string // エラーメッセージ
}

func NewEasyappBusinessError(message string) EasyappBusinessError {
	return EasyappBusinessError{message: message}
}

func (e EasyappBusinessError) Error() string {
	return e.message
}

// easyappの業務エラーレスポンスモデルです。想定内のエラーが発生した場合に返るエラーです。
type easyappBusinessErrorRes struct {
	Message string `json:"message" example:"user not found"` // エラーメッセージ
}
```

## 動作確認

下記コマンドでswaggerドキュメントを生成します:

```shell
swag init -o ./api -g cmd/server/main.go
```

アプリを起動します:

```shell
go run cmd/server/main.go
```

アプリ起動後、http://localhost:8080/swagger/index.html でswaggerドキュメントを確認できます。
