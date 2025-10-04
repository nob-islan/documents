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

### 設計

下記処理を行います:

- http://localhost:8080 アクセス時に、go 側で Message に値を詰めて画面を表示
- ボタン押下時に js から go の関数を呼び出し、レスポンスの値で html コンテンツを差し替え

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
    <h1 id="message">{{ .Message }}</h1>
    <button onclick="handleOnclickButton()">押してください</button>

    <script src="static/index.js"></script>
  </body>
</html>
```

- index.js

```js
console.log("js is effective!");

function handleOnclickButton() {
  fetch("/message", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("message").textContent = data.message;
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
	http.HandleFunc("/message", getMessage)

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

	initView := view{Message: "Push button"}

	err = tmpl.Execute(w, initView)
	if err != nil {
		http.Error(w, "Template execution error", http.StatusInternalServerError)
	}
}

// 画面表示用のメッセージを取得します。
func getMessage(w http.ResponseWriter, r *http.Request) {

	// メッセージ作成
	view := view{Message: "Hello, go web!"}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(view)
}

// 画面表示向けのデータを格納する構造体です。
type view struct {
	Message string `json:"message"`
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

	staticFiles, err := fs.Sub(static, "static") // 埋め込んだstaticを使うようにする
	if err != nil {
		log.Fatalf("Failed to create sub filesystem: %v", err)
	}
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.FS(staticFiles))))
	http.HandleFunc("/", initial)
	http.HandleFunc("/message", getMessage)

	fmt.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// 初期表示処理を行います。
func initial(w http.ResponseWriter, r *http.Request) {

	tmpl, err := template.ParseFS(templates, "templates/index.html") // 埋め込んだtemplatesを使うようにする
	if err != nil {
		http.Error(w, "Template parsing error", http.StatusInternalServerError)
		return
	}

	initView := view{Message: "Push button"}

	err = tmpl.Execute(w, initView)
	if err != nil {
		http.Error(w, "Template execution error", http.StatusInternalServerError)
	}
}

// 画面表示用のメッセージを取得します。
func getMessage(w http.ResponseWriter, r *http.Request) {

	// メッセージ作成
	view := view{Message: "Hello, go web!"}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(view)
}

// 画面表示向けのデータを格納する構造体です。
type view struct {
	Message string `json:"message"`
}
```
