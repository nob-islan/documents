# CORS 設定

React など、別オリジンから API を呼び出す際の設定例です。

- 各エンドポイントに対し、下記関数を呼び出して

  1. CORS 設定
  1. 本来のルーティング設定

  を行います。

```go
// CORSを設定しつつルーティング設定を行います。
func corsHandleFunc(
	m *http.ServeMux,
	pattern string,
	handler func(http.ResponseWriter, *http.Request),
) {
	m.HandleFunc(pattern, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		handler(w, r)
	})
}
```

- 下記の要領でルーティング設定を行います:

```go
// 各エンドポイントのルーティング設定を行います。
func Routing() *http.ServeMux {

	// 各ハンドラに紐づくルーティングを設定
	m := http.NewServeMux()

	// First
	firstHandler := handler.NewFirstHandler()
	corsHandleFunc(m, "/first", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			firstHandler.First(w, r)
		}
	})

	// Second
	secondHandler := handler.NewSecondHandler()
	corsHandleFunc(m, "/second", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			secondHandler.Second(w, r)
		}
	})

	return m
}
```
