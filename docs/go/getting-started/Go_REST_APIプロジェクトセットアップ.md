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
    ├── apperrors
    │   └── apperrors.go            # 汎用的なアプリエラー定義
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

import (
	"context"
	"errors"
)

// ユーザ情報ドメインです。
type User struct {
	name     Name     // ユーザ名
	password Password // パスワード
	age      Age      // 年齢
}

func NewUser(name string, password string, age int) (User, error) {
	userName, err := NewName(name)
	if err != nil {
		return User{}, err
	}
	userPassword, err := NewPassword(password)
	if err != nil {
		return User{}, err
	}
	userAge, err := NewAge(age)
	if err != nil {
		return User{}, err
	}

	return User{name: userName, password: userPassword, age: userAge}, nil
}

func (u User) Name() Name {
	return u.name
}

func (u User) Age() Age {
	return u.age
}

// パスワードが正しいかを判定します。
func (u User) VerifyPassword(password string) bool {
	return u.password.verify(password)
}

// ユーザ情報ドメイン向けrepositoryのインターフェースです。
type UserRepository interface {

	// ユーザ情報を取得します。
	FindByName(ctx context.Context, targetName Name) (User, error)
}

var NoSuchUser = errors.New("no such user")

// ユーザ名
type Name struct {
	value string
}

func NewName(value string) (Name, error) {
	if value == "" {
		return Name{}, errors.New("input name")
	}
	return Name{value: value}, nil
}

func (v Name) Value() string {
	return v.value
}

// パスワード
type Password struct {
	value string
}

func NewPassword(value string) (Password, error) {
	if value == "" {
		return Password{}, errors.New("input password")
	}
	return Password{value: value}, nil
}

// パスワードが正しいかを判定します。
func (v Password) verify(password string) bool {
	return v.value == password
}

// 年齢
type Age struct {
	value int
}

func (v Age) Value() int {
	return v.value
}

func NewAge(value int) (Age, error) {
	if value < 0 {
		return Age{}, errors.New("input a value of 0 or greater for age")
	}
	return Age{value: value}, nil
}
```

#### `internal/apperrors/`

汎用的なアプリケーションエラー文言を定義します。

- `apperrors.go`

```go
package apperrors

import "errors"

var (
	InvalidInputErr = errors.New("invalid input")
	DatabaseErr     = errors.New("database error")
)
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
	"easyapp/internal/apperrors"
	"easyapp/internal/domain"
	"errors"
)

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) domain.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindByName(ctx context.Context, target domain.Name) (domain.User, error) {

	const query string = "SELECT name, password, age FROM users WHERE name = ?"

	// クエリ実行
	row := r.db.QueryRowContext(ctx, query, target.Value())

	var name string
	var password string
	var age int
	err := row.Scan(&name, &password, &age)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.User{}, domain.NoSuchUser
		}
		return domain.User{}, apperrors.DatabaseErr
	}

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
	"easyapp/internal/apperrors"
	"easyapp/internal/application/usecase/params"
	"easyapp/internal/domain"
	"errors"
)

// 認証のusecaseインターフェースです。
type UserUsecase interface {

	// 認証処理を行います。
	Login(ctx context.Context, in params.LoginInput) (params.LoginOutput, error)

	// ユーザ情報を取得します。
	GetUser(ctx context.Context, in params.GetUserInput) (params.GetUserOutput, error)
}

type userUsecase struct {
	userRepository domain.UserRepository
}

func NewUserUsecase(userRepository domain.UserRepository) UserUsecase {
	return &userUsecase{userRepository: userRepository}
}

func (u *userUsecase) Login(ctx context.Context, in params.LoginInput) (params.LoginOutput, error) {

	name, err := domain.NewName(in.Name())
	if err != nil {
		return params.LoginOutput{}, apperrors.InvalidInputErr
	}

	user, err := u.userRepository.FindByName(ctx, name)
	if err != nil {
		if errors.Is(err, domain.NoSuchUser) {
			return params.LoginOutput{}, nil
		}
		return params.LoginOutput{}, apperrors.DatabaseErr
	}

	return params.NewLoginOutput(user.VerifyPassword(in.Password())), nil
}

func (u *userUsecase) GetUser(ctx context.Context, in params.GetUserInput) (params.GetUserOutput, error) {

	name, err := domain.NewName(in.Name())
	if err != nil {
		return params.GetUserOutput{}, apperrors.InvalidInputErr
	}

	user, err := u.userRepository.FindByName(ctx, name)
	if err != nil {
		if errors.Is(err, domain.NoSuchUser) {
			return params.GetUserOutput{}, nil
		}
		return params.GetUserOutput{}, apperrors.DatabaseErr
	}

	return params.NewGetUserOutput(user.Name().Value(), user.Age().Value()), nil
}
```

#### `internal/application/usecase/params/`

usecase向けの関数の入力・出力モデル構造体を定義します。

- `user_params.go`

```go
package params

// 認証向けの入力モデルです。
type LoginInput struct {
	name     string // ユーザ名
	password string // パスワード
}

func NewLoginInput(name string, password string) LoginInput {
	return LoginInput{name: name, password: password}
}

func (i LoginInput) Name() string {
	return i.name
}

func (i LoginInput) Password() string {
	return i.password
}

// 認証向けの出力モデルです。
type LoginOutput struct {
	valid bool // 認証可否
}

func NewLoginOutput(valid bool) LoginOutput {
	return LoginOutput{valid: valid}
}

func (o LoginOutput) Valid() bool {
	return o.valid
}

// ユーザ情報取得向けの入力モデルです。
type GetUserInput struct {
	name string // ユーザ名
}

func NewGetUserInput(name string) GetUserInput {
	return GetUserInput{name: name}
}

func (i GetUserInput) Name() string {
	return i.name
}

// ユーザ情報取得向けの出力モデルです。
type GetUserOutput struct {
	name string // ユーザ名
	age  int    // 年齢
}

func NewGetUserOutput(name string, age int) GetUserOutput {
	return GetUserOutput{name: name, age: age}
}

func (o GetUserOutput) Name() string {
	return o.name
}

func (o GetUserOutput) Age() int {
	return o.age
}
```

#### `internal/presentation/handler/`

handlerを定義・実装します。usecaseを呼び出し、レスポンスを作成します。

- `user_handler.go`

```go
package handler

import (
	"easyapp/internal/apperrors"
	"easyapp/internal/application/usecase"
	"easyapp/internal/application/usecase/params"
	"easyapp/internal/presentation/handler/model"
	"encoding/json"
	"errors"
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

	req, err := model.NewLoginRequest(r)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(
			struct {
				Message string `json:"message"`
			}{
				Message: "bad request",
			},
		)
		return
	}

	out, err := h.userUsecase.Login(r.Context(), params.NewLoginInput(req.Name, req.Password))
	if err != nil {
		if errors.Is(err, apperrors.DatabaseErr) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(
				struct {
					Message string `json:"message"`
				}{
					Message: err.Error(),
				},
			)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(
			struct {
				Message string `json:"message"`
			}{
				Message: err.Error(),
			},
		)
		return
	}

	res := model.NewLoginResponse(out.Valid())
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {

	req := model.NewGetUserRequest(r)

	out, err := h.userUsecase.GetUser(r.Context(), params.NewGetUserInput(req.Name))
	if err != nil {
		if errors.Is(err, apperrors.DatabaseErr) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(
				struct {
					Message string `json:"message"`
				}{
					Message: err.Error(),
				},
			)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(
			struct {
				Message string `json:"message"`
			}{
				Message: err.Error(),
			},
		)
		return
	}

	res := model.NewGetUserResponse(out.Name(), out.Age())
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
type LoginRequest struct {
	Name     string `json:"name"`     // ユーザ名
	Password string `json:"password"` // パスワード
}

func NewLoginRequest(r *http.Request) (LoginRequest, error) {
	var req LoginRequest
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		return LoginRequest{}, err
	}
	return req, nil
}

// 認証向けのレスポンスモデルです。
type LoginResponse struct {
	Valid bool `json:"valid"` // 認証可否
}

func NewLoginResponse(valid bool) LoginResponse {
	return LoginResponse{Valid: valid}
}

// ユーザ情報取得向けのリクエストモデルです。
type GetUserRequest struct {
	Name string `json:"name"` // ユーザ名
}

func NewGetUserRequest(r *http.Request) GetUserRequest {
	return GetUserRequest{Name: r.URL.Query().Get("name")}
}

// ユーザ情報取得向けのレスポンスモデルです。
type GetUserResponse struct {
	Name string `json:"name"` // ユーザ名
	Age  int    `json:"age"`  // 年齢
}

func NewGetUserResponse(name string, age int) GetUserResponse {
	return GetUserResponse{Name: name, Age: age}
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

	m.HandleFunc(basePath+"/users", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.GetUser(w, r)
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
# /users
curl -X GET localhost:8080/api/v1/users?name=nob
```
