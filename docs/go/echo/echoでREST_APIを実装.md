# echoでREST APIを実装

cf. https://echo.labstack.com/docs

## サンプルコード

echoを使って簡易的なGETメソッドおよびPOSTメソッドを実装します。アプリケーション層以下はフレームワークに依存しないので省略します。

### ディレクトリ構成

```shell
.
├── cmd
│   └── server
│       └── main.go
└── internal
    ├── apperrors
    │   └── apperrors.go
    ├── bootstrap
    │   └── server.go
    └── presentation
        ├── handler
        │   ├── httperror
        │   │   └── httperror.go
        │   ├── model
        │   │   └── user_model.go
        │   └── user_handler.go
        └── router
            └── router.go
```

### プロジェクト作成

- 下記コマンドでGoモジュールを初期化します。

```shell
go mod init easyapp
```

- echoをインストールします。

```shell
go get github.com/labstack/echo/v5
```

### 実装

#### `internal/presentation/handler/`

- `user_handler.go`

```go
package handler

import (
	"easyapp/internal/application/usecase"
	"easyapp/internal/application/usecase/params"
	"easyapp/internal/presentation/handler/httperror"
	"easyapp/internal/presentation/handler/model"
	"net/http"

	"github.com/labstack/echo/v5"
)

type UserHandler struct {
	userUsecase usecase.UserUsecase
}

func NewUserHandler(userUsecase usecase.UserUsecase) UserHandler {
	return UserHandler{userUsecase: userUsecase}
}

func (h *UserHandler) Login(c *echo.Context) error {

	req, err := model.NewLoginRequest(c)
	if err != nil {
		return c.JSON(httperror.ToHttpErrorResponse(err))
	}

	out, err := h.userUsecase.Login(c.Request().Context(), params.NewLoginInput(req.Name, req.Password))
	if err != nil {
		return c.JSON(httperror.ToHttpErrorResponse(err))
	}

	return c.JSON(http.StatusOK, model.NewLoginResponse(out.Valid()))
}

func (h *UserHandler) GetUser(c *echo.Context) error {

	req := model.NewGetUserRequest(c)

	out, err := h.userUsecase.GetUser(c.Request().Context(), params.NewGetUserInput(req.Name))
	if err != nil {
		return c.JSON(httperror.ToHttpErrorResponse(err))
	}

	return c.JSON(http.StatusOK, model.NewGetUserResponse(out.Name(), out.Age()))
}
```

#### `internal/presentation/handler/model/`

- `user_model.go`

```go
package model

import (
	"easyapp/internal/apperrors"

	"github.com/labstack/echo/v5"
)

// 認証向けのリクエストモデルです。
type LoginRequest struct {
	Name     string `json:"name"`     // ユーザ名
	Password string `json:"password"` // パスワード
}

func NewLoginRequest(c *echo.Context) (LoginRequest, error) {

	req := new(LoginRequest)
	if err := c.Bind(req); err != nil {
		return LoginRequest{}, apperrors.BadRequestErr
	}

	return *req, nil
}

// 認証向けのレスポンスモデルです。
type LoginResponse struct {
	Valid bool `json:"valid"` // 認証可否
}

func NewLoginResponse(valid bool) LoginResponse {
	return LoginResponse{Valid: valid}
}

// ユーザ情報取得向けのリクエストモデルです。
type GetUserRequest struct {
	Name string `json:"name"` // ユーザ名
}

func NewGetUserRequest(c *echo.Context) GetUserRequest {
	return GetUserRequest{Name: c.QueryParam("name")}
}

// ユーザ情報取得向けのレスポンスモデルです。
type GetUserResponse struct {
	Name string `json:"name"` // ユーザ名
	Age  int    `json:"age"`  // 年齢
}

func NewGetUserResponse(name string, age int) GetUserResponse {
	return GetUserResponse{Name: name, Age: age}
}
```

#### `internal/presentation/router/`

- `router.go`

```go
package router

import (
	"easyapp/internal/presentation/handler"

	"github.com/labstack/echo/v5"
)

// APIのベースURI
const basePath string = "/api/v1"

// UserHandler向けのルーティングをセットします。
func SetUserHandlerRouting(e *echo.Echo, h handler.UserHandler) {

	e.POST(basePath+"/login", h.Login)
	e.GET(basePath+"/users", h.GetUser)
}
```

#### `internal/bootstrap/`

- `server.go`

```go
package bootstrap

import (
	"easyapp/internal/application/usecase"
	"easyapp/internal/presentation/handler"
	"easyapp/internal/presentation/router"

	"github.com/labstack/echo/v5"
)

func NewServer() *echo.Echo {

	e := echo.New()

	router.SetUserHandlerRouting(e, handler.NewUserHandler(usecase.NewUserUsecase()))

	return e
}
```

#### `cmd/server/`

- `main.go`

```go
package main

import (
	"easyapp/internal/bootstrap"
)

func main() {

	e := bootstrap.NewServer()
	if err := e.Start(":8080"); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
```

## 起動

下記コマンドでアプリを起動します。

```shell
go run cmd/server/main.go
```

下記コマンドでAPIを打鍵できます。

```shell
# /login
curl -X POST -H 'Content-Type: application/json' -d '{"name": "nob", "password": "passwd"}' localhost:8080/api/v1/login
# /users
curl -X GET localhost:8080/api/v1/users?name=nob
```

## APIドキュメントについて

APIドキュメントの記法については[echo-swagger](https://github.com/swaggo/echo-swagger)を参照ください。ほとんど標準ライブラリ利用時のそれと変わりません。
