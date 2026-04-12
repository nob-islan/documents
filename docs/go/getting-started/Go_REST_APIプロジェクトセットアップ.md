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
│   └── main.go                     # アプリのエントリポイント
└── internal
    ├── app
    │   └── server.go               # 依存性の注入およびルーティング設定
    ├── domain
    │   └── user.go                 # ドメイン定義およびrepositoryのインターフェース
    ├── handler
    │   ├── model
    │   │   └── user_model.go       # APIのリクエスト・レスポンス構造体
    │   ├── router
    │   │   ├── base.go             # エンドポイントのルーター統括
    │   │   └── user_router.go      # 業務処理ごとのルーター
    │   └── user_handler.go         # APIとしてのインターフェースおよび実装
    ├── infrastructure
    │   ├── db.go                   # データベース接続設定
    │   ├── persistence
    │   │   ├── table
    │   │   │   └── users_row.go    # テーブル定義に対応した構造体
    │   │   └── users_sql.go        # ドメイン操作のためのSQL定義
    │   └── repository
    │       └── user_repository.go  # データベース操作の統括
    └── usecase
        ├── params
        │   └── user_params.go      # 業務処理の入力・出力モデル構造体
        └── user_usecase.go         # 業務処理のインターフェースおよび実装
```

### パッケージ一覧

#### `internal/domain/`

業務処理の中心となるドメインおよびそれをデータベースから取得するrepositoryのインターフェースを定義します。

- `user.go`

```go
package domain

import "context"

// ユーザ情報ドメインです。
type User struct {
	name     string // ユーザ名
	password string // パスワード
	age      int    // 年齢
}

func NewUser(name string, password string, age int) User {
	return User{name: name, password: password, age: age}
}

func (u User) Name() string {
	return u.name
}

func (u User) Password() string {
	return u.password
}

func (u User) Age() int {
	return u.age
}

// ユーザ情報ドメイン向けrepositoryのインターフェースです。
type UserRepository interface {

	// ユーザ情報を取得します。
	FindByName(ctx context.Context, q FindByNameQuery) User
}

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
	"context"
	"database/sql"
	"easyapp/internal/infrastructure/persistence/table"
)

type UsersSql interface {

	// ユーザ情報取得SQLを発行します。
	FindByName(ctx context.Context, targetName string) table.Users
}

type usersSql struct {
	db *sql.DB
}

func NewUsersSql(db *sql.DB) UsersSql {
	return &usersSql{db: db}
}

func (s *usersSql) FindByName(ctx context.Context, targetName string) table.Users {

	const sql string = "SELECT * FROM users WHERE name = ?"

	// クエリ実行
	row := s.db.QueryRowContext(ctx, sql, targetName)

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

- `user_repository.go`

```go
package repository

import (
	"context"
	"easyapp/internal/domain"
	"easyapp/internal/infrastructure/persistence"
)

type userRepository struct {
	usersSql persistence.UsersSql
}

func NewUserRepository(usersSql persistence.UsersSql) domain.UserRepository {
	return &userRepository{usersSql: usersSql}
}

func (r *userRepository) FindByName(ctx context.Context, q domain.FindByNameQuery) domain.User {

	u := r.usersSql.FindByName(ctx, q.Name())

	return domain.NewUser(u.Name, u.Password, u.Age)
}
```

#### `internal/usecase/`

usecaseを定義・実装します。アプリの業務はここで処理されます。

- `user_usecase.go`

```go
package usecase

import (
	"context"
	"easyapp/internal/domain"
	"easyapp/internal/usecase/params"
	"errors"
)

// 認証のusecaseインターフェースです。
type UserUsecase interface {

	// 認証処理を行います。
	Login(ctx context.Context, in params.LoginIn) params.LoginOut

	// ユーザ情報を取得します。
	Me(ctx context.Context, in params.MeIn) (params.MeOut, error)
}

type userUsecase struct {
	userRepository domain.UserRepository
}

func NewUserUsecase(userRepository domain.UserRepository) UserUsecase {
	return &userUsecase{userRepository: userRepository}
}

func (u *userUsecase) Login(ctx context.Context, in params.LoginIn) params.LoginOut {

	user := u.userRepository.FindByName(ctx, domain.NewFindByNameQuery(in.Name()))
	if user.Name() == "" {
		return params.NewLoginOut(false)
	}
	return params.NewLoginOut(user.Password() == in.Password())
}

func (u *userUsecase) Me(ctx context.Context, in params.MeIn) (params.MeOut, error) {

	user := u.userRepository.FindByName(ctx, domain.NewFindByNameQuery(in.Name()))
	if user.Name() == "" {
		return *new(params.MeOut), errors.New("no such user")
	}
	return params.NewMeOut(user.Name(), user.Age()), nil
}
```

#### `internal/usecase/params/`

usecase向けの関数の入力・出力モデル構造体を定義します。

- `user_params.go`

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

- `user_handler.go`

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
type UserHandler interface {

	// 認証処理を呼び出します。
	Login(w http.ResponseWriter, r *http.Request)

	// ユーザ情報取得処理を呼び出します。
	Me(w http.ResponseWriter, r *http.Request)
}

type userHandler struct {
	userUsecase usecase.UserUsecase
}

func NewUserHandler(userUsecase usecase.UserUsecase) UserHandler {
	return &userHandler{userUsecase: userUsecase}
}

func (h *userHandler) Login(w http.ResponseWriter, r *http.Request) {

	req := model.NewLoginReq(r)

	out := h.userUsecase.Login(r.Context(), params.NewLoginIn(req.Name, req.Password))

	res := model.NewLoginRes(out.Valid())
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

func (h *userHandler) Me(w http.ResponseWriter, r *http.Request) {

	req := model.NewMeReq(r)

	out, err := h.userUsecase.Me(r.Context(), params.NewMeIn(req.Name))
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

- `user_model.go`

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
	"net/http"
)

// routerのインターフェースです。
type Router interface {

	// ルーティング情報をセットします。
	SetRouting(m *http.ServeMux)
}

// APIのベースURI
const basePath string = "/api/v1"
```

- `user_router.go`

```go
package router

import (
	"easyapp/internal/handler"
	"net/http"
)

type userRouter struct {
	userHandler handler.UserHandler
}

func NewUserRouter(userHandler handler.UserHandler) Router {
	return &userRouter{userHandler: userHandler}
}

func (router *userRouter) SetRouting(m *http.ServeMux) {

	m.HandleFunc(basePath+"/login", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			router.userHandler.Login(w, r)
		default:
			http.Error(w, "Forbidden", http.StatusForbidden)
		}
	})

	m.HandleFunc(basePath+"/me", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			router.userHandler.Me(w, r)
		default:
			http.Error(w, "Forbidden", http.StatusForbidden)
		}
	})
}
```

#### `internal/app/`

依存性の注入およびルーティングを行い、APIの実装を決定します。

- `server.go`

```go
package app

import (
	"easyapp/internal/handler"
	"easyapp/internal/handler/router"
	"easyapp/internal/infrastructure"
	"easyapp/internal/infrastructure/persistence"
	"easyapp/internal/infrastructure/repository"
	"easyapp/internal/usecase"
	"net/http"
)

// 依存性の注入を行い、アプリケーションの構築を行います。
func NewServer() http.Handler {

	// データベースに接続
	db := infrastructure.ConnectDB()

	// 各handlerに紐づくルーティングを設定
	m := http.NewServeMux()

	// user
	router.NewUserRouter(handler.NewUserHandler(
		usecase.NewUserUsecase(
			repository.NewUserRepository(
				persistence.NewUsersSql(
					db,
				),
			),
		),
	)).SetRouting(m)

	return m
}
```

#### `cmd/`

アプリケーションのエントリポイントです。

- `main.go`

```go
package main

import (
	"easyapp/internal/app"
	"fmt"
	"log"
	"net/http"
)

func main() {

	fmt.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", app.NewServer()))
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
