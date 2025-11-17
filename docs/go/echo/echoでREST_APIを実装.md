# echo で REST API を実装

cf. https://echo.labstack.com/docs

## サンプルコード

echo を使って簡易的な GET メソッドおよび POST メソッドを実装します。usecase 配下はフレームワークに依存しないので省略します。

### ディレクトリ構成

```
.
├── cmd
│   └── main.go
└── internal
    └── handler
        ├── auth_handler.go
        ├── auth_handler_test.go
        ├── model
        │   └── auth_model.go
        └── router
            ├── auth_router.go
            └── base.go
```

### 実装

#### internal/handler/

- auth_handler.go

```go
package handler

import (
	"easyapp/internal/handler/model"
	"easyapp/internal/usecase"
	"easyapp/internal/usecase/payload"
	"net/http"

	"github.com/labstack/echo/v4"
)

// 認証のhandlerインターフェースです。
type AuthHandler interface {

	// 認証処理を呼び出します。
	Login(c echo.Context) error

	// ユーザ情報取得処理を呼び出します。
	Me(c echo.Context) error
}

type authHandler struct {
	authUsecase usecase.AuthUsecase
}

func NewAuthHandler(authUsecase usecase.AuthUsecase) AuthHandler {
	return &authHandler{authUsecase: authUsecase}
}

func (h *authHandler) Login(c echo.Context) error {

	// jsonパース エラー発生時はStatus400を返す
	req, err := model.NewLoginReq(c)
	if err != nil {
		return c.JSON(
			http.StatusBadRequest,
			echo.NewHTTPError(
				http.StatusBadRequest,
				"Bad request",
			),
		)
	}

	// usecase呼び出し
	out := h.authUsecase.Login(payload.NewLoginIn(req.Name, req.Password))

	return c.JSON(http.StatusOK, model.NewLoginRes(out.Valid()))
}

func (h *authHandler) Me(c echo.Context) error {

	// クエリパラメータ取得
	req := model.NewMeReq(c)

	// usecase呼び出し 業務エラー発生時はStatus500を返す
	out, err := h.authUsecase.Me(payload.NewMeIn(req.Name))
	if err != nil {
		return c.JSON(
			http.StatusInternalServerError,
			echo.NewHTTPError(
				http.StatusInternalServerError,
				"Internal server error",
			),
		)
	}

	return c.JSON(http.StatusOK, model.NewMeRes(out.Name(), out.Age()))
}
```

#### internal/handler/model/

- auth_model.go

```go
package model

import (
	"errors"

	"github.com/labstack/echo/v4"
)

// 認証向けのリクエストモデルです。
type LoginReq struct {
	Name     string `json:"name"`     // ユーザ名
	Password string `json:"password"` // パスワード
}

func NewLoginReq(c echo.Context) (LoginReq, error) {

	req := new(LoginReq)
	if err := c.Bind(req); err != nil {
		return LoginReq{}, errors.New("不正なリクエストです。")
	}

	return *req, nil
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

func NewMeReq(c echo.Context) MeReq {
	return MeReq{Name: c.QueryParam("name")}
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

- base.go

```go
package router

import (
	"github.com/labstack/echo/v4"
)

type Router interface {
	SetRouting(e *echo.Echo)
}

const basePath string = "/api/v1"

func Routing() *echo.Echo {

	e := echo.New()

	NewAuthRouter().SetRouting(e)

	return e
}
```

- auth_router.go

```go
package router

import (
	"easyapp/internal/handler"
	"easyapp/internal/usecase"

	"github.com/labstack/echo/v4"
)

type authRouter struct{}

func NewAuthRouter() Router {
	return &authRouter{}
}

func (r *authRouter) SetRouting(e *echo.Echo) {

	h := handler.NewAuthHandler(usecase.NewAuthUsecase())

	e.POST(basePath+"/login", h.Login)
	e.GET(basePath+"/me", h.Me)
}
```

#### cmd/

- main.go

```go
package main

import "easyapp/internal/handler/router"

func main() {

	e := router.Routing()
	e.Logger.Fatal(e.Start(":8080"))
}
```

### テスト作成

- auth_handler_test.go

```go
package handler

import (
	"bytes"
	"easyapp/internal/usecase/payload"
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type mockAuthUsecase struct {
	mock.Mock
}

func (m *mockAuthUsecase) Login(in payload.LoginIn) payload.LoginOut {
	args := m.Called(in)
	return args.Get(0).(payload.LoginOut)
}

func (m *mockAuthUsecase) Me(in payload.MeIn) (payload.MeOut, error) {
	args := m.Called(in)
	return args.Get(0).(payload.MeOut), args.Error(1)
}

func Test_AuthHandler_Login(t *testing.T) {

	tests := []struct {
		name               string                      // テストケース名
		requestBody        string                      // リクエストボディ
		setupMock          func(mock *mockAuthUsecase) // モック設定
		expectedStatusCode int                         // 期待されるHTTPステータス
		expectedBody       string                      // 期待されるレスポンスボディ
	}{
		{
			name:        "success",
			requestBody: `{"name": "nob", "password": "passwd"}`,
			setupMock: func(mock *mockAuthUsecase) {
				mock.On(
					"Login",
					payload.NewLoginIn(
						"nob",
						"passwd",
					),
				).Return(
					payload.NewLoginOut(true),
				)
			},
			expectedStatusCode: http.StatusOK,
			expectedBody:       `{"valid": true}`,
		},
		{
			name:               "invalid request",
			requestBody:        `{"name": "nob", "password": "passwd"`, // 末尾の"}"なし
			setupMock:          func(mock *mockAuthUsecase) {},
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       `{"message": "Bad request"}`,
		},
	}

	for _, testcase := range tests {

		req := httptest.NewRequest(
			http.MethodPost,
			"/login",
			bytes.NewBuffer([]byte(testcase.requestBody)),
		)
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := echo.New().NewContext(req, rec)

		mockUsecase := new(mockAuthUsecase)
		testcase.setupMock(mockUsecase)
		h := NewAuthHandler(mockUsecase)

		if assert.NoError(t, h.Login(c)) {
			assert.Equal(t, testcase.expectedStatusCode, rec.Code)
			assert.JSONEq(t, testcase.expectedBody, rec.Body.String())
		}
	}
}

func Test_AuthHandler_Me(t *testing.T) {

	tests := []struct {
		name               string                      // テストケース名
		requestParam       map[string]string           // リクエストパラメータ
		setupMock          func(mock *mockAuthUsecase) // モック設定
		expectedStatusCode int                         // 期待されるHTTPステータス
		expectedBody       string                      // 期待されるレスポンスボディ
	}{
		{
			name:         "success",
			requestParam: map[string]string{"name": "nob"},
			setupMock: func(mock *mockAuthUsecase) {
				mock.On("Me", payload.NewMeIn("nob")).Return(payload.NewMeOut("nob", 13), nil)
			},
			expectedStatusCode: http.StatusOK,
			expectedBody:       `{"name": "nob", "age": 13}`,
		},
		{
			name:         "usecase error",
			requestParam: map[string]string{"name": "nob"},
			setupMock: func(mock *mockAuthUsecase) {
				mock.On("Me", payload.NewMeIn("nob")).Return(
					*new(payload.MeOut),
					errors.New("不正なユーザ名です。"),
				)
			},
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       `{"message": "Internal server error"}`,
		},
	}

	for _, testcase := range tests {

		q := make(url.Values)
		q.Set("name", testcase.requestParam["name"])
		req := httptest.NewRequest(http.MethodGet, "/me?"+q.Encode(), nil)
		rec := httptest.NewRecorder()
		c := echo.New().NewContext(req, rec)

		mockUsecase := new(mockAuthUsecase)
		testcase.setupMock(mockUsecase)
		h := NewAuthHandler(mockUsecase)

		if assert.NoError(t, h.Me(c)) {
			assert.Equal(t, testcase.expectedStatusCode, rec.Code)
			assert.JSONEq(t, testcase.expectedBody, rec.Body.String())
		}
	}
}
```

### API ドキュメントについて

API ドキュメントの記法については [echo-swagger](https://github.com/swaggo/echo-swagger) を参照ください。ほとんど標準ライブラリ利用時のそれと変わりません。
