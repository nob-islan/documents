# Go REST APIプロジェクトセットアップ

## プロジェクト作成

- 下記コマンドでGoモジュールを初期化します。

```shell
go mod init easyapp
```

- mysql向けのドライバをインストールします。

```shell
go get github.com/go-sql-driver/mysql
```

## 実装

サンプルコードを掲載します。ここでは擬似的なログインAPIを実装します。

### 事前準備

データベースをdockerで構築します。

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
    name VARCHAR(8) PRIMARY KEY
    , password VARCHAR(32) NOT NULL
    , age INT NOT NULL
);

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

### パッケージ構成

```shell
.
├── cmd
│   └── main.go                      # アプリのエントリポイント
└── internal
    ├── domain
    │   ├── query
    │   │   └── users_query.go       # ドメイン取得時のクエリ構造体
    │   └── users.go                 # ドメイン定義およびrepositoryのインターフェース
    ├── handler
    │   ├── model
    │   │   └── users_model.go       # APIのリクエスト・レスポンス構造体
    │   ├── router
    │   │   ├── base.go              # エンドポイントのルーター統括
    │   │   └── users_router.go      # 業務処理ごとのルーター
    │   └── users_handler.go         # APIとしてのインターフェースおよび実装
    ├── infrastructure
    │   ├── db.go                    # データベース接続設定
    │   ├── persistence
    │   │   ├── table
    │   │   │   └── users_row.go     # テーブル定義に対応した構造体
    │   │   └── users_sql.go         # ドメイン操作のためのSQL定義
    │   └── repository
    │       └── users_repository.go  # データベース操作の統括
    └── usecase
        ├── params
        │   └── users_params.go      # 業務処理の入力・出力モデル構造体
        └── users_usecase.go         # 業務処理のインターフェースおよび実装
```

### パッケージ一覧

#### `internal/domain/`

業務処理の中心となるドメインおよびそれをデータベースから取得するrepositoryのインターフェースを定義します。

- `users.go`

```go
package domain

import "easyapp/internal/domain/query"

// ユーザ情報ドメインです。
type Users struct {
	name     string // ユーザ名
	password string // パスワード
	age      int    // 年齢
}

func NewUsers(name string, password string, age int) Users {
	return Users{name: name, password: password, age: age}
}

func (u Users) Name() string {
	return u.name
}

func (u Users) Password() string {
	return u.password
}

func (u Users) Age() int {
	return u.age
}

// ユーザ情報ドメイン向けrepositoryのインターフェースです。
type UsersRepository interface {

	// ユーザ情報を取得します。
	FindByName(q query.FindByNameQuery) Users
}
```

#### `internal/domain/query`

ドメイン取得時の検索条件を定める構造体を定義します。

- `users_query.go`

```go
package query

// ユーザ情報取得時のクエリです。
type FindByNameQuery struct {
	name string // 名前
}

func NewFindByNameQuery(name string) FindByNameQuery {
	return FindByNameQuery{name: name}
}

func (q FindByNameQuery) Name() string {
	return q.name
}
```

#### `internal/infrastructure/`

データベースへの接続設定を記載します。

- `db.go`

```go
package infrastructure

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

// データベースに接続します。
func ConnectDB() *sql.DB {

	const (
		user       string = "root"
		password   string = "password"
		domain     string = "localhost:3306"
		dbName     string = "eadb"
		driverName string = "mysql"
	)

	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s", user, password, domain, dbName)
	db, err := sql.Open(driverName, dsn)
	if err != nil {
		log.Fatal("Fail to connect to Database")
	}

	// 実際に接続できるかを確認
	err = db.Ping()
	if err != nil {
		log.Fatal("Fail to connect to Database")
	}

	return db
}
```

#### `internal/infrastructure/persistence/`

データベースを操作するためのクエリ発行処理を実装します。

- `users_sql.go`

```go
package persistence

import (
	"database/sql"
	"easyapp/internal/infrastructure/persistence/table"
)

type UsersSql interface {

	// ユーザ情報取得SQLを発行します。
	FindByName(targetName string) table.Users
}

type usersSql struct {
	db *sql.DB
}

func NewUsersSql(db *sql.DB) UsersSql {
	return &usersSql{db: db}
}

func (s *usersSql) FindByName(targetName string) table.Users {

	const sql string = "SELECT * FROM users WHERE name = ?"

	// クエリ実行
	row := s.db.QueryRow(sql, targetName)

	var name string
	var password string
	var age int
	row.Scan(&name, &password, &age)

	return table.Users{Name: name, Password: password, Age: age}
}
```

#### `internal/infrastructure/persistence/table`

データベースのテーブル定義に対応する構造体を宣言します。

- `users_row.go`

```go
package table

// usersテーブルのrow定義です。
type Users struct {
	Name     string // ユーザ名
	Password string // パスワード
	Age      int    // 年齢
}
```

#### `internal/infrastructure/repository/`

persistenceを呼び出してドメイン・テーブル間のデータをやり取りします。

- `users_repository.go`

```go
package repository

import (
	"easyapp/internal/domain"
	"easyapp/internal/domain/query"
	"easyapp/internal/infrastructure/persistence"
)

type usersRepository struct {
	usersSql persistence.UsersSql
}

func NewUsersRepository(usersSql persistence.UsersSql) domain.UsersRepository {
	return &usersRepository{usersSql: usersSql}
}

func (r *usersRepository) FindByName(q query.FindByNameQuery) domain.Users {

	u := r.usersSql.FindByName(q.Name())

	return domain.NewUsers(u.Name, u.Password, u.Age)
}
```

#### `internal/usecase/`

usecaseを定義・実装します。アプリの業務はここで処理されます。

- `users_usecase.go`

```go
package usecase

import (
	"easyapp/internal/domain"
	"easyapp/internal/domain/query"
	"easyapp/internal/usecase/params"
	"errors"
)

// 認証のusecaseインターフェースです。
type UsersUsecase interface {

	// 認証処理を行います。
	Login(in params.LoginIn) params.LoginOut

	// ユーザ情報を取得します。
	Me(in params.MeIn) (params.MeOut, error)
}

type usersUsecase struct {
	usersRepository domain.UsersRepository
}

func NewUsersUsecase(usersRepository domain.UsersRepository) UsersUsecase {
	return &usersUsecase{usersRepository: usersRepository}
}

func (u *usersUsecase) Login(in params.LoginIn) params.LoginOut {

	users := u.usersRepository.FindByName(query.NewFindByNameQuery(in.Name()))
	if users.Name() == "" {
		return params.NewLoginOut(false)
	}
	return params.NewLoginOut(users.Password() == in.Password())
}

func (u *usersUsecase) Me(in params.MeIn) (params.MeOut, error) {

	users := u.usersRepository.FindByName(query.NewFindByNameQuery(in.Name()))
	if users.Name() == "" {
		return *new(params.MeOut), errors.New("no such user")
	}
	return params.NewMeOut(users.Name(), users.Age()), nil
}
```

#### `internal/usecase/params/`

usecase向けの関数の入力・出力モデル構造体を定義します。

- `users_params.go`

```go
package params

// 認証向けの入力モデルです。
type LoginIn struct {
	name     string // ユーザ名
	password string // パスワード
}

func NewLoginIn(name string, password string) LoginIn {
	return LoginIn{name: name, password: password}
}

func (i LoginIn) Name() string {
	return i.name
}

func (i LoginIn) Password() string {
	return i.password
}

// 認証向けの出力モデルです。
type LoginOut struct {
	valid bool // 認証可否
}

func NewLoginOut(valid bool) LoginOut {
	return LoginOut{valid: valid}
}

func (o LoginOut) Valid() bool {
	return o.valid
}

// ユーザ情報取得向けの入力モデルです。
type MeIn struct {
	name string // ユーザ名
}

func NewMeIn(name string) MeIn {
	return MeIn{name: name}
}

func (i MeIn) Name() string {
	return i.name
}

// ユーザ情報取得向けの出力モデルです。
type MeOut struct {
	name string // ユーザ名
	age  int    // 年齢
}

func NewMeOut(name string, age int) MeOut {
	return MeOut{name: name, age: age}
}

func (o MeOut) Name() string {
	return o.name
}

func (o MeOut) Age() int {
	return o.age
}
```

#### `internal/handler/`

handlerを定義・実装します。usecaseを呼び出し、レスポンスを作成します。

- `users_handler.go`

```go
package handler

import (
	"easyapp/internal/handler/model"
	"easyapp/internal/usecase"
	"easyapp/internal/usecase/params"
	"encoding/json"
	"net/http"
)

// 認証のhandlerインターフェースです。
type UsersHandler interface {

	// 認証処理を呼び出します。
	Login(w http.ResponseWriter, r *http.Request)

	// ユーザ情報取得処理を呼び出します。
	Me(w http.ResponseWriter, r *http.Request)
}

type usersHandler struct {
	usersUsecase usecase.UsersUsecase
}

func NewUsersHandler(usersUsecase usecase.UsersUsecase) UsersHandler {
	return &usersHandler{usersUsecase: usersUsecase}
}

func (h *usersHandler) Login(w http.ResponseWriter, r *http.Request) {

	req := model.NewLoginReq(r)

	out := h.usersUsecase.Login(params.NewLoginIn(req.Name, req.Password))

	res := model.NewLoginRes(out.Valid())
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

func (h *usersHandler) Me(w http.ResponseWriter, r *http.Request) {

	req := model.NewMeReq(r)

	out, err := h.usersUsecase.Me(params.NewMeIn(req.Name))
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(struct {
			Message string `json:"message"`
		}{
			Message: err.Error(),
		})
		return
	}

	res := model.NewMeRes(out.Name(), out.Age())
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}
```

#### `internal/handler/model/`

handler向けの関数の入力・出力モデル構造体を定義します。

- `users_model.go`

```go
package model

import (
	"encoding/json"
	"net/http"
)

// 認証向けのリクエストモデルです。
type LoginReq struct {
	Name     string `json:"name"`     // ユーザ名
	Password string `json:"password"` // パスワード
}

func NewLoginReq(r *http.Request) LoginReq {

	var req LoginReq
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		return *new(LoginReq)
	}
	return req
}

// 認証向けのレスポンスモデルです。
type LoginRes struct {
	Valid bool `json:"valid"` // 認証可否
}

func NewLoginRes(valid bool) LoginRes {
	return LoginRes{Valid: valid}
}

// ユーザ情報取得向けのリクエストモデルです。
type MeReq struct {
	Name string `json:"name"` // ユーザ名
}

func NewMeReq(r *http.Request) MeReq {
	return MeReq{Name: r.URL.Query().Get("name")}
}

// ユーザ情報取得向けのレスポンスモデルです。
type MeRes struct {
	Name string `json:"name"` // ユーザ名
	Age  int    `json:"age"`  // 年齢
}

func NewMeRes(name string, age int) MeRes {
	return MeRes{Name: name, Age: age}
}
```

#### `internal/handler/router/`

リクエストのルーティングを実装します。

- `base.go`

```go
package router

import (
	"easyapp/internal/infrastructure"
	"net/http"
)

// routerのインターフェースです。
type Router interface {

	// ルーティング情報をセットします。
	SetRouting(m *http.ServeMux)
}

// APIのベースURI
const basePath string = "/api/v1"

// ルーティングを設定します。
func Routing() *http.ServeMux {

	// データベースに接続
	db := infrastructure.ConnectDB()

	// 各handlerに紐づくルーティングを設定
	m := http.NewServeMux()

	// users
	NewUsersRouter(db).SetRouting(m)

	return m
}
```

- `users_router.go`

```go
package router

import (
	"database/sql"
	"easyapp/internal/handler"
	"easyapp/internal/infrastructure/persistence"
	"easyapp/internal/infrastructure/repository"
	"easyapp/internal/usecase"
	"net/http"
)

type usersRouter struct {
	db *sql.DB
}

func NewUsersRouter(db *sql.DB) Router {
	return &usersRouter{db: db}
}

func (r *usersRouter) SetRouting(m *http.ServeMux) {

	h := handler.NewUsersHandler(
		usecase.NewUsersUsecase(
			repository.NewUsersRepository(
				persistence.NewUsersSql(
					r.db,
				),
			),
		),
	)

	// カスタムルータ
	m.HandleFunc(basePath+"/login", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			h.Login(w, r)
		default:
			http.Error(w, "Forbidden", http.StatusForbidden)
		}
	})

	m.HandleFunc(basePath+"/me", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.Me(w, r)
		default:
			http.Error(w, "Forbidden", http.StatusForbidden)
		}
	})
}
```

#### `cmd/`

アプリケーションのエントリポイントです。

- `main.go`

```go
package main

import (
	"easyapp/internal/handler/router"
	"fmt"
	"log"
	"net/http"
)

func main() {

	fmt.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", router.Routing()))
}
```

## 起動

下記コマンドでアプリを起動します。

```shell
go run cmd/main.go
```

下記コマンドでAPIを打鍵できます。

```shell
# /login
curl -X POST -H 'Content-Type: application/json' -d '{"name": "nob", "password": "passwd"}' localhost:8080/api/v1/login
# /me
curl -X GET localhost:8080/api/v1/me?name=nob
```
