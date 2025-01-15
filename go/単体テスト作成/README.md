# 単体テスト

単体テストの書き方およびカバレッジの確認方法を説明します。

## 事前準備

**testify**をインストールします。

```shell
go get github.com/stretchr/testify
```

## 作成手順

### handler, service テスト作成

handler のテスト作成を例に解説します。

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
for _, testcase := range tests {
    t.Run(testcase.name, func(t *testing.T) {
        // モックの期待される動作を定義
        mockService.On("Search", inout.UserSearchIn{Username: testcase.requestParam.Username}).Return(testcase.mockReturnOut, testcase.mockReturnError)

        // handlerの初期化
        h := &userInfoHandler{
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

repository についてはテスト向けのデータベースが必要となります。

#### テストデータベース作成

下記関数でテスト向けデータベースのコンテナを構築します。

```go
// テスト用データベースに接続します。
func connectTestDB(t *testing.T) *sql.DB {

	// コンテナ環境が無ければテストスキップ
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		t.Fatal(err)
	}
	_, err = cli.Ping(context.Background())
	if err != nil {
		t.Skip("コンテナ環境が無いためテストをスキップします。")
	}

	const image string = "mariadb:latest"
	const testdata string = "testdata"
	const testrepo string = "userinfo"
	const sqlFile string = "create-table.sql"
	const user string = "root"
	const password string = ""
	const host string = "localhost"
	const dbName string = "nobdb"
	const driverName string = "mysql"

	// MariaDBコンテナ起動
	ctx := context.Background()
	mariadbContainer, err := mariadb.Run(ctx,
		image,
		mariadb.WithScripts(filepath.Join(testdata, testrepo, sqlFile)), // 初期スクリプトのパス
		mariadb.WithUsername(user),
		mariadb.WithPassword(password),
		mariadb.WithDatabase(dbName),
	)
	if err != nil {
		t.Fatal(err)
	}

	// ポートをマッピング
	port, err := mariadbContainer.MappedPort(ctx, "3306")
	if err != nil {
		t.Fatal(err)
	}

	// データベースに接続
	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s", user, password, host+":"+port.Port(), dbName)
	db, err := sql.Open(driverName, dsn)
	if err != nil {
		t.Fatal(err)
	}

	// 実際に接続できるかを確認
	err = db.Ping()
	if err != nil {
		t.Fatal(err)
	}

	return db
}
```

各テストケースにて上記関数を呼び出してからテストを実行してください:

```go
// userInfoRepository_Insertのテスト
func Test_userInfoRepository_Insert(t *testing.T) {

	tests := []struct {
        // 省略
	}

	for _, testcase := range tests {

		t.Run(testcase.name, func(t *testing.T) {

			// テストデータベースおよびrepository初期化
			db := connectTestDB(t)
			r := &userInfoRepository{db: db}

			// repositoryの実行
			err := r.Insert(testcase.requestEntity)

			// レスポンスの確認
			assert.Equal(t, testcase.expectedError, err)
		})
	}
}
```

#### テストケースの定義、テスト実行

handler, service と同様のため省略します。

## カバレッジ出力

- カバレッジレポートをテキストファイルで出力します（下記は handler の例）:

  ```shell
  go test -cover -coverprofile=./handler/coverage.txt ./handler/
  ```

- カバレッジレポートを html で出力します:

  ```shell
  go tool cover -html=./handler/coverage.txt -o ./handler/coverage.html
  ```
