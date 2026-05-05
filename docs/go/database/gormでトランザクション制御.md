# gormでトランザクション制御

cf. https://gorm.io/docs/transactions.html

## 実装

- `infrastructure/tx_manager.go`を新規作成します:

```go
package infrastructure

import (
	"context"

	"gorm.io/gorm"
)

// トランザクション管理のインターフェースです。
type TxManager interface {
	WithTransaction(ctx context.Context, f func(ctx context.Context) error) error
}

type txManager struct {
	db *gorm.DB
}

func NewTxManager(db *gorm.DB) TxManager {
	return &txManager{db: db}
}

// トランザクションを開始しつつ業務処理を実行します。
// エラー発生時はロールバックが実行されます。
func (t *txManager) WithTransaction(ctx context.Context, f func(ctx context.Context) error) error {

	if existingTx := GetTx(ctx); existingTx != nil {
		return f(ctx)
	}

	return t.db.Transaction(func(tx *gorm.DB) error {
		ctxWithTx := context.WithValue(ctx, txKey{}, tx)
		return f(ctxWithTx)
	})
}

type txKey struct{}

// コンテキストからトランザクションを取得します。
// トランザクションがない場合はnilを返します。
func GetTx(ctx context.Context) *gorm.DB {

	tx, ok := ctx.Value(txKey{}).(*gorm.DB)
	if !ok {
		return nil
	}
	return tx
}

// コンテキストにトランザクションをセットします。
func SetTx(ctx context.Context, tx *gorm.DB) context.Context {
	return context.WithValue(ctx, txKey{}, tx)
}
```

- `persistence`配下のsqlについて、トランザクションを取得する処理を追記します:

```go
package persistence

import (
	"context"
	"easyapp/internal/infrastructure"
	"easyapp/internal/infrastructure/persistence/table"

	"gorm.io/gorm"
)

type UsersSql interface {

	// ユーザ情報を保存します。
	Save(ctx context.Context, u table.Users) error
}

type usersSql struct {
	db *gorm.DB
}

func NewUsersSql(db *gorm.DB) UsersSql {
	return &usersSql{db: db}
}

func (s *usersSql) Save(ctx context.Context, u table.Users) error {

	// トランザクションがあれば取得
	db := s.db
	if tx := infrastructure.GetTx(ctx); tx != nil {
		db = tx
	}

	if err := gorm.G[table.Users](db).Create(ctx, &u); err != nil {
		return err
	}

	return nil
}
```

- `usecase`でトランザクションを管理します。`txManager`を構造体に含め、`WithTransaction`で業務処理をラップします:

```go
package usecase

import (
	"context"
	"easyapp/internal/domain"
	"easyapp/internal/infrastructure"
	"easyapp/internal/usecase/params"
)

type UserUsecase interface {

	// ユーザ情報を保存します。
	RegistUser(ctx context.Context, in params.RegistUserIn) (params.RegistUserOut, error)
}

type userUsecase struct {
	userRepository domain.UserRepository
	txManager      infrastructure.TxManager
}

func NewUserUsecase(
	userRepository domain.UserRepository,
	txManager infrastructure.TxManager,
) UserUsecase {
	return &userUsecase{userRepository: userRepository, txManager: txManager}
}

func (u *userUsecase) RegistUser(
	ctx context.Context,
	in params.RegistUserIn,
) (
	params.RegistUserOut,
	error,
) {

	// トランザクションを開始しつつ業務処理を実行
	if err := u.txManager.WithTransaction(ctx, func(ctx context.Context) error {
		return u.userRepository.Save(ctx, domain.NewUser(in.Name(), in.Password(), in.Age()))
	}); err != nil {
		return params.NewRegistUserOut(false), err
	}

	return params.NewRegistUserOut(true), nil
}
```

## テスト

- `users_sql_test.go`

```go
package persistence

import (
	"context"
	"easyapp/internal/infrastructure"
	"easyapp/internal/infrastructure/persistence/table"
	"easyapp/internal/infrastructure/persistence/test"
	"errors"
	"testing"

	"github.com/mattn/go-sqlite3"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func TestSave(t *testing.T) {

	tests := []struct {
		name          string            // テストケース名
		withTx        bool              // トランザクション有無
		users         table.Users       // 入力値
		setup         func(db *gorm.DB) // 事前セットアップ関数
		expectedError error             // 期待されるエラー
	}{
		{
			name:          "success without tx",
			withTx:        false,
			users:         table.Users{Name: "nob", Password: "passwd", Age: 13},
			setup:         func(db *gorm.DB) {},
			expectedError: nil,
		},
		{
			name:          "success with tx",
			withTx:        true,
			users:         table.Users{Name: "nob", Password: "passwd", Age: 13},
			setup:         func(db *gorm.DB) {},
			expectedError: nil,
		},
		{
			name:   "failed to query",
			withTx: false,
			users:  table.Users{Name: "nob", Password: "passwd", Age: 13},
			setup: func(db *gorm.DB) {
				db.Exec("DROP TABLE users") // クエリエラーのためにテーブル破棄
			},
			expectedError: sqlite3.Error{},
		},
	}

	for _, testcase := range tests {

		t.Run(testcase.name, func(t *testing.T) {

			// テストデータベースに接続
			db := test.ConnectTestDB(t, "users")

			// 事前セットアップ
			testcase.setup(db)

			ctx := context.Background()

			// トランザクション開始
			if testcase.withTx {
				tx := db.Begin()
				ctx = infrastructure.SetTx(context.Background(), tx)
			}

			// sqlの実行
			result := NewUsersSql(db).Save(ctx, testcase.users)

			// レスポンスの確認
			if result != nil {
				var sqliteError sqlite3.Error
				errors.As(result, &sqliteError)
			} else {
				assert.Equal(t, testcase.expectedError, result)
			}

		})
	}
}
```

- `user_usecase_test.go`

```go
package usecase

import (
	"context"
	"easyapp/internal/domain"
	"easyapp/internal/usecase/params"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// repositoryモックの定義
type mockUserRepository struct {
	mock.Mock
}

func (m *mockUserRepository) Save(ctx context.Context, u domain.User) error {
	args := m.Called(ctx, u)
	return args.Error(0)
}

// txManagerモックの定義
type mockTxManager struct{}

// 関数fの結果を返すようにモック化
func (m *mockTxManager) WithTransaction(
	ctx context.Context,
	f func(ctx context.Context) error,
) error {
	return f(ctx)
}

// RegistUserのテスト
func TestRegistUser(t *testing.T) {

	tests := []struct {
		name                string                      // テストケース名
		requestBody         params.RegistUserIn         // リクエストボディ
		setupRepositoryMock func(m *mockUserRepository) // repositoryモック設定
		expectedBody        params.RegistUserOut        // 期待されるレスポンスボディ
		expectedError       error                       // 期待されるエラー
	}{
		{
			name:        "success",
			requestBody: params.NewRegistUserIn("nob", "passwd", 13),
			setupRepositoryMock: func(m *mockUserRepository) {
				m.On(
					"Save",
					mock.Anything,
					domain.NewUser("nob", "passwd", 13),
				).Return(
					nil,
				)
			},
			expectedBody:  params.NewRegistUserOut(true),
			expectedError: nil,
		},
		{
			name:        "repository error",
			requestBody: params.NewRegistUserIn("nob", "passwd", 13),
			setupRepositoryMock: func(m *mockUserRepository) {
				m.On(
					"Save",
					mock.Anything,
					domain.NewUser("nob", "passwd", 13),
				).Return(
					errors.New("repository error"),
				)
			},
			expectedBody:  params.NewRegistUserOut(false),
			expectedError: errors.New("repository error"),
		},
	}

	for _, testcase := range tests {

		// モック初期化
		mockRepository := new(mockUserRepository)
		mockTxManager := new(mockTxManager)

		t.Run(testcase.name, func(t *testing.T) {
			// モックの期待される動作を定義
			testcase.setupRepositoryMock(mockRepository)

			// usecaseの実行
			result, err := NewUserUsecase(mockRepository, mockTxManager).RegistUser(
				context.Background(),
				testcase.requestBody,
			)

			// レスポンスの検証
			assert.Equal(t, testcase.expectedBody, result)
			assert.Equal(t, testcase.expectedError, err)
		})
	}
}
```
