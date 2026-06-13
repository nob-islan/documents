# SQLiteを使ってアプリを起動

[SQLite](https://sqlite.org/)を使ってインメモリデータベースをデータストアとするGoアプリを起動します。

## 事前準備

SQLiteをインストールします。

```shell
go get github.com/mattn/go-sqlite3
```

## 実装

### `internal/infrastructure/`

- `db.go`

```go
package infrastructure

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

// データベースに接続します。
func ConnectDB() *sql.DB {

	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		log.Fatalf("failed to open in-memory db: %v", err)
	}

	// schema.sqlを読み込み・実行
	schema, err := os.ReadFile("internal/infrastructure/sqlite/schema.sql")
	if err != nil {
		log.Fatalf("failed to read schema: %v", err)
	}
	_, err = db.Exec(string(schema))
	if err != nil {
		log.Fatalf("failed to execute schema: %v", err)
	}

	// data.sqlを読み込み・実行
	data, err := os.ReadFile("internal/infrastructure/sqlite/data.sql")
	if err != nil {
		log.Fatalf("failed to read data: %v", err)
	}
	_, err = db.Exec(string(data))
	if err != nil {
		log.Fatalf("failed to execute data: %v", err)
	}

	// 実際に接続できるかを確認
	err = db.Ping()
	if err != nil {
		log.Fatal("Fail to connect to Database")
	}

	return db
}
```

### `internal/infrastructure/sqlite/`

- `schema.sql`

```sql
-- 一部SQLite特有の記法が必要なため注意 see; https://www.sqlite.org/docs.html
CREATE TABLE IF NOT EXISTS users(
    name VARCHAR(8) PRIMARY KEY
    , password VARCHAR(32)
    , age INT
);
```

- `data.sql`

```sql
INSERT INTO users (
    name
    , password
    , age
) VALUES (
    'nob'
    , 'passwd'
    , 13
);
```
