# はじめてのWebSocket

[Gorilla WebSocket](https://github.com/gorilla/websocket/)を使ってWebSocket接続を実装します。

## 事前準備

パッケージをインストールします:

```shell
go get github.com/gorilla/websocket
```

## 実装

### サーバ

データを配信する側の実装です。接続してきたクライアントに対し、定期的にテキストメッセージを送信します:

```go
package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

func main() {
	http.HandleFunc("/echo", echo)
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func echo(w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{}

	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}
	log.Printf("client connected: %s", r.RemoteAddr)
	defer c.Close()

	for {
		err := c.WriteMessage(websocket.TextMessage, []byte(time.Now().String()))
		if err != nil {
			log.Println("write:", err)
			return
		}

		time.Sleep(time.Second)
	}
}
```

### クライアント

クライアント側の実装です。サーバから受け取ったメッセージを標準出力します。

```go
package main

import (
	"log"
	"net/url"

	"github.com/gorilla/websocket"
)

func main() {
	u := url.URL{Scheme: "ws", Host: "localhost:8080", Path: "/echo"}

	log.Printf("connecting to %s", u.String())

	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatal("dial:", err)
	}
	defer c.Close()

	for {
		_, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			return
		}

		log.Printf("recv: %s", message)
	}
}
```
