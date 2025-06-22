# Squirrel でデータベースに接続

SQL クエリを構築するライブラリ **Squirrel** を使ってデータベースにアクセスします。標準ライブラリより動的で柔軟な SQL 構築が可能です。

cf. https://github.com/Masterminds/squirrel

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

### データベース接続関数

```go
// データベース接続用の関数です。
func connectDB() (*sql.DB, error) {

	const (
		user     = "root"           // データベースのユーザ名
		password = "password"       // データベースのパスワード
		host     = "localhost:3306" // データベースのホスト
		database = "snaildb"        // データベース名
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
```

### サンプル repository

```go
package repository

import (
	"database/sql"

	sq "github.com/Masterminds/squirrel"
	_ "github.com/go-sql-driver/mysql"
)

// usersテーブルのエンティティ構造体です。
type Users struct {
	UserId   string // 管理ID
	Username string // ユーザ名
	Age      string // 年齢
	Remarks  string // 備考
}

// サンプルrepositoryのインターフェースです。
type SampleRepository interface {
	FindByUsername(username string) []Users
	Insert(u Users)
}

// サンプルrepositoryの構造体です。
type sampleRepository struct {
	db *sql.DB
}

// SampleRepositoryのコンストラクタです。
func NewSampleRepository(db *sql.DB) SampleRepository {
	return &sampleRepository{db: db}
}

// ユーザ名をキーとしてデータベースからユーザ情報を検索します。
func (r *sampleRepository) FindByUsername(username string) []Users {

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
	rows, err := r.db.Query(query, args...)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	// 検索結果をマッピング
	var usersList []Users
	for rows.Next() {
		var userId, username, age, remarks string
		if err := rows.Scan(&userId, &username, &age, &remarks); err != nil {
			panic(err)
		}
		usersList = append(
			usersList,
			Users{
				UserId:   userId,
				Username: username,
				Age:      age,
				Remarks:  remarks,
			},
		)
	}

	return usersList
}

// ユーザ情報を登録します。
func (r *sampleRepository) Insert(u Users) {

	// クエリ作成
	builder := sq.
		Insert("users").
		Columns("username", "age", "remarks").
		Values(u.Username, u.Age, u.Remarks)
	query, args, err := builder.ToSql()
	if err != nil {
		panic(err)
	}

	_, err = r.db.Exec(query, args...)
	if err != nil {
		panic(err)
	}
}
```
