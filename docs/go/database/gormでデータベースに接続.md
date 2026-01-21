# gormでデータベースに接続

ORMライブラリ[gorm](https://gorm.io/docs/)を使ってデータベースを操作します。

## 事前準備

データベースはMySQLを使うこととします。ライブラリをインストールします:

```shell
go get -u gorm.io/gorm
go get -u gorm.io/driver/mysql
```

## 実装例

CRUD操作の実装例を記載します。

### データベース構築

下記docker-composeで構築されたデータベースを操作します:

#### `docker-compose.yaml`

```yaml
services:
  eadb:
    image: mariadb:latest
    container_name: eadb
    ports:
      - 3306:3306
    volumes:
      - ./volumes/initdb.d:/docker-entrypoint-initdb.d
    environment:
      - MYSQL_ROOT_PASSWORD=password
```

#### `initdb.d/create-database.sql`

```sql
CREATE DATABASE eadb;
USE eadb;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT
    , name VARCHAR(8)
    , age INT
);

INSERT INTO users (
    name
    , age
) VALUES (
    'nob'
    , 13
);
```

### アプリ実装

```go
package main

import (
	"context"
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {

	// データベース接続
	const (
		user     string = "root"
		password string = "password"
		domain   string = "localhost:3306"
		dbName   string = "eadb"
	)
	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s", user, password, domain, dbName)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Println(err)
	}

	ctx := context.Background()

	// Select
	users, err := gorm.G[Users](db).Where("name = ?", "nob").First(ctx)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(users)

	// Update
	if _, err = gorm.G[Users](db).Where("name = ?", "nob").Update(ctx, "age", 706); err != nil {
		fmt.Println(err)
	}

	// Insert
	if err = gorm.G[Users](db).Create(ctx, &Users{Id: 0, Name: "nob2", Age: 13}); err != nil {
		fmt.Println(err)
	}

	// Select all
	var usersList []Users
	result := db.Find(&usersList)
	if result.Error != nil {
		fmt.Println(result.Error)
	}
	fmt.Println(usersList)

	// Delete
	if _, err = gorm.G[Users](db).Where("name = ?", "nob2").Delete(ctx); err != nil {
		fmt.Println(err)
	}
}

// usersテーブル向けのエンティティ構造体です。
type Users struct {
	Id   int    `gorm:"primaryKey"` // 管理ID
	Name string                     // ユーザ名
	Age  int                        // 年齢
}
```
