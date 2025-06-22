# 単体テスト

単体テストの書き方およびカバレッジの確認方法を説明します。

## 事前準備

**testify**をインストールします。

```shell
go get github.com/stretchr/testify
```

## 作成手順

### controller, service テスト作成

controller のテスト作成を例に解説します。

#### service のモック化

service のモック構造体を定義し、各メソッドを mock を使って実装します。

```go
// モックの定義
type MockUserInfoService struct {
    mock.Mock
}

func (m *MockUserInfoService) Search(in inout.UserSearchIn) (inout.UserSearchOut, error) {
    args := m.Called(in)
    return args.Get(0).(inout.UserSearchOut), args.Error(1)
}

// 省略
```

#### テストケースの定義

テストケースを表す構造体を定義し、必要なケースを作成していきます。

```go
tests := []struct {
    name               string               // テストケース名
    requestParam       reqres.UserSearchReq // リクエストパラメータ
    mockReturnOut      inout.UserSearchOut  // モック返却値
    mockReturnError    error                // モックエラー
    expectedStatusCode int                  // 期待されるHTTPステータス
    expectedBody       string               // 期待されるレスポンスボディ
}{
    {
        name:         "success",
        requestParam: reqres.UserSearchReq{Username: "testnob"},
        mockReturnOut: inout.UserSearchOut{
            Users: []dto.User{{Id: 1, Username: "testnob", Age: 13}},
        },
        mockReturnError:    nil,
        expectedStatusCode: http.StatusOK,
        expectedBody:       `{"users":[{"age":13,"id":1,"username":"testnob"}]}`,
    },
}
```

#### テスト実行

testcase に沿ってテストを実行していきます。

```go
// モックサービス初期化
mockService := new(MockUserInfoService)

for _, testcase := range tests {
    t.Run(testcase.name, func(t *testing.T) {
        // モックの期待される動作を定義
        mockService.On("Search", inout.UserSearchIn{Username: testcase.requestParam.Username}).Return(testcase.mockReturnOut, testcase.mockReturnError)

        // controllerの初期化
        h := &userInfoController{
            userInfoService: mockService,
        }

        // リクエストとレスポンスの準備
        uri := "/user?username=" + testcase.requestParam.Username
        req := httptest.NewRequest(http.MethodGet, uri, nil)
        res := httptest.NewRecorder()

        // ハンドラーの実行
        h.Search(res, req)

        // レスポンスの検証
        assert.Equal(t, testcase.expectedStatusCode, res.Code)
        if testcase.expectedBody != "" {
            assert.JSONEq(t, testcase.expectedBody, res.Body.String())
        }
    })
```

### repository テスト作成

テスト向けの一時的なデータベースを用意するため、**sqlite3**をインストールします。

```shell
go get github.com/mattn/go-sqlite3
```

テスト向けインメモリデータベース作成用の関数を定義します。`schema.sql`にスキーマ定義、`data.sql`にテストデータの SQL を記載しています。一部 SQLite 特有の記法が必要なため注意してください。

```go
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

#### テストケースの定義、テスト実行

controller, service と同様のため省略します。

## テスト起動

```shell
# 特定のディレクトリ内の関数をテストする場合
go test {テスト対象ディレクトリ}

# 全ての関数をテストする場合
go test ./...
```

## カバレッジ出力

- カバレッジレポートをテキストファイルで出力します（下記は controller の例）:

```shell
go test -cover -coverprofile=./controller/coverage.txt ./controller/
```

- カバレッジレポートを html で出力します:

```shell
go tool cover -html=./controller/coverage.txt -o ./controller/coverage.html
```
