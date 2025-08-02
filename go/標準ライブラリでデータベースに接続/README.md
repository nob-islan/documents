# 標準ライブラリでデータベースに接続

データベース（今回は MariaDB）に接続します。

## 事前準備

MariaDB 向けの Go ドライバをインストールします:

```shell
go get -u github.com/go-sql-driver/mysql
```

## サンプルコード

```go
package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	// DB接続
	db, err := connectDB()
	if err != nil {
		log.Fatal("DB access failed")
	}

	// サンプルクエリ実行
	queryData(db)
}

// データベースに接続します。
func connectDB() (*sql.DB, error) {

	// ユーザー名:パスワード@tcp(ホスト:ポート)/データベース名
	dsn := "root:password@tcp(localhost:3306)/snaildb"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	// 実際に接続できるかを確認
	err = db.Ping()
	if err != nil {
		return nil, err
	}

	return db, nil
}

// クエリを実行します。
func queryData(db *sql.DB) {

	rows, err := db.Query("SELECT * FROM user_info WHERE age < ?", 30) // 30歳未満を抽出
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		var name string
		var age int
		if err := rows.Scan(&id, &name, &age); err != nil {
			log.Fatal(err)
		}
		u := userinfo{Id: id, Name: name, Age: age}
		fmt.Println(u)
	}
}

// user_infoテーブル向けのモデルです。
type userinfo struct {
	Id   int    // ID
	Name string // 名前
	Age  int    // 年齢
}

// user_infoのデータ出力用の関数です。
func (u userinfo) String() string {
	return fmt.Sprintf("Id: %d, Name: %s, Age: %d", u.Id, u.Name, u.Age)
}
```

下記のように実行結果が得られます:

```
$ go run main.go
Id: 1, Name: nob, Age: 13
Id: 2, Name: nob2, Age: 7
```
