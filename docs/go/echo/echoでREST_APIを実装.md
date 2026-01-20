# echoでREST APIを実装

cf. https://echo.labstack.com/docs

## サンプルコード

echoを使って簡易的なGETメソッドおよびPOSTメソッドを実装します。usecase配下はフレームワークに依存しないので省略します。

### ディレクトリ構成

```
.
├── cmd
│   └── main.go
└── internal
    └── handler
        ├── users_handler.go
        ├── users_handler_test.go
        ├── model
        │   └── users_model.go
        └── router
            ├── users_router.go
            └── base.go
```

### プロジェクト作成

- 下記コマンドでGoモジュールを初期化します。

```shell
go mod init easyapp
```

- echoをインストールします。

```shell
go get github.com/labstack/echo/v4
```

### 実装

#### internal/handler/

- users_handler.go

```go
package handler

import (
	"easyapp/internal/handler/model"
	"easyapp/internal/usecase"
	"easyapp/internal/usecase/payload"
	"net/http"

	"github.com/labstack/echo/v4"
)

// 認証のhandlerインターフェースです。
type UsersHandler interface {

	// 認証処理を呼び出します。
	Login(c echo.Context) error

	// ユーザ情報取得処理を呼び出します。
	Me(c echo.Context) error
}

type usersHandler struct {
	usersUsecase usecase.UsersUsecase
}

func NewUsersHandler(usersUsecase usecase.UsersUsecase) UsersHandler {
	return &usersHandler{usersUsecase: usersUsecase}
}

func (h *usersHandler) Login(c echo.Context) error {

	// jsonパース エラー発生時はStatus400を返す
	req, err := model.NewLoginReq(c)
	if err != nil {
		return c.JSON(
			http.StatusBadRequest,
			echo.NewHTTPError(
				http.StatusBadRequest,
				"Bad request",
			),
		)
	}

	// usecase呼び出し
	out := h.usersUsecase.Login(payload.NewLoginIn(req.Name, req.Password))

	return c.JSON(http.StatusOK, model.NewLoginRes(out.Valid()))
}

func (h *usersHandler) Me(c echo.Context) error {

	// クエリパラメータ取得
	req := model.NewMeReq(c)

	// usecase呼び出し 業務エラー発生時はStatus500を返す
	out, err := h.usersUsecase.Me(payload.NewMeIn(req.Name))
	if err != nil {
		return c.JSON(
			http.StatusInternalServerError,
			echo.NewHTTPError(
				http.StatusInternalServerError,
				"Internal server error",
			),
		)
	}

	return c.JSON(http.StatusOK, model.NewMeRes(out.Name(), out.Age()))
}
```

#### internal/handler/model/

- users_model.go

```go
package model

import (
	"errors"

	"github.com/labstack/echo/v4"
)

// 認証向けのリクエストモデルです。
type LoginReq struct {
	Name     string `json:"name"`     // ユーザ名
	Password string `json:"password"` // パスワード
}

func NewLoginReq(c echo.Context) (LoginReq, error) {

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

func NewMeReq(c echo.Context) MeReq {
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

#### internal/handler/router/

- base.go

```go
package router

import (
	"github.com/labstack/echo/v4"
)

type Router interface {
	SetRouting(e *echo.Echo)
}

const basePath string = "/api/v1"

func Routing() *echo.Echo {

	e := echo.New()

	NewUsersRouter().SetRouting(e)

	return e
}
```

- users_router.go

```go
package router

import (
	"easyapp/internal/handler"
	"easyapp/internal/usecase"

	"github.com/labstack/echo/v4"
)

type usersRouter struct{}

func NewUsersRouter() Router {
	return &usersRouter{}
}

func (r *usersRouter) SetRouting(e *echo.Echo) {

	h := handler.NewUsersHandler(usecase.NewUsersUsecase())

	e.POST(basePath+"/login", h.Login)
	e.GET(basePath+"/me", h.Me)
}
```

#### cmd/

- main.go

```go
package main

import "easyapp/internal/handler/router"

func main() {

	e := router.Routing()
	e.Logger.Fatal(e.Start(":8080"))
}
```

### APIドキュメントについて

APIドキュメントの記法については [echo-swagger](https://github.com/swaggo/echo-swagger) を参照ください。ほとんど標準ライブラリ利用時のそれと変わりません。
