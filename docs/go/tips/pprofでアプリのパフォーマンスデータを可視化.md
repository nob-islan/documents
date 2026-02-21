# pprofでアプリのパフォーマンスデータを可視化

cf. https://pkg.go.dev/net/http/pprof

## 事前準備

- `main.go`に下記を追加します:

```go
import _ "net/http/pprof"
```

```go
func main() {

	go func() {
		http.ListenAndServe("localhost:6060", nil)
	}()

    // 通常のアプリ起動処理
}
```

- 必要なパッケージをインストールします:

```shell
sudo apt update
sudo apt install -y graphviz
```

## 利用方法

例として、CPU利用率を確認したい場合:

```shell
# ブラウザが自動で起動し、8081ポートでプロファイル情報が公開されます。
go tool pprof -http=:8081 http://localhost:6060/debug/pprof/profile
```
