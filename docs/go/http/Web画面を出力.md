# Web 画面を出力

`html/template`を使って html コンテンツを返却する Go アプリを作成します。

## ディレクトリ構成

```shell
.
├── go.mod
├── main.go
├── static
│   ├── favicon.ico
│   ├── index.js
│   └── style.css
└── templates
    └── index.html
```

## サンプルコード

擬似的なログイン画面を実装します。

### 設計

- ログイン画面表示時に、ボタン名を go から html に渡す
- ボタン入力時に js から go の関数を呼び出し、API をコール
- 結果を alert 表示

### 実装

- index.html

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

- index.js

```js
function handleOnclickButton() {
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;
  fetch("/message", {
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
      alert(data.ret);
    })
    .catch((error) => {
      console.error("エラーが発生しました:", error);
    });
}
```

- style.css

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

- main.go

```go
package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
)

func main() {

	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.HandleFunc("/", initial)
	http.HandleFunc("/message", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			registMessage(w, r)
		default:
			http.Error(w, "Forbidden", http.StatusForbidden)
		}
	})

	fmt.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// 初期表示処理を行います。
func initial(w http.ResponseWriter, r *http.Request) {

	tmpl, err := template.ParseFiles("templates/index.html")
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

// 入力値を登録します。
func registMessage(w http.ResponseWriter, r *http.Request) {

	var req Request
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	res := Response{Ret: "Hello, " + req.Name}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

// 入力値登録リクエストモデル
type Request struct {
	Name     string `json:"name"`     // ユーザ名
	Password string `json:"password"` // パスワード
}

// 入力値登録レスポンスモデル
type Response struct {
	Ret string `json:"ret"` // 出力メッセージ
}
```

## 静的コンテンツをバイナリに含める

上記のコードでは`go build`で作成したバイナリファイルに html などのコンテンツは含まれません。これらもバイナリに含める場合は下記のようにコードを修正します:

```go
package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"io/fs"
	"log"
	"net/http"
)

//go:embed static/*
var static embed.FS // static埋め込み宣言

//go:embed templates/*
var templates embed.FS // templates埋め込み宣言

func main() {

	staticFiles, err := fs.Sub(static, "static") // 埋め込んだstaticを使う
	if err != nil {
		log.Fatalf("Failed to create sub filesystem: %v", err)
	}
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.FS(staticFiles))))
	http.HandleFunc("/", initial)
	http.HandleFunc("/message", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			registMessage(w, r)
		default:
			http.Error(w, "Forbidden", http.StatusForbidden)
		}
	})

	fmt.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// 初期表示処理を行います。
func initial(w http.ResponseWriter, r *http.Request) {

	tmpl, err := template.ParseFS(templates, "templates/index.html") // 埋め込んだtemplatesを使う
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

// 入力値を登録します。
func registMessage(w http.ResponseWriter, r *http.Request) {

	var req Request
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	res := Response{Ret: "Hello, " + req.Name}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

// 入力値登録リクエストモデル
type Request struct {
	Name     string `json:"name"`     // ユーザ名
	Password string `json:"password"` // パスワード
}

// 入力値登録レスポンスモデル
type Response struct {
	Ret string `json:"ret"` // 出力メッセージ
}
```
