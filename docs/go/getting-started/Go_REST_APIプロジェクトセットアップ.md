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

CREATE TABLE eadb.users (
    name VARCHAR(8) PRIMARY KEY
    , password VARCHAR(32) NOT NULL
    , age INT NOT NULL
);

INSERT INTO eadb.users (
    name
    , password
    , age
) VALUES (
    'nob'
    , 'passwd'
    , 13
);

CREATE USER eadbuser;

GRANT ALL ON eadb.* TO eadbuser@'%' IDENTIFIED BY 'eadbpass';
```

### パッケージ構成

```shell
.
├── cmd
│   └── server
│       └── main.go                 # アプリのエントリポイント
└── internal
    ├── application
    │   └── usecase
    │       ├── params
    │       │   └── user_params.go  # 業務処理の入力・出力モデル構造体
    │       └── user_usecase.go     # 業務処理のインターフェースおよび実装
    ├── bootstrap
    │   └── server.go               # 依存性の注入およびルーティング設定
    ├── domain
    │   └── user.go                 # ドメイン定義およびrepositoryのインターフェース
    ├── infrastructure
    │   ├── db.go                   # データベース接続設定
    │   └── repository
    │       └── user_repository.go  # ドメインの取得/永続化
    └── presentation
        ├── handler
        │   ├── model
        │   │   └── user_model.go   # APIのリクエスト・レスポンス構造体
        │   └── user_handler.go     # APIとしての外部契約
        └── router
            └── router.go           # エンドポイントとハンドラの紐付け
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

// ユーザが存在するかを判定します。
func (u User) Exists() bool {
	return !(u.name == "")
}

// パスワードが正しいかを判定します。
func (u User) VerifyPassword(password string) bool {
	return u.password == password
}

// ユーザ情報ドメイン向けrepositoryのインターフェースです。
type UserRepository interface {

	// ユーザ情報を取得します。
	FindByName(ctx context.Context, targetName string) User
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
		user       string = "eadbuser"
		password   string = "eadbpass"
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

#### `internal/infrastructure/repository/`

SQLを実行してドメイン・テーブル間のデータをやり取りします。

- `user_repository.go`

```go
package repository

import (
	"context"
	"database/sql"
	"easyapp/internal/domain"
)

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) domain.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindByName(ctx context.Context, targetName string) domain.User {

	const sql string = "SELECT * FROM users WHERE name = ?"

	// クエリ実行
	row := r.db.QueryRowContext(ctx, sql, targetName)

	var name string
	var password string
	var age int
	row.Scan(&name, &password, &age)

	return domain.NewUser(name, password, age)
}
```

#### `internal/application/usecase/`

usecaseを定義・実装します。アプリの業務はここで処理されます。

- `user_usecase.go`

```go
package usecase

import (
	"context"
	"easyapp/internal/application/usecase/params"
	"easyapp/internal/domain"
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

	user := u.userRepository.FindByName(ctx, in.Name())
	if !user.Exists() {
		return params.NewLoginOut(false)
	}
	return params.NewLoginOut(user.VerifyPassword(in.Password()))
}

func (u *userUsecase) Me(ctx context.Context, in params.MeIn) (params.MeOut, error) {

	user := u.userRepository.FindByName(ctx, in.Name())
	if !user.Exists() {
		return *new(params.MeOut), errors.New("no such user")
	}
	return params.NewMeOut(user.Name(), user.Age()), nil
}
```

#### `internal/application/usecase/params/`

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

#### `internal/presentation/handler/`

handlerを定義・実装します。usecaseを呼び出し、レスポンスを作成します。

- `user_handler.go`

```go
package handler

import (
	"easyapp/internal/application/usecase"
	"easyapp/internal/application/usecase/params"
	"easyapp/internal/presentation/handler/model"
	"encoding/json"
	"net/http"
)

// 認証のhandlerです。
type UserHandler struct {
	userUsecase usecase.UserUsecase
}

func NewUserHandler(userUsecase usecase.UserUsecase) UserHandler {
	return UserHandler{userUsecase: userUsecase}
}

func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {

	req := model.NewLoginReq(r)

	out := h.userUsecase.Login(r.Context(), params.NewLoginIn(req.Name, req.Password))

	res := model.NewLoginRes(out.Valid())
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

func (h *UserHandler) Me(w http.ResponseWriter, r *http.Request) {

	req := model.NewMeReq(r)

	out, err := h.userUsecase.Me(r.Context(), params.NewMeIn(req.Name))
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(
			struct {
				Message string `json:"message"`
			}{
				Message: err.Error(),
			},
		)
		return
	}

	res := model.NewMeRes(out.Name(), out.Age())
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}
```

#### `internal/presentation/handler/model/`

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

#### `internal/presentation/router/`

リクエストのルーティングを実装します。

- `router.go`

```go
package router

import (
	"easyapp/internal/presentation/handler"
	"net/http"
)

// APIのベースURI
const basePath string = "/api/v1"

// UserHandler向けのルーティングをセットします。
func SetUserHandlerRouting(m *http.ServeMux, h handler.UserHandler) {

	m.HandleFunc(basePath+"/login", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			h.Login(w, r)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	})

	m.HandleFunc(basePath+"/me", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.Me(w, r)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	})
}
```

#### `internal/bootstrap/`

依存性の注入およびルーティングを行い、APIの実装を決定します。

- `server.go`

```go
package bootstrap

import (
	"easyapp/internal/application/usecase"
	"easyapp/internal/infrastructure"
	"easyapp/internal/infrastructure/repository"
	"easyapp/internal/presentation/handler"
	"easyapp/internal/presentation/router"
	"net/http"
)

// 依存性の注入を行い、アプリケーションの構築を行います。
func NewServer() http.Handler {

	// データベースに接続
	db := infrastructure.ConnectDB()

	// 各handlerに紐づくルーティングを設定
	m := http.NewServeMux()

	// user
	router.SetUserHandlerRouting(
		m,
		handler.NewUserHandler(
			usecase.NewUserUsecase(
				repository.NewUserRepository(
					db,
				),
			),
		),
	)

	return m
}
```

#### `cmd/server/`

アプリケーションのエントリポイントです。

- `main.go`

```go
package main

import (
	"easyapp/internal/bootstrap"
	"fmt"
	"log"
	"net/http"
)

func main() {

	fmt.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", bootstrap.NewServer()))
}
```

## 起動

下記コマンドでアプリを起動します。

```shell
go run cmd/server/main.go
```

下記コマンドでAPIを打鍵できます。

```shell
# /login
curl -X POST -H 'Content-Type: application/json' -d '{"name": "nob", "password": "passwd"}' localhost:8080/api/v1/login
# /me
curl -X GET localhost:8080/api/v1/me?name=nob
```
