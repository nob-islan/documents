# Go REST API プロジェクトセットアップ

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

#### volumes/initdb.d/create-database.sql

```sql
CREATE DATABASE eadb;
USE eadb;

CREATE TABLE users (
    name VARCHAR(8) PRIMARY KEY
    , password VARCHAR(32)
    , age INT
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

業務処理の中心となるドメインおよびそれをデータベースから取得する repository のインターフェースを定義します。

- users.go

```go
package domain

// usersテーブル向けエンティティです。
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

// usersテーブル向けrepositoryのインターフェースです。
type UsersRepository interface {

	// ユーザ情報を取得します。
	FindByName(name string) (Users, error)
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

func (r *usersRepository) FindByName(name string) (domain.Users, error) {

	const sql string = "SELECT * FROM users WHERE name = ?"

	// クエリ実行
	rows, err := r.db.Query(sql, name)
	if err != nil {
		return *new(domain.Users), err
	}
	defer rows.Close()

	var users domain.Users
	for rows.Next() {
		var name string
		var password string
		var age int
		rows.Scan(&name, &password, &age)
		users = domain.NewUsers(name, password, age)
	}

	return users, nil
}
```

#### internal/usecase/

usecase を定義・実装します。アプリの業務はここで処理されます。

- auth_usecase.go

```go
package usecase

import (
	"easyapp/internal/domain"
	"easyapp/internal/usecase/payload"
)

// 認証のusecaseインターフェースです。
type AuthUsecase interface {

	// 認証処理を行います。
	Login(in payload.LoginIn) payload.LoginOut

	// ユーザ情報を取得します。
	Me(in payload.MeIn) payload.MeOut
}

type authUsecase struct {
	authRepository domain.UsersRepository
}

func NewAuthUsecase(authRepository domain.UsersRepository) AuthUsecase {
	return &authUsecase{authRepository: authRepository}
}

func (u *authUsecase) Login(in payload.LoginIn) payload.LoginOut {

	user, err := u.authRepository.FindByName(in.Name())
	if err != nil {
		return payload.NewLoginOut(false)
	}
	return payload.NewLoginOut(user.Password() == in.Password())
}

func (u *authUsecase) Me(in payload.MeIn) payload.MeOut {

	users, err := u.authRepository.FindByName(in.Name())
	if err != nil {
		return *new(payload.MeOut)
	}
	return payload.NewMeOut(users.Name(), users.Age())
}
```

#### internal/usecase/payload/

usecase 向けの関数の入力・出力モデル構造体を定義します。

- auth_payload.go

```go
package payload

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

#### internal/handler/

handler を定義・実装します。usecase を呼び出し、レスポンスを作成します。

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

// 認証のhandlerインターフェースです。
type AuthHandler interface {

	// 認証処理を呼び出します。
	Login(w http.ResponseWriter, r *http.Request)

	// ユーザ情報取得処理を呼び出します。
	Me(w http.ResponseWriter, r *http.Request)
}

type authHandler struct {
	authUsecase usecase.AuthUsecase
}

func NewAuthHandler(authUsecase usecase.AuthUsecase) AuthHandler {
	return &authHandler{authUsecase: authUsecase}
}

func (h *authHandler) Login(w http.ResponseWriter, r *http.Request) {

	req := model.NewLoginReq(r)

	out := h.authUsecase.Login(payload.NewLoginIn(req.Name, req.Password))

	res := model.NewLoginRes(out.Valid())
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

func (h *authHandler) Me(w http.ResponseWriter, r *http.Request) {

	req := model.NewMeReq(r)

	out := h.authUsecase.Me(payload.NewMeIn(req.Name))

	res := model.NewMeRes(out.Name(), out.Age())
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
# /login
curl -X POST -H 'Content-Type: application/json' -d '{"name": "nob", "password": "passwd"}' localhost:8080/api/v1/login
# /me
curl -X GET localhost:8080/api/v1/me?name=nob
```

## パッケージ構成例

Go プロジェクトのパッケージ構成について一つの指針となるサンプルを記載します。

```shell
.
├── api                 # APIドキュメント
├── cmd                 # エントリポイント
├── internal
│   ├── apperrors       # 独自エラー定義およびそのハンドリング
│   ├── domain          # ドメイン構造体
│   ├── handler         # APIリクエストをハンドリング、業務処理呼び出し
│   │   ├── model       # APIのリクエスト・レスポンス構造体
│   │   └── router      # httpリクエストのルーティング
│   ├── infrastructure  # データベースなど外部接続設定
│   │   └── repository  # データベースへのアクセス
│   ├── logging         # ログ出力制御
│   └── usecase         # 業務処理
│       └── payload     # 業務処理の入力・出力モデル
└── scripts             # 開発支援ツール
```

### パッケージ解説

#### api

swagger などの API ドキュメント、およびそれを生成する関数を格納するパッケージです。

#### cmd

アプリケーションのエントリポイントとなる関数を格納するパッケージです。基本的に `main.go` のみが格納されます。

#### internal/apperrors

アプリケーション内で独自に定義するエラーおよびそのハンドリング関数を格納するパッケージです。

#### internal/domain

業務処理の中心となるドメイン構造体およびそれを取得する repository インターフェースを格納するパッケージです。

値のチェックなど、1 つの domain で完結する業務処理についてはこのパッケージ内で実装してください。

repository の戻り値について、ドメイン構造体とテーブル定義とが 1:1 対応している場合は domain を戻し、そうでない場合はテーブル定義に対応する構造体を internal/infrastructure/entity パッケージを新設してその中で定義し、usecase 内で entity から domain への変換を行ってください。

#### internal/handler

リクエストモデルの json の解析およびバリデーションを行なって、業務処理を呼び出すハンドラ関数を格納するパッケージです。

#### internal/handler/model

API のリクエスト・レスポンスモデルとなる構造体を格納するパッケージです。

#### internal/handler/router

http リクエストのルーティングを行う関数を格納するパッケージです。

#### internal/infrastructure

データベースや他 API などの外部接続に関する設定を行う関数を格納するパッケージです。

#### internal/infrastructure/repository

データベースにアクセスして SQL を実行する関数を格納するパッケージです。

#### internal/logging

ログレベル別の文言出力など、ログ出力を制御するパッケージです。

#### internal/usecase

業務処理を行う関数を格納するパッケージです。関数内に直接処理を実装するか、domain 内の処理を呼び出す形で業務を実施します。

#### internal/usecase/payload

業務処理の入力・出力モデルとなる構造体を格納するパッケージです。

#### scripts

テストカバレッジの作成や API ドキュメントの自動生成などの開発支援ツールを格納するパッケージです。
