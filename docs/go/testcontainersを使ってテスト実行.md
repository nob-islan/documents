# testcontainers を使ってテスト実行

テスト実行時のみデータベースコンテナを作成してテストを行うためのサンプルコードです。

repository についてはテスト向けのデータベースが必要となります。

## パッケージインストール

```shell
go get github.com/testcontainers/testcontainers-go/modules/mariadb
go get github.com/docker/docker/client
```

## テストデータベース作成

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
	const dbName string = "snaildb"
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
