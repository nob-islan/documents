# Go REAT API プロジェクトセットアップ方法

## プロジェクト作成

- 下記コマンドで Go モジュールを初期化します。

```shell
go mod init easyapp
```

- mysql 向けのドライバをインストールします。

```shell
go get github.com/go-sql-driver/mysql
```

## 実装

サンプルコードを掲載します。ここでは擬似的なログイン画面を実装します。

### 事前準備

データベースを docker で構築します。

#### docker-compose.yaml

```yaml
services:
  easyappdb:
    image: mariadb:latest
    container_name: easyappdb
    ports:
      - 3306:3306
    volumes:
      - ./volumes/initdb.d:/docker-entrypoint-initdb.d
    environment:
      - MYSQL_ROOT_PASSWORD=password
```

#### volumes/initdb.d/create-database.sql

```sql
CREATE DATABASE easyappdb;
USE easyappdb;

CREATE TABLE users (
    name VARCHAR(8) PRIMARY KEY
    , password VARCHAR(32)
);

INSERT INTO users VALUES (
    'nob'
    , 'passwd'
);
```

### ディレクトリ構成

```shell
.
├── cmd
│   └── main.go                      # アプリのエントリポイント
└── internal
    ├── domain
    │   └── users.go                 # ドメイン定義およびrepositoryのインターフェース
    ├── handler
    │   ├── auth_handler.go          # APIとしてのインターフェースおよび実装
    │   ├── model
    │   │   └── auth_model.go        # APIのリクエスト・レスポンス構造体
    │   └── router
    │       ├── auth_router.go       # 業務処理ごとのルーター
    │       └── base.go              # エンドポイントのルーター取りまとめ
    ├── infrastructure
    │   ├── db.go                    # データベース接続設定
    │   └── repository
    │       └── users_repository.go  # データベース操作の実装
    └── usecase
        ├── auth_usecase.go          # 業務処理のインターフェースおよび実装
        └── payload
            └── auth_payload.go      # 業務処理の入力・出力モデル構造体
```

### パッケージ一覧

#### internal/domain/

業務処理の中心となるドメインおよびそれをデータベースから取得する repository のインターフェースを定義します。バリデーションチェックなど、ドメイン単体で完結する業務処理についてはこのパッケージに実装することになります。

- users.go

```go
package domain

// usersテーブル向けエンティティです。
type Users struct {
	name     string // ユーザ名
	password string // パスワード
}

func NewUsers(name string, password string) Users {
	return Users{name: name, password: password}
}

func (u Users) Name() string {
	return u.name
}

func (u Users) Password() string {
	return u.password
}

// usersテーブル向けrepositoryのインターフェースです。
type UsersRepository interface {

	// ユーザ情報を取得します。
	FindByName(name string) Users
}
```

#### internal/infrastructure/

データベースへの接続設定を記載します。

- db.go

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
		dbName     string = "easyappdb"
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

#### internal/infrastructure/repository/

データベースを操作する repository を実装します。

- users_repository.go

```go
package repository

import (
	"database/sql"
	"easyapp/internal/domain"
)

type usersRepository struct {
	db *sql.DB
}

func NewUsersRepository(db *sql.DB) domain.UsersRepository {
	return &usersRepository{db: db}
}

func (r *usersRepository) FindByName(name string) domain.Users {

	const sql string = "SELECT * FROM users WHERE name = ?"

	// クエリ実行
	rows, err := r.db.Query(sql, name)
	if err != nil {
		return *new(domain.Users)
	}
	defer rows.Close()

	var users domain.Users
	for rows.Next() {
		var name string
		var password string
		rows.Scan(&name, &password)
		users = domain.NewUsers(name, password)
	}

	return users
}
```

#### internal/usecase/

usecase を定義・実装します。アプリの業務はここに直接実装するか、ドメイン内の関数を呼び出す形でここで処理されます。

- auth_usecase.go

```go
package usecase

import (
	"easyapp/internal/domain"
	"easyapp/internal/usecase/payload"
)

// 認証の業務処理インターフェースです。
type AuthUsecase interface {

	// 認証処理を行います。
	Login(in payload.AuthIn) payload.AuthOut
}

type authUsecase struct {
	authRepository domain.UsersRepository
}

func NewAuthUsecase(authRepository domain.UsersRepository) AuthUsecase {
	return &authUsecase{authRepository: authRepository}
}

func (u *authUsecase) Login(in payload.AuthIn) payload.AuthOut {

	return payload.NewAuthOut(u.authRepository.FindByName(in.Name()).Password() == in.Password())
}
```

#### internal/usecase/payload/

usecase 向けの関数の入力・出力モデル構造体を定義します。

- auth_payload.go

```go
package payload

// 認証向けの入力モデルです。
type AuthIn struct {
	name     string // ユーザ名
	password string // パスワード
}

func NewAuthIn(name string, password string) AuthIn {
	return AuthIn{name: name, password: password}
}

func (i *AuthIn) Name() string {
	return i.name
}

func (i *AuthIn) Password() string {
	return i.password
}

// 認証向けの出力モデルです。
type AuthOut struct {
	valid bool // 認証可否
}

func NewAuthOut(valid bool) AuthOut {
	return AuthOut{valid: valid}
}

func (o *AuthOut) Valid() bool {
	return o.valid
}
```

#### internal/handler/

handler を定義・実装します。ここでは業務処理は行わず、usecase を呼び出すことに専念します。

- auth_handler.go

```go
package handler

import (
	"easyapp/internal/handler/model"
	"easyapp/internal/usecase"
	"easyapp/internal/usecase/payload"
	"encoding/json"
	"net/http"
)

// 認証のハンドラインターフェースです。
type AuthHandler interface {

	// 認証処理を呼び出します。
	Login(w http.ResponseWriter, r *http.Request)
}

type authHandler struct {
	authUsecase usecase.AuthUsecase
}

func NewAuthHandler(authUsecase usecase.AuthUsecase) AuthHandler {
	return &authHandler{authUsecase: authUsecase}
}

func (h *authHandler) Login(w http.ResponseWriter, r *http.Request) {

	req := model.NewLoginReq(r)

	out := h.authUsecase.Login(payload.NewAuthIn(req.Name, req.Password))

	res := model.NewLoginRes(out.Valid())
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}
```

#### internal/handler/model/

handler 向けの関数の入力・出力モデル構造体を定義します。

- auth_model.go

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
```

#### internal/handler/router/

リクエストのルーティングを実装します。

- base.go

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

	// auth
	NewAuthRouter(db).SetRouting(m)

	return m
}
```

- auth_router.go

```go
package router

import (
	"database/sql"
	"easyapp/internal/handler"
	"easyapp/internal/infrastructure/repository"
	"easyapp/internal/usecase"
	"net/http"
)

type authRouter struct {
	db *sql.DB
}

func NewAuthRouter(db *sql.DB) Router {
	return &authRouter{db: db}
}

func (r *authRouter) SetRouting(m *http.ServeMux) {

	h := handler.NewAuthHandler(usecase.NewAuthUsecase(repository.NewUsersRepository(r.db)))

	// カスタムルータ
	m.HandleFunc(basePath+"/login", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			h.Login(w, r)
		}
	})
}
```

#### cmd/

アプリケーションのエントリポイントです。

- main.go

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

下記コマンドで API を打鍵できます。

```shell
curl -X POST -H 'Content-Type: application/json' -d '{"name": "nob", "password": "passwd"}' localhost:8080/api/v1/login
```
