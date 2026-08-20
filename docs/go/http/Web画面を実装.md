# Web画面を実装

`html/template`を使ってhtmlコンテンツを返却するGoアプリを作成します。

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
│   └── main.go
├── go.mod
└── internal
    ├── bootstrap
    │   └── server.go
    └── presentation
        ├── handler
        │   └── user_handler.go
        └── router
            ├── base.go
            └── user_router.go
```

## サンプルコード

擬似的なログイン画面を実装します。

### 設計

- ログイン画面表示時に、ボタン名をgoからhtmlに渡す
- ボタン入力時にjsからgoの関数を呼び出し、APIをコール
- 結果をalert表示

### 実装

#### `assets/templates`

- `index.html`

```html
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
	"encoding/json"
	"html/template"
	"net/http"
)

// 認証機能のhandlerです。
type UserHandler interface {

	// 初期表示処理を行います。
	InitView(w http.ResponseWriter, r *http.Request)

	// ログイン処理を行います。
	Login(w http.ResponseWriter, r *http.Request)
}

type userHandler struct{}

func NewUserHandler() UserHandler {
	return &userHandler{}
}

func (h *userHandler) InitView(w http.ResponseWriter, r *http.Request) {

	tmpl, err := template.ParseFiles("assets/templates/index.html")
	if err != nil {
		http.Error(w, "Template parsing error", http.StatusInternalServerError)
		return
	}

	// 画面表示用の構造体を作成
	initView := struct{ ButtonText string }{ButtonText: "ログイン"}

	err = tmpl.Execute(w, initView)
	if err != nil {
		http.Error(w, "Template execution error", http.StatusInternalServerError)
	}
}

func (h *userHandler) Login(w http.ResponseWriter, r *http.Request) {

	var req struct {
		Name     string `json:"name"`     // ユーザ名
		Password string `json:"password"` // パスワード
	}
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	if req.Name == "" || req.Password == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(struct {
			Message string `json:"message"` // メッセージ
		}{
			Message: "Input your credentials",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(struct {
		Message string `json:"message"` // メッセージ
	}{
		Message: "Hello, " + req.Name + "!",
	})
}
```

#### `internal/presentation/router/`

- `base.go`

```go
package router

import (
	"net/http"
)

// routerのインターフェースです。
type Router interface {

	// ルーティング情報をセットします。
	SetRouting(m *http.ServeMux)
}

// APIのベースURI
const basePath string = "/api/v1"
```

- `user_router.go`

```go
package router

import (
	"easyapp/internal/presentation/handler"
	"net/http"
)

type userRouter struct {
	userHandler handler.UserHandler
}

func NewUserRouter(userHandler handler.UserHandler) Router {
	return &userRouter{userHandler: userHandler}
}

func (router *userRouter) SetRouting(m *http.ServeMux) {

	// カスタムルータ
	m.HandleFunc(basePath+"/login", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			router.userHandler.Login(w, r)
		default:
			http.Error(w, "Forbidden", http.StatusForbidden)
		}
	})
	m.HandleFunc("/login", router.userHandler.InitView)
}
```

#### `internal/bootstrap/`

- `server.go`

```go
package bootstrap

import (
	"easyapp/internal/presentation/handler"
	"easyapp/internal/presentation/router"
	"net/http"
)

// 依存性の注入を行い、アプリケーションの構築を行います。
func NewServer() http.Handler {

	// 各handlerに紐づくルーティングを設定
	m := http.NewServeMux()

	// static配下をルーティング
	m.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("assets/static"))))

	// user
	router.NewUserRouter(handler.NewUserHandler()).SetRouting(m)

	return m
}
```

#### `cmd/`

- `main.go`

```go
package main

import (
	"easyapp/internal/bootstrap"
	"fmt"
	"log"
	"net/http"
)

func main() {

	fmt.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", bootstrap.NewServer()))
}
```

アプリ起動後、http://localhost:8080/login にアクセスするとログイン画面が表示されます。

## 静的コンテンツをバイナリに含める

上記のコードでは`go build`で作成したバイナリファイルにhtmlなどのコンテンツは含まれません。これらもバイナリに含める場合は下記のようにコードを修正します:

- `assets/assets.go`を下記で新規作成

```go
package assets

import "embed"

//go:embed static/*
var Static embed.FS // static埋め込み宣言

//go:embed templates/*
var Templates embed.FS // templates埋め込み宣言
```

- `server.go`について、埋め込んだstaticを使うよう宣言

```go
	staticFiles, err := fs.Sub(assets.Static, "static")
	if err != nil {
		log.Fatalf("Failed to create sub filesystem: %v", err)
	}
	m.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.FS(staticFiles))))
```

- `user_handler.go`について、埋め込んだtemplatesを使うよう宣言

```go
	tmpl, err := template.ParseFS(assets.Templates, "templates/index.html")
	if err != nil {
		http.Error(w, "Template parsing error", http.StatusInternalServerError)
		return
	}
```
