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
    ├── bootstrap
    │   └── server.go
    └── presentation
        ├── handler
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

	// jsonパースエラー発生時はStatus400を返す
	req, err := model.NewLoginReq(c)
	if err != nil {
		return c.JSON(
			http.StatusBadRequest,
			echo.NewHTTPError(
				http.StatusBadRequest,
				"bad request",
			),
		)
	}

	// usecase呼び出し
	out := h.userUsecase.Login(c.Request().Context(), params.NewLoginIn(req.Name, req.Password))

	return c.JSON(http.StatusOK, model.NewLoginRes(out.Valid()))
}

func (h *UserHandler) Me(c *echo.Context) error {

	// クエリパラメータ取得
	req := model.NewMeReq(c)

	// usecase呼び出し 業務エラー発生時はStatus404を返す
	out, err := h.userUsecase.Me(c.Request().Context(), params.NewMeIn(req.Name))
	if err != nil {
		return c.JSON(
			http.StatusNotFound,
			echo.NewHTTPError(
				http.StatusNotFound,
				"not found",
			),
		)
	}

	return c.JSON(http.StatusOK, model.NewMeRes(out.Name(), out.Age()))
}
```

#### `internal/presentation/handler/model/`

- `user_model.go`

```go
package model

import (
	"errors"

	"github.com/labstack/echo/v5"
)

// 認証向けのリクエストモデルです。
type LoginReq struct {
	Name     string `json:"name"`     // ユーザ名
	Password string `json:"password"` // パスワード
}

func NewLoginReq(c *echo.Context) (LoginReq, error) {

	req := new(LoginReq)
	if err := c.Bind(req); err != nil {
		return LoginReq{}, errors.New("不正なリクエストです。")
	}

	return *req, nil
}

// 認証向けのレスポンスモデルです。
type LoginRes struct {
	Valid bool `json:"valid"` // 認証可否
}

func NewLoginRes(valid bool) LoginRes {
	return LoginRes{Valid: valid}
}

// ユーザ情報取得向けのリクエストモデルです。
type MeReq struct {
	Name string `json:"name"` // ユーザ名
}

func NewMeReq(c *echo.Context) MeReq {
	return MeReq{Name: c.QueryParam("name")}
}

// ユーザ情報取得向けのレスポンスモデルです。
type MeRes struct {
	Name string `json:"name"` // ユーザ名
	Age  int    `json:"age"`  // 年齢
}

func NewMeRes(name string, age int) MeRes {
	return MeRes{Name: name, Age: age}
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
	e.GET(basePath+"/me", h.Me)
}
```

#### `internal/bootstrap/`

- `server.go`

```go
package bootstrap

import (
	"easyapp/internal/application/usecase"
	"easyapp/internal/infrastructure"
	"easyapp/internal/infrastructure/repository"
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
# /me
curl -X GET localhost:8080/api/v1/me?name=nob
```

## APIドキュメントについて

APIドキュメントの記法については[echo-swagger](https://github.com/swaggo/echo-swagger)を参照ください。ほとんど標準ライブラリ利用時のそれと変わりません。
