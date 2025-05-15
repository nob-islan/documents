# Web 画面を出力

`html/template`を使って html コンテンツを返却する Go アプリを作成します。

## ディレクトリ構成

```shell
.
├── cmd
│   └── main.go    # メインクラス
└── templates
    └── index.html # htmlコンテンツ
```

## サンプルコード

- index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>{{ .Title }}</title>
  </head>
  <body>
    <h1>{{ .Message }}</h1>
  </body>
</html>
```

- main.go

```go
package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/", handler)
	fmt.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// サンプル画面のハンドラです。
func handler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/index.html")
	if err != nil {
		http.Error(w, "Template parsing error", http.StatusInternalServerError)
		return
	}

	data := PageData{
		Title:   "Go Web App",
		Message: "こんにちは、Goのテンプレート!",
	}

	err = tmpl.Execute(w, data)
	if err != nil {
		http.Error(w, "Template execution error", http.StatusInternalServerError)
	}
}

// サンプルページのデータ構造体です。
type PageData struct {
	Title   string
	Message string
}
```
