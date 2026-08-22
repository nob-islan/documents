# Squirrelでデータベースに接続

SQLクエリを構築するライブラリ **Squirrel** を使ってデータベースにアクセスします。標準ライブラリより動的で柔軟なSQL構築が可能です。

cf. https://github.com/Masterminds/squirrel

## 事前準備

### データベース構築

```sql
-- データベース作成
CREATE DATABASE eadb;

-- テーブル作成
CREATE TABLE eadb.users(
    user_id int PRIMARY KEY AUTO_INCREMENT
    , username VARCHAR(20) NOT NULL
    , age int NOT NULL
    , remarks TEXT
);

-- テストデータ
INSERT INTO eadb.users(
    username
    , age
    , remarks
) VALUES (
    "nob"
    , 13
    , "This is a test data"
);

CREATE USER eadbuser;

GRANT ALL ON eadb.* TO eadbuser@'%' IDENTIFIED BY 'eadbpass';
```

### ライブラリインストール

```shell
go get github.com/Masterminds/squirrel
go get github.com/go-sql-driver/mysql
```

## サンプルコード

```go
package main

import (
	"database/sql"
	"fmt"
	"log"

	sq "github.com/Masterminds/squirrel"
	_ "github.com/go-sql-driver/mysql"
)

func main() {
	// DB接続
	db, err := connectDB()
	if err != nil {
		log.Fatal("DB access failed")
	}

	// ユーザ登録実行
	insert(db, users{username: "nob", age: 13, remarks: "test insert data"})

	// ユーザ検索実行
	fmt.Println(findByUsername(db, "nob"))
}

// データベース接続用の関数です。
func connectDB() (*sql.DB, error) {

	const (
		user     = "eadbuser"       // データベースのユーザ名
		password = "eadbpass"       // データベースのパスワード
		host     = "localhost:3306" // データベースのホスト
		database = "eadb"           // データベース名
	)

	// データベース接続
	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s", user, password, host, database)
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

// ユーザ情報を登録します。
func insert(db *sql.DB, u users) {

	// クエリ作成
	builder := sq.
		Insert("users").
		Columns("username", "age", "remarks").
		Values(u.username, u.age, u.remarks)
	query, args, err := builder.ToSql()
	if err != nil {
		panic(err)
	}

	_, err = db.Exec(query, args...)
	if err != nil {
		panic(err)
	}
}

// ユーザ名をキーとしてデータベースからユーザ情報を検索します。
func findByUsername(db *sql.DB, username string) []users {

	// クエリ作成
	builder := sq.Select("*").From("users")
	if username != "" {
		builder = builder.Where(sq.Eq{"username": username})
	}
	query, args, err := builder.ToSql()
	if err != nil {
		panic(err)
	}

	// クエリ実行
	rows, err := db.Query(query, args...)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	// 検索結果をマッピング
	var usersList []users
	for rows.Next() {
		var userId string
		var username string
		var age int
		var remarks string
		if err := rows.Scan(&userId, &username, &age, &remarks); err != nil {
			panic(err)
		}
		usersList = append(
			usersList,
			users{
				userId:   userId,
				username: username,
				age:      age,
				remarks:  remarks,
			},
		)
	}

	if err := rows.Err(); err != nil {
		panic(err)
	}

	return usersList
}

// ユーザ情報ドメインです。
type users struct {
	userId   string // 管理ID
	username string // ユーザ名
	age      int    // 年齢
	remarks  string // 備考
}
```
