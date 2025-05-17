# Squirrel でデータベースに接続

SQL クエリを構築するライブラリ **Squirrel** を使ってデータベースにアクセスします。標準ライブラリより動的で柔軟な SQL 構築が可能です。

## 事前準備

### データベース構築

```sql
-- データベース作成
CREATE DATABASE snaildb;

USE snaildb;

-- テーブル作成
CREATE TABLE users(
    user_id int PRIMARY KEY AUTO_INCREMENT
    , user_name VARCHAR(20) NOT NULL
    , age int NOT NULL
    , remarks TEXT
);

-- テストデータ1
INSERT INTO users(
    user_name
    , age
    , remarks
) VALUES (
    "nob"
    , 13
    , "This is a test data"
);

-- テストデータ2
INSERT INTO users(
    user_name
    , age
    , remarks
) VALUES (
    "nob2"
    , 706
    , "This is a second data"
);
```

### ライブラリインストール

```shell
go get github.com/Masterminds/squirrel
go get github.com/go-sql-driver/mysql
```

## サンプルコード

### select サンプル

```go
package main

import (
	"database/sql"
	"fmt"

	sq "github.com/Masterminds/squirrel"
	_ "github.com/go-sql-driver/mysql"
)

func main() {

	// データベースに接続
	dsn := "root:password@tcp(localhost:3306)/snaildb"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	// クエリ作成
	builder := sq.Select("*").From("users")
    // name := nob
	// if name != "" {
	// 	builder = builder.Where(sq.Eq{"user_name": name}) // 必要に応じてwhere区の追加などができます
	// }
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
	for rows.Next() {
		var userId, userName, age, remarks string
		if err := rows.Scan(&userId, &userName, &age, &remarks); err != nil {
			panic(err)
		}
		fmt.Printf("%s, %s, %s, %s\n", userId, userName, age, remarks)
	}
}
```

### insert サンプル

```go
package main

import (
	"database/sql"

	sq "github.com/Masterminds/squirrel"
	_ "github.com/go-sql-driver/mysql"
)

func main() {

	// データベースに接続
	dsn := "root:password@tcp(localhost:3306)/snaildb"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	// クエリ作成
	builder := sq.
		Insert("users").
		Columns("user_name", "age", "remarks").
		Values("nob3", "99", "This is a insert test")
	query, args, err := builder.ToSql()
	if err != nil {
		panic(err)
	}

	_, err = db.Exec(query, args...)
	if err != nil {
		panic(err)
	}
}
```
