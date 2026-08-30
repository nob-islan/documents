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
// @Param LoginRequest body model.LoginRequest true "認証向けのリクエストモデル"
// @Success 200 {object} model.LoginResponse "正常に処理された場合"
// @Failure 422 {object} apperrors.easyappBusinessErrorResponse "エラーが発生した場合"
// @Router /login [post]
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {

	req, err := model.NewLoginRequest(r)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(
			struct {
				Message string `json:"message"`
			}{
				Message: "bad request",
			},
		)
		return
	}

	out := h.userUsecase.Login(r.Context(), params.NewLoginInput(req.Name, req.Password))

	res := model.NewLoginResponse(out.Valid())
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

// @Summary ユーザ情報取得
// @Description ユーザ情報を取得します。
// @Tags User
// @Accept json
// @Produce json
// @Param GetUserRequest query model.GetUserRequest false "ユーザ情報取得向けのリクエストモデル"
// @Success 200 {object} model.GetUserResponse "正常に処理された場合"
// @Router /users [get]
func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {

	req := model.NewGetUserRequest(r)

	out, err := h.userUsecase.GetUser(r.Context(), params.NewGetUserInput(req.Name))
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

	res := model.NewGetUserResponse(out.Name(), out.Age())
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
type LoginRequest struct {
	Name     string `json:"name" example:"nob"`        // ユーザ名
	Password string `json:"password" example:"passwd"` // パスワード
}

func NewLoginRequest(r *http.Request) (LoginRequest, error) {

	var req LoginRequest
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		return LoginRequest{}, err
	}
	return req, nil
}

// 認証向けのレスポンスモデルです。
type LoginResponse struct {
	Valid bool `json:"valid" example:"true"` // 認証可否
}

func NewLoginResponse(valid bool) LoginResponse {
	return LoginResponse{Valid: valid}
}

// ユーザ情報取得向けのリクエストモデルです。
type GetUserRequest struct {
	Name string `json:"name" example:"nob"` // ユーザ名
}

func NewGetUserRequest(r *http.Request) GetUserRequest {
	return GetUserRequest{Name: r.URL.Query().Get("name")}
}

// ユーザ情報取得向けのレスポンスモデルです。
type GetUserResponse struct {
	Name string `json:"name" example:"nob"` // ユーザ名
	Age  int    `json:"age" example:"13"`   // 年齢
}

func NewGetUserResponse(name string, age int) GetUserResponse {
	return GetUserResponse{Name: name, Age: age}
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
type easyappBusinessErrorResponse struct {
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
