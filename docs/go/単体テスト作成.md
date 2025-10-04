# 単体テスト

単体テストの書き方およびカバレッジの確認方法を説明します。

## 事前準備

**testify**をインストールします。

```shell
go get github.com/stretchr/testify
```

## 作成手順

### handler テスト作成

http 通信を行う handler のテスト作成例です。

#### usecase のモック化

usecase のモック構造体を定義し、各メソッドを mock を使って実装します。

```go
// モックの定義
type MockUserinfoUsecase struct {
    mock.Mock
}

func (m *MockUserinfoUsecase) Search(in inout.UserSearchIn) (inout.UserSearchOut, error) {
    args := m.Called(in)
    return args.Get(0).(inout.UserSearchOut), args.Error(1)
}

// 省略
```

#### テストケースの定義

テストケースを表す構造体を定義し、必要なケースを作成していきます。

```go
	tests := []struct {
		name               string                          // テストケース名
		requestParam       map[string]string               // リクエストパラメータ
		setupMock          func(mock *MockUserinfoUsecase) // モック設定
		expectedStatusCode int                             // 期待されるHTTPステータス
		expectedBody       string                          // 期待されるレスポンスボディ
	}{
		{
			name:         "success",
			requestParam: map[string]string{"username": "testnob"},
			setupMock: func(mock *MockUserinfoUsecase) {
				mock.On(
					"Search",
					payload.UserSearchIn{
						Username: "testnob",
					},
				).Return(
					payload.UserSearchOut{
						Users: []types.User{{Id: 1, Username: "testnob", Age: 13}},
					},
					nil,
				)
			},
			expectedStatusCode: http.StatusOK,
			expectedBody:       `{"users":[{"age":13,"id":1,"username":"testnob"}]}`,
		},
    }
```

#### テスト実行

testcase に沿ってテストを実行していきます。

```go
	for _, testcase := range tests {

		// モックusecase初期化
		mockUsecase := new(MockUserinfoUsecase)

		t.Run(testcase.name, func(t *testing.T) {
			// モックの期待される動作を定義
			testcase.setupMock(mockUsecase)

			// handlerの初期化
			h := NewUserinfoHandler(mockUsecase)

			// リクエストとレスポンスの準備
			uri := "/userinfo?username=" + testcase.requestParam["username"]
			req := httptest.NewRequest(http.MethodGet, uri, nil)
			res := httptest.NewRecorder()

			// handlerの実行
			h.Search(res, req)

			// レスポンスの検証
			assert.Equal(t, testcase.expectedStatusCode, res.Code)
			if testcase.expectedBody != "" {
				assert.JSONEq(t, testcase.expectedBody, res.Body.String())
			}
		})
	}
```

### usecase テスト作成

業務処理を行う usecase のテスト作成例です。

#### repository のモック化

repository のモック構造体を定義し、各メソッドを mock を使って実装します。書き方は usecase のモック化と同様です。

#### テストケースの定義

テストケースを表す構造体を定義し、必要なケースを作成していきます。

```go
	tests := []struct {
		name          string                             // テストケース名
		requestBody   payload.UserSearchIn               // リクエストボディ
		setupMock     func(mock *MockUserinfoRepository) // モック設定
		expectedBody  payload.UserSearchOut              // 期待されるレスポンスボディ
		expectedError error                              // 期待されるエラー
	}{
		{
			name:        "success",
			requestBody: payload.UserSearchIn{Username: "testnob"},
			setupMock: func(mock *MockUserinfoRepository) {
				mock.On(
					"SelectByUsername",
					"testnob",
				).Return([]domain.Userinfo{{Id: 706, Username: "testnob", Age: 13}}, nil)
			},
			expectedBody: payload.UserSearchOut{
				Users: []types.User{
					{
						Id:       706,
						Username: "testnob",
						Age:      13,
					},
				},
			},
			expectedError: nil,
		}
    }
```

#### テスト実行

testcase に沿ってテストを実行していきます。

```go
	for _, testcase := range tests {

		// モックリポジトリ初期化
		mockRepository := new(MockUserinfoRepository)

		t.Run(testcase.name, func(t *testing.T) {
			// モックの期待される動作を定義
			testcase.setupMock(mockRepository)

			// usecaseの初期化
			s := NewUserinfoUsecase(mockRepository)

			// usecaseの実行
			result, err := s.Search(testcase.requestBody)

			// レスポンスの検証
			assert.Equal(t, testcase.expectedBody, result)
			assert.Equal(t, testcase.expectedError, err)
		})
	}
```

### repository テスト作成

データベースへのアクセスを行う repository のテスト作成例です。

#### 一時データベース準備

テスト向けの一時的なデータベースを用意するため、**sqlite3**をインストールします。

```shell
go get github.com/mattn/go-sqlite3
```

テスト向けインメモリデータベース作成用の関数を定義します。`schema.sql`にスキーマ定義、`data.sql`にテストデータの SQL を記載しています。一部 SQLite 特有の記法が必要なため注意してください。

```go

import (
	_ "github.com/mattn/go-sqlite3"
)

// テスト用データベースに接続します。
func connectTestDB(t *testing.T) *sql.DB {

    db, err := sql.Open("sqlite3", ":memory:")
    if err != nil {
        t.Fatalf("failed to open in-memory db: %v", err)
    }

    // schema.sql を読み込み・実行
    schema, err := os.ReadFile("testdata/userinfo/schema.sql")
    if err != nil {
        t.Fatalf("failed to read schema: %v", err)
    }
    _, err = db.Exec(string(schema))
    if err != nil {
        t.Fatalf("failed to execute schema: %v", err)
    }

    // data.sql を読み込み・実行
    data, err := os.ReadFile("testdata/userinfo/data.sql")
    if err != nil {
        t.Fatalf("failed to read data: %v", err)
    }
    _, err = db.Exec(string(data))
    if err != nil {
        t.Fatalf("failed to execute data: %v", err)
    }

    return db
}
```

#### テストケースの定義

テストケースを表す構造体を定義し、必要なケースを作成していきます。

```go
	tests := []struct {
		name                 string            // テストケース名
		queryParam           string            // クエリパラメータ
		setup                func(db *sql.DB)  // 事前セットアップ関数
		expectedBody         []domain.Userinfo // 期待されるレスポンスボディ
		expectedErrorMessage string            // 期待されるエラーメッセージ
	}{
		{
			name:       "success",
			queryParam: "testnob",
			setup:      func(db *sql.DB) {},
			expectedBody: []domain.Userinfo{
				{
					Id:       1,
					Username: "testnob01",
					Age:      13,
				}, {
					Id:       2,
					Username: "testnob02",
					Age:      14,
				},
			},
			expectedErrorMessage: "",
		}
    }
```

#### テスト実行

testcase に沿ってテストを実行していきます。

```go
	for _, testcase := range tests {

		t.Run(testcase.name, func(t *testing.T) {

			// テストデータベースおよびrepository初期化
			db := util.ConnectTestDB(t, "userinfo")
			r := NewUserinfoRepository(db)

			// 事前セットアップ
			testcase.setup(db)

			// repositoryの実行
			result, err := r.SelectByUsername(testcase.queryParam)

			// レスポンスの確認
			assert.Equal(t, testcase.expectedBody, result)
			if err != nil {
				assert.Equal(t, testcase.expectedErrorMessage, err.Error())
			}
		})
	}
```

## テスト起動

```shell
# 特定のディレクトリ内の関数をテストする場合
go test {テスト対象ディレクトリ}

# 全ての関数をテストする場合
go test ./...
```

## カバレッジ出力

- カバレッジレポートをテキストファイルで出力します（下記は handler の例）:

```shell
go test -cover -coverprofile=./handler/coverage.txt ./handler/
```

- カバレッジレポートを html で出力します:

```shell
go tool cover -html=./handler/coverage.txt -o ./handler/coverage.html
```
