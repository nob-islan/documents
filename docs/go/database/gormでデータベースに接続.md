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

#### `volumes/initdb.d/create-database.sql`

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
		panic(err)
	}

	ctx := context.Background()

	// Select cf. https://gorm.io/docs/query.html
	users, err := gorm.G[User](db).Where("name = ?", "nob").First(ctx)
	if err != nil {
		panic(err)
	}
	fmt.Println(users)

	// Update cf. https://gorm.io/docs/update.html
	if _, err = gorm.G[User](db).Where(
		"name = ?",
		users.Name,
	).Updates(
		ctx,
		User{Age: 706},
	); err != nil {
		panic(err)
	}

	// Insert cf. https://gorm.io/docs/create.html
	if err = gorm.G[User](db).Create(ctx, &User{Name: "nob2", Age: 13}); err != nil {
		panic(err)
	}

	// Select all cf. https://gorm.io/docs/query.html#Selecting-Specific-Fields
	var usersList []User
	result := db.Find(&usersList)
	if result.Error != nil {
		panic(result.Error)
	}
	fmt.Println(usersList)

	// Delete cf. https://gorm.io/docs/delete.html
	if _, err = gorm.G[User](db).Where("name = ?", "nob2").Delete(ctx); err != nil {
		panic(err)
	}
}

// usersテーブル向けのエンティティ構造体です。
type User struct {
	Id   int    `gorm:"primaryKey"` // 管理ID
	Name string // ユーザ名
	Age  int    // 年齢
}
```
