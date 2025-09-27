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
        ├── model
        │   └── userinfo_model.go
        ├── router
        │   ├── base.go
        │   └── userinfo_router.go
        ├── userinfo_handler.go
        └── userinfo_handler_test.go
```

### 実装

#### main.go

```go
package main

import "firstecho/internal/handler/router"

func main() {

	e := router.Routing()
	e.Logger.Fatal(e.Start(":8080"))
}
```

#### base.go

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

	NewUserinfoRouter().SetRouting(e)

	return e
}
```

#### userinfo_router.go

```go
package router

import (
	"firstecho/internal/handler"
	"firstecho/internal/usecase"

	"github.com/labstack/echo/v4"
)

type userinfoRouter struct{}

func NewUserinfoRouter() Router {
	return &userinfoRouter{}
}

func (r *userinfoRouter) SetRouting(e *echo.Echo) {

	h := handler.NewUserinfoHandler(usecase.NewUserinfoUsecase())

	e.GET(basePath+"/userinfo", h.Search)
	e.POST(basePath+"/userinfo", h.Regist)
}
```

#### userinfo_handler.go

```go
package handler

import (
	"firstecho/internal/handler/model"
	"firstecho/internal/usecase"
	"firstecho/internal/usecase/payload"
	"net/http"

	"github.com/labstack/echo/v4"
)

type UserinfoHandler interface {
	Search(c echo.Context) error
	Regist(c echo.Context) error
}

type userinfoHandler struct {
	u usecase.UserinfoUsecase
}

func NewUserinfoHandler(u usecase.UserinfoUsecase) UserinfoHandler {
	return &userinfoHandler{u: u}
}

func (h *userinfoHandler) Search(c echo.Context) error {

	req := model.NewUserSearchReq(c)

    // usecase呼び出し 業務エラー発生時はStatus500を返す
	out, err := h.u.Search(payload.NewUserSearchIn(req.Username))
	if err != nil {
		return c.JSON(
			http.StatusInternalServerError,
			echo.NewHTTPError(
				http.StatusInternalServerError,
				"Internal server error",
			),
		)
	}

	return c.JSON(http.StatusOK, model.NewUserSearchRes(out.Users()))
}

func (h *userinfoHandler) Regist(c echo.Context) error {

    // jsonパース エラー発生時はStatus400を返す
	req, err := model.NewUserRegistReq(c)
	if err != nil {
		return c.JSON(
			http.StatusBadRequest,
			echo.NewHTTPError(
				http.StatusBadRequest,
				"Bad request",
			),
		)
	}

    // usecase呼び出し 業務エラー発生時はStatus500を返す
	out, err := h.u.Regist(payload.NewUserRegistIn(req.Username, req.Age))
	if err != nil {
		return c.JSON(
			http.StatusInternalServerError,
			echo.NewHTTPError(
				http.StatusInternalServerError,
				"Internal server error",
			),
		)
	}

	return c.JSON(http.StatusOK, model.NewUserRegistRes(out.Message()))
}
```

#### userinfo_model.go

```go
package model

import (
	"errors"
	"firstecho/internal/types"

	"github.com/labstack/echo/v4"
)

type UserSearchReq struct {
	Username string `json:"username"`
}

func NewUserSearchReq(c echo.Context) UserSearchReq {
	return UserSearchReq{Username: c.QueryParam("username")}
}

type UserSearchRes struct {
	Users []types.User `json:"users"`
}

func NewUserSearchRes(users []types.User) UserSearchRes {
	return UserSearchRes{Users: users}
}

type UserRegistReq struct {
	Username string `json:"username"`
	Age      int    `json:"age"`
}

func NewUserRegistReq(c echo.Context) (UserRegistReq, error) {

	req := new(UserRegistReq)
	if err := c.Bind(req); err != nil {
		return UserRegistReq{}, errors.New("failed to bind request")
	}

	return *req, nil
}

type UserRegistRes struct {
	Message string `json:"message"`
}

func NewUserRegistRes(message string) UserRegistRes {
	return UserRegistRes{Message: message}
}
```

#### userinfo_handler_test.go

```go
package handler

import (
	"bytes"
	"errors"
	"firstecho/internal/types"
	"firstecho/internal/usecase/payload"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockUserinfoUsecase struct {
	mock.Mock
}

func (m *MockUserinfoUsecase) Search(in payload.UserSearchIn) (payload.UserSearchOut, error) {
	args := m.Called(in)
	return args.Get(0).(payload.UserSearchOut), args.Error(1)
}

func (m *MockUserinfoUsecase) Regist(in payload.UserRegistIn) (payload.UserRegistOut, error) {
	args := m.Called(in)
	return args.Get(0).(payload.UserRegistOut), args.Error(1)
}

func Test_UserinfoHandler_Search(t *testing.T) {

	tests := []struct {
		name               string
		requestParam       map[string]string
		setupMock          func(mock *MockUserinfoUsecase)
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:         "success",
			requestParam: map[string]string{"username": "testnob"},
			setupMock: func(mock *MockUserinfoUsecase) {
				mock.On(
					"Search",
					payload.NewUserSearchIn("testnob"),
				).Return(
					payload.NewUserSearchOut([]types.User{types.NewUser(1, "testnob", 13)}),
					nil,
				)
			},
			expectedStatusCode: http.StatusOK,
			expectedBody:       `{"users":[{"age":13,"id":1,"username":"testnob"}]}`,
		},
		{
			name:         "usecase error",
			requestParam: map[string]string{"username": "testnob"},
			setupMock: func(mock *MockUserinfoUsecase) {
				mock.On(
					"Search",
					payload.NewUserSearchIn("testnob"),
				).Return(payload.NewUserSearchOut(nil), errors.New("test error"))
			},
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       `{"message":"Internal server error"}`,
		},
	}

	for _, testcase := range tests {

		q := make(url.Values)
		q.Set("username", testcase.requestParam["username"])
		req := httptest.NewRequest(http.MethodGet, "/?"+q.Encode(), nil)
		rec := httptest.NewRecorder()
		c := echo.New().NewContext(req, rec)

		mockUsecase := new(MockUserinfoUsecase)
		testcase.setupMock(mockUsecase)
		h := NewUserinfoHandler(mockUsecase)

		if assert.NoError(t, h.Search(c)) {
			assert.Equal(t, testcase.expectedStatusCode, rec.Code)
			assert.JSONEq(t, testcase.expectedBody, rec.Body.String())
		}
	}
}

func Test_UserinfoHandler_Regist(t *testing.T) {

	tests := []struct {
		name               string
		requestBody        string
		setupMock          func(mock *MockUserinfoUsecase)
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:        "success",
			requestBody: `{"username": "testnob", "age": 13}`,
			setupMock: func(mock *MockUserinfoUsecase) {
				mock.On(
					"Regist",
					payload.NewUserRegistIn("testnob", 13),
				).Return(payload.NewUserRegistOut("Success"), nil)
			},
			expectedStatusCode: http.StatusOK,
			expectedBody:       `{"message":"Success"}`,
		},
		{
			name:               "invalid request",
			requestBody:        `{"username": "testnob",`,
			setupMock:          func(mock *MockUserinfoUsecase) {},
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       `{"message":"Bad request"}`,
		},
		{
			name:        "usecase error",
			requestBody: `{"username": "testnob", "age": 13}`,
			setupMock: func(mock *MockUserinfoUsecase) {
				mock.On(
					"Regist",
					payload.NewUserRegistIn("testnob", 13),
				).Return(payload.NewUserRegistOut(""), errors.New("test error"))
			},
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       `{"message":"Internal server error"}`,
		},
	}

	for _, testcase := range tests {

		req := httptest.NewRequest(
			http.MethodPost,
			"/userinfo",
			bytes.NewBuffer([]byte(testcase.requestBody)),
		)
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := echo.New().NewContext(req, rec)

		mockUsecase := new(MockUserinfoUsecase)
		testcase.setupMock(mockUsecase)
		h := NewUserinfoHandler(mockUsecase)

		if assert.NoError(t, h.Regist(c)) {
			assert.Equal(t, testcase.expectedStatusCode, rec.Code)
			assert.JSONEq(t, testcase.expectedBody, rec.Body.String())
		}
	}
}
```

### API ドキュメントについて

API ドキュメントの記法については [echo-swagger](https://github.com/swaggo/echo-swagger) を参照ください。ほとんど標準ライブラリ利用時のそれと変わりません。
