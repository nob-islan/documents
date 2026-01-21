# 標準ライブラリでhttpリクエストのハンドリングを実装

Go言語にて、標準ライブラリでのhttpリクエストハンドリングを実装します。

## サンプルコード

### `http.HandleFunc`を直接使用

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func main() {

	// エンドポイントのルーティング
	http.HandleFunc("/user", getUserinfo)

	// サーバーの起動
	fmt.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// ユーザ情報
type userinfo struct {
	Id   int    // ID
	Name string // 名前
	Age  int    // 年齢
}

// ユーザ情報を取得します。
func getUserinfo(w http.ResponseWriter, r *http.Request) {

	// 戻りのデータ作成（本来はusecaseで行う）
	var userinfos []userinfo
	userinfos = append(
		userinfos,
		userinfo{
			Id:   1,
			Name: "nob",
			Age:  13,
		},
		userinfo{
			Id:   2,
			Name: "nob2",
			Age:  706,
		},
	)

	// レスポンス作成
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(userinfos)
}
```

### ServeMuxを使用

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func main() {

	// 各handlerに紐づくルーティングを設定
	m := http.NewServeMux()

	// カスタムルータ
	m.HandleFunc("/user", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			getUserinfo(w, r)
		case http.MethodPost:
			registUserinfo(w, r)
		}
	})

	// サーバーの起動
	fmt.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", m))
}

// ユーザ情報を取得します。
func getUserinfo(w http.ResponseWriter, r *http.Request) {

	// クエリパラメータ取得
	q := r.URL.Query().Get("username")

	// 業務処理実行（擬似APIなのでuserinfoを作成するのみ）
	u := Userinfo{
		Id:   706,
		Name: q,
		Age:  13,
	}

	// レスポンス作成
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(u)
}

// ユーザ情報のドメイン構造体です。
type Userinfo struct {
	Id   int    `json:"id"`   // 管理ID
	Name string `json:"name"` // 名前
	Age  int    `json:"age"`  // 年齢
}

// ユーザ情報を取得します。
func registUserinfo(w http.ResponseWriter, r *http.Request) {

	// リクエストボディ解析
	var req RegistReq
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	// 業務処理実行（擬似APIなのでresを作成するのみ）
	res := RegistRes{
		Message: "success",
	}

	// レスポンス作成
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

type (
	// registUserinfoのリクエストボディ
	RegistReq struct {
		Name string `json:"name"` // 名前
		Age  int    `json:"age"`  // 年齢
	}

	// registUserinfoのレスポンスボディ
	RegistRes struct {
		Message string `json:"message"` // 登録成否
	}
)
```

下記のようにリクエストに対しレスポンスが得られます:

```
$ curl -X GET localhost:8080/user?username=nob
{"id":706,"name":"nob","age":13}

$ curl -X POST -H "Content-Type: application/json" -d '{"name": "nob", "age": 13}' localhost:8080/user
{"message":"success"}
```
