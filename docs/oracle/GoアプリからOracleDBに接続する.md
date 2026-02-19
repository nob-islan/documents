# GoアプリからOracleDBに接続する

Oracleドライバを使ってOracleDBに接続する設定です。

## 設定

cf. https://docs.oracle.com/en-us/iaas/autonomous-database-serverless/doc/cdw-connect-go-install-go-and-godror.html

- Goドライバをインストールします:

```shell
go get github.com/godror/godror
```

- [ODPI-C](https://oracle.github.io/odpi/)をインストールします。

## 実装

### テーブル定義

- あらかじめ`snaildb`スキーマを用意し、下記でテーブルを作成します:

```sql
CREATE TABLE users(
    id NUMBER GENERATED ALWAYS AS IDENTITY
    , name VARCHAR2(20) NOT NULL
    , age NUMBER NOT NULL
    , PRIMARY KEY (id)
);
```

- 下記でアプリを実装します:

```go
package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/godror/godror"
)

func main() {
	// DB接続
	db, err := connectDB()
	if err != nil {
		log.Fatal("DB access failed")
	}

	// ユーザ登録実行
	insert(db, users{name: "nob", age: 13})

	// 複数ユーザ検索実行
	fmt.Println(findByAge(db))

	// 単一ユーザ検索実行
	fmt.Println(findById(db))
}

// データベースに接続します。
func connectDB() (*sql.DB, error) {

	dsn := `user="snaildb" password="snaildbpass" connectString="localhost:1521/nobpdb"`
	db, err := sql.Open("godror", dsn)
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

// ユーザを登録します。
func insert(db *sql.DB, u users) {

	// クエリ実行
	_, err := db.Exec("INSERT INTO users (name, age) VALUES (:name, :age)", u.name, u.age)
	if err != nil {
		log.Fatal(err)
	}
}

// 30歳未満のユーザ（複数）を検索します。
func findByAge(db *sql.DB) []users {

	rows, err := db.Query("SELECT * FROM users WHERE age < :age", 30) // 30歳未満を抽出
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var usersList []users
	for rows.Next() {
		var id int
		var name string
		var age int
		if err := rows.Scan(&id, &name, &age); err != nil {
			log.Fatal(err)
		}
		u := users{id: id, name: name, age: age}
		usersList = append(usersList, u)
	}

	return usersList
}

// ID=1のユーザ（単一）を検索します。
func findById(db *sql.DB) users {

	row := db.QueryRow("SELECT * FROM users WHERE id = :id", 1) // ID=1を抽出
	var id int
	var name string
	var age int
	row.Scan(&id, &name, &age)

	return users{id, name, age}
}

// usersテーブル向けのモデルです。
type users struct {
	id   int    // ID
	name string // 名前
	age  int    // 年齢
}
```
