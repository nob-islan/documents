# echo で Web 画面を実装

cf. https://echo.labstack.com/docs/templates

## ディレクトリ構成

```shell
.
├── assets
│   ├── static
│   │   ├── index.js
│   │   └── style.css
│   └── templates
│       └── login.html
├── cmd
│   └── main.go
├── go.mod
├── go.sum
└── internal
    └── handler
        ├── auth_handler.go
        └── router
            ├── auth_router.go
            └── base.go
```

## サンプルコード

擬似的なログイン画面を実装します。

### 設計

- ログイン画面表示時に、ボタン名を go から html に渡す
- ボタン入力時に js から go の関数を呼び出し、API をコール
- 結果を alert 表示

### 環境構築

Go + html の開発環境は下記設定で構築した開発コンテナによって用意できます:

<details><summary>devcontainer.json</summary>

```json
{
  "name": "Go",
  "image": "mcr.microsoft.com/devcontainers/go:1.24-bullseye",
  "features": {
    // "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "[go]": {
          "editor.rulers": [100]
        },
        "[html]": {
          "editor.tabSize": 2,
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        },
        "[javascript]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        },
        "[css]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        }
      },
      "extensions": ["golang.go", "esbenp.prettier-vscode"]
    }
  }
}
```

</details>

### 実装

#### assets/

- templates/index.html

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

- static/index.js

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

- static/style.css

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

#### internal/handler/

- auth_handler.go

```go
package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// 認証機能のhandlerです。
type AuthHandler interface {

	// 初期表示処理を行います。
	InitView(c echo.Context) error

	// ログイン処理を行います。
	Login(c echo.Context) error
}

type authHandler struct{}

func NewAuthHandler() AuthHandler {
	return &authHandler{}
}

func (h *authHandler) InitView(c echo.Context) error {
	return c.Render(http.StatusOK, "login", struct{ ButtonText string }{ButtonText: "ログイン"})
}

func (h *authHandler) Login(c echo.Context) error {

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

- router/base.go

```go
package router

import (
	"html/template"
	"io"

	"github.com/labstack/echo/v4"
)

type Router interface {
	SetRouting(e *echo.Echo)
}

// APIのベースURI
const basePath string = "/api/v1"

func Routing() *echo.Echo {

	e := echo.New()

	t := &Template{
		templates: template.Must(template.ParseGlob("assets/templates/*.html")),
	}

	e.Renderer = t
	e.Static("/static", "assets/static")

	NewAuthRouter().SetRouting(e)

	return e
}

// echo.Rendererインターフェース実装向けの構造体です。
type Template struct {
	templates *template.Template
}

func (t *Template) Render(w io.Writer, name string, data any, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}
```

- router/auth_router.go

```go
package router

import (
	"easyapp/internal/handler"

	"github.com/labstack/echo/v4"
)

type authRouter struct{}

func NewAuthRouter() Router {
	return &authRouter{}
}

func (r *authRouter) SetRouting(e *echo.Echo) {

	h := handler.NewAuthHandler()

	e.GET("/login", h.InitView)
	e.POST(basePath+"/login", h.Login)
}
```

#### cmd/

```go
package main

import "easyapp/internal/handler/router"

func main() {

	e := router.Routing()
	e.Logger.Fatal(e.Start(":8080"))
}
```

アプリ起動後、http://localhost:8080/login にアクセスするとログイン画面が表示されます。
