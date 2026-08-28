# echoでWeb画面を実装

cf. https://echo.labstack.com/docs/templates

## ディレクトリ構成

```shell
.
├── assets
│   ├── static
│   │   ├── index.js
│   │   └── style.css
│   └── templates
│       └── index.html
├── cmd
│   └── server
│       └── main.go
├── go.mod
├── go.sum
└── internal
    ├── bootstrap
    │   └── server.go
    └── presentation
        ├── handler
        │   └── user_handler.go
        └── router
            └── router.go
```

## サンプルコード

擬似的なログイン画面を実装します。

### 設計

- ログイン画面表示時に、ボタン名をgoからhtmlに渡す
- ボタン入力時にjsからgoの関数を呼び出し、APIをコール
- 結果をalert表示

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

#### `assets/templates`

- `index.html`

```html
<!-- define / endで囲む必要があるので注意 -->
{{define "login"}}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="static/style.css" type="text/css" />
    <link rel="icon" href="static/favicon.ico" />
    <title>First Go web</title>
  </head>

  <body>
    <div class="name-wrapper">
      <input
        class="name-textbox"
        type="text"
        placeholder="ユーザ名"
        id="name"
      />
    </div>
    <div class="password-wrapper">
      <input
        class="password-textbox"
        type="password"
        placeholder="パスワード"
        id="password"
      />
    </div>
    <div class="submit-button-wrapper">
      <button class="submit-button" onclick="handleOnclickButton()">
        {{ .ButtonText }}
      </button>
    </div>

    <script src="static/index.js"></script>
  </body>
</html>
{{end}}
```

#### `assets/static`

- `index.js`

```js
function handleOnclickButton() {
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;
  fetch("/api/v1/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      password: password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
    })
    .catch((error) => {
      console.log(error);
    });
}
```

- `style.css`

```css
body {
  padding: 30px 60px 30px 60px;
  color: #d6d6d6;
  background-color: #000333;
  text-align: center;
}

.name-wrapper {
  padding: 30px 30px 5px 30px;
}

.name-textbox {
  width: 250px;
  height: 35px;
}

.password-wrapper {
  padding: 30px 30px 2px 30px;
}

.password-textbox {
  width: 250px;
  height: 35px;
}

.submit-button-wrapper {
  padding: 30px 30px 2px 30px;
}

.submit-button {
  width: 260px;
  height: 35px;
  background-color: orange;
}

.submit-button:hover {
  cursor: pointer;
}
```

#### `internal/presentation/handler/`

- `user_handler.go`

```go
package handler

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

// ユーザ機能のhandlerです。
type UserHandler struct{}

func NewUserHandler() UserHandler {
	return UserHandler{}
}

func (h *UserHandler) InitView(c *echo.Context) error {
	return c.Render(http.StatusOK, "login", struct{ ButtonText string }{ButtonText: "ログイン"})
}

func (h *UserHandler) Login(c *echo.Context) error {

	req := new(struct {
		Name     string `json:"name"`     // ユーザ名
		Password string `json:"password"` // パスワード
	})
	if err := c.Bind(req); err != nil {
		return c.JSON(
			http.StatusBadRequest,
			echo.NewHTTPError(
				http.StatusBadRequest,
				"Bad request",
			),
		)
	}

	if req.Name == "" || req.Password == "" {
		return c.JSON(
			http.StatusUnprocessableEntity,
			struct {
				Message string `json:"message"` // メッセージ
			}{
				Message: "Input your credentials",
			},
		)
	}

	return c.JSON(http.StatusOK,
		struct {
			Message string `json:"message"` // メッセージ
		}{
			Message: "Hello, " + req.Name + "!",
		},
	)
}
```

#### `internal/presentation/router`

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

	e.GET("/login", h.InitView)
	e.POST(basePath+"/login", h.Login)
}
```

#### `internal/bootstrap/`

- `server.go`

```go
package bootstrap

import (
	"easyapp/internal/presentation/handler"
	"easyapp/internal/presentation/router"
	"io"
	"text/template"

	"github.com/labstack/echo/v5"
)

// 依存性の注入を行い、アプリケーションの構築を行います。
func NewServer() *echo.Echo {

	e := echo.New()

	e.Renderer = &Template{
		templates: template.Must(template.ParseGlob("assets/templates/*.html")),
	}
	e.Static("/static", "assets/static")

	router.SetUserHandlerRouting(e, handler.NewUserHandler())

	return e
}

// echo.Rendererインターフェース実装向けの構造体です。
type Template struct {
	templates *template.Template
}

func (t *Template) Render(c *echo.Context, w io.Writer, name string, data any) error {
	return t.templates.ExecuteTemplate(w, name, data)
}
```

#### `cmd/server/`

- `main.go`

```go
package main

import "easyapp/internal/bootstrap"

func main() {

	e := bootstrap.NewServer()
	if err := e.Start(":8080"); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
```

アプリ起動後、http://localhost:8080/login にアクセスするとログイン画面が表示されます。

## 静的コンテンツをバイナリに含める

上記のコードではgo buildで作成したバイナリファイルにhtmlなどのコンテンツは含まれません。これらもバイナリに含める場合は下記のようにコードを修正します:

- `assets/assets.go`を下記で新規作成

```go
package assets

import "embed"

//go:embed static/*
var Static embed.FS // static埋め込み宣言

//go:embed templates/*
var Templates embed.FS // templates埋め込み宣言
```

- `server.go`について、埋め込んだstatic, templatesを使うよう宣言

```go
	e.Renderer = &Template{
		templates: template.Must(template.ParseFS(assets.Templates, "templates/*.html"))}
	e.StaticFS("/static", echo.MustSubFS(assets.Static, "static"))
```
