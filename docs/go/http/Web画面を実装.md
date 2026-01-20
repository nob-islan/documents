# Web画面を実装

`html/template`を使ってhtmlコンテンツを返却するGoアプリを作成します。

## ディレクトリ構成

```
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
    └── handler
        ├── users_handler.go
        └── router
            ├── users_router.go
            └── base.go
```

## サンプルコード

擬似的なログイン画面を実装します。

### 設計

- ログイン画面表示時に、ボタン名をgoからhtmlに渡す
- ボタン入力時にjsからgoの関数を呼び出し、APIをコール
- 結果をalert表示

### 実装

#### assets/

- templates/index.html

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

- users_handler.go

```go
package handler

import (
	"encoding/json"
	"html/template"
	"net/http"
)

// 認証機能のhandlerです。
type UsersHandler interface {

	// 初期表示処理を行います。
	InitView(w http.ResponseWriter, r *http.Request)

	// ログイン処理を行います。
	Login(w http.ResponseWriter, r *http.Request)
}

type usersHandler struct{}

func NewUsersHandler() UsersHandler {
	return &usersHandler{}
}

func (h *usersHandler) InitView(w http.ResponseWriter, r *http.Request) {

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

func (h *usersHandler) Login(w http.ResponseWriter, r *http.Request) {

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

- router/base.go

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

// ルーティングを設定します。
func Routing() *http.ServeMux {

	// 各handlerに紐づくルーティングを設定
	m := http.NewServeMux()

	// static配下をルーティング
	m.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("assets/static"))))

	// users
	NewUsersRouter().SetRouting(m)

	return m
}
```

- router/users_router.go

```go
package router

import (
	"easyapp/internal/handler"
	"net/http"
)

type usersRouter struct{}

func NewUsersRouter() Router {
	return &usersRouter{}
}

func (r *usersRouter) SetRouting(m *http.ServeMux) {

	h := handler.NewUsersHandler()

	// カスタムルータ
	m.HandleFunc(basePath+"/login", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			h.Login(w, r)
		default:
			http.Error(w, "Forbidden", http.StatusForbidden)
		}
	})
	m.HandleFunc("/login", h.InitView)
}
```

#### cmd/

- main.go

```go
package main

import (
	"easyapp/internal/handler/router"
	"fmt"
	"log"
	"net/http"
)

func main() {

	fmt.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", router.Routing()))
}
```

アプリ起動後、http://localhost:8080/login にアクセスするとログイン画面が表示されます。

## 静的コンテンツをバイナリに含める

上記のコードでは`go build`で作成したバイナリファイルにhtmlなどのコンテンツは含まれません。これらもバイナリに含める場合は下記のようにコードを修正します:

- assets/assets.goを下記で新規作成

```go
package assets

import "embed"

//go:embed static/*
var Static embed.FS // static埋め込み宣言

//go:embed templates/*
var Templates embed.FS // templates埋め込み宣言
```

- router/base.goについて、埋め込んだstaticを使うよう宣言

```go
	staticFiles, err := fs.Sub(assets.Static, "static")
	if err != nil {
		log.Fatalf("Failed to create sub filesystem: %v", err)
	}
	m.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.FS(staticFiles))))
```

- handler/users_handler.goについて、埋め込んだtemplatesを使うよう宣言

```go
	tmpl, err := template.ParseFS(assets.Templates, "templates/index.html")
	if err != nil {
		http.Error(w, "Template parsing error", http.StatusInternalServerError)
		return
	}
```
