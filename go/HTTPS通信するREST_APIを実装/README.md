# HTTPS 通信する REST API を実装

証明書を用意して https 通信を行える REST API を実装します。

## 実装手順

- 証明書を用意します:

```shell
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

- 下記の要領でコードを作成します:

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

	// サーバーの起動
	fmt.Println("Server started at https://localhost:443")
	// main.goまたはビルドしたモジュールから見た相対パスにある鍵ファイルを指定
	log.Fatal(http.ListenAndServeTLS(":443", "ssl/cert.pem", "ssl/key.pem", nil))
}

// ユーザ情報を取得します。
func getUserInfo(w http.ResponseWriter, r *http.Request) {

	// 戻りのデータ作成
	var userInfos []userInfo
	userInfos = append(
		userInfos,
		userInfo{
			Id:   1,
			Name: "nob",
			Age:  13,
		},
		userInfo{
			Id:   2,
			Name: "nob2",
			Age:  706,
		},
	)

	// レスポンス作成
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(userInfos)
}

// ユーザ情報
type userInfo struct {
	Id   int    // ID
	Name string // 名前
	Age  int    // 年齢
}
```

- `go run main.go`またはビルドしたモジュールでアプリ起動後、https に向けて curl を実行できます:

```shell
# 自己証明書を使う場合はSSLの検証に引っかかる可能性があるので -k オプションで回避しています。
# devcontainerで起動したアプリに対し、ホストOSのブラウザからであれば疎通が取れました。
curl -k https://localhost:443/user
```
