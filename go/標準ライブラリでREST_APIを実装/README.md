# 標準ライブラリで REST API を実装

Go 言語にて、標準ライブラリを実装します。

## サンプルコード

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
	http.HandleFunc("/user", getUserInfo)
	http.HandleFunc("/user/regist", postUserInfo)

	// サーバーの起動
	fmt.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// ユーザ情報を取得します。
func getUserInfo(w http.ResponseWriter, r *http.Request) {

	// 戻りのデータ作成（本来はusecaseで行う）
	var userInfos []userInfo
	userInfos = append(userInfos, userInfo{Id: 1, Name: "nob", Age: 13}, userInfo{Id: 2, Name: "nob2", Age: 706})

	// レスポンス作成
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(userInfos)
}

// ユーザ情報を登録します。
func postUserInfo(w http.ResponseWriter, r *http.Request) {

	// リクエストボディをデコード
	var u userInfo
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&u); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// データを登録（本来はusecaseで行う 今回はPrintのみ）
	fmt.Printf("Request body; id: %d, name: %s, age: %d", u.Id, u.Name, u.Age)

	// レスポンス作成
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(u)
}

// ユーザ情報
type userInfo struct {
	Id   int    // ID
	Name string // 名前
	Age  int    // 年齢
}
```
