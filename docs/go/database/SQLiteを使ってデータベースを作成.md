# SQLiteを使ってデータベースを作成

[SQLite](https://sqlite.org/)を使ってインメモリデータベースをデータストアとするGoアプリを起動します。

## 事前準備

SQLiteをインストールします。

```shell
go get modernc.org/sqlite
```

## 実装

### `internal/infrastructure/`

- `db.go`

```go
package infrastructure

import (
	"database/sql"
	"easyapp/internal/infrastructure/sqlite"
	"log"

	_ "modernc.org/sqlite"
)

// データベースに接続します。
func ConnectDB() *sql.DB {

	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		log.Fatalf("failed to open in-memory db: %v", err)
	}

	// schema.sqlを読み込み・実行
	_, err = db.Exec(sqlite.SchemaSql)
	if err != nil {
		log.Fatalf("failed to execute schema: %v", err)
	}

	// data.sqlを読み込み・実行
	_, err = db.Exec(sqlite.DataSql)
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

- `sqlite.go`

```go
package sqlite

import _ "embed"

//go:embed schema.sql
var SchemaSql string

//go:embed data.sql
var DataSql string
```

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
