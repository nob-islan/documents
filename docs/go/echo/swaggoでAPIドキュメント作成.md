# swaggoでAPIドキュメント作成

cf.

- https://github.com/swaggo/echo-swagger
- https://pkg.go.dev/github.com/swaggo/swag/v2

## ライブラリインストール

下記コマンドでswagおよびecho-swaggerをインストールします:

```shell
go install github.com/swaggo/swag/v2/cmd/swag@latest
go get -u github.com/swaggo/echo-swagger/v2
```

下記コマンドでswaggerドキュメントを初期化します:

```shell
swag init -o ./api -g cmd/server/main.go
```

## 実装

`server.go`以外は標準ライブラリ使用時の記法に従います。

### `bootstrap/server.go`

```go
package bootstrap

import (
	"easyapp/internal/application/usecase"
	"easyapp/internal/presentation/handler"
	"easyapp/internal/presentation/router"

	"github.com/labstack/echo/v5"

	_ "easyapp/api"

	echoSwagger "github.com/swaggo/echo-swagger/v2"
)

func NewServer() *echo.Echo {

	e := echo.New()

	e.GET("/swagger/*", echoSwagger.WrapHandlerV3)

	// データベースに接続
	db := infrastructure.ConnectDB()

	router.SetUserHandlerRouting(e, handler.NewUserHandler(usecase.NewUserUsecase()))

	return e
}
```
