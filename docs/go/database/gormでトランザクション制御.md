# gormでトランザクション制御

cf. https://gorm.io/docs/transactions.html

## 実装

- `internal/infrastructure/tx_manager.go`を新規作成します:

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

- `repository`配下のsqlについて、トランザクションを取得する処理を追記します:

```go
package repository

import (
	"context"
	"easyapp/internal/domain"
	"easyapp/internal/infrastructure"
	"easyapp/internal/infrastructure/persistence/table"

	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) domain.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Save(ctx context.Context, user domain.User) error {

	// トランザクションがあれば取得
	db := r.db
	if tx := infrastructure.GetTx(ctx); tx != nil {
		db = tx
	}

	return gorm.G[table.Users](db).Create(
		ctx,
		&table.Users{
			Name:     user.Name().Value(),
			Password: user.Password().Value(),
			Age:      user.Age().Value(),
		},
	)
}
```

- `usecase`でトランザクションを管理します。`txManager`を構造体に含め、`WithTransaction`で業務処理をラップします:

```go
package usecase

import (
	"context"
	"easyapp/internal/application/usecase/params"
	"easyapp/internal/domain"
	"easyapp/internal/infrastructure"
)

// 認証のusecaseインターフェースです。
type UserUsecase interface {

	// ユーザ情報を登録します。
	Regist(ctx context.Context, in params.RegistInput) (params.RegistOutput, error)
}

type userUsecase struct {
	userRepository domain.UserRepository
	txManager      infrastructure.TxManager
}

func NewUserUsecase(
	userRepository domain.UserRepository,
	txManager infrastructure.TxManager,
) UserUsecase {
	return &userUsecase{
		userRepository: userRepository,
		txManager:      txManager,
	}
}

func (u *userUsecase) Regist(ctx context.Context, in params.RegistInput) (params.RegistOutput, error) {

	// トランザクションを開始しつつ業務処理を実行
	if err := u.txManager.WithTransaction(ctx, func(ctx context.Context) error {
		return u.userRepository.Save(
			ctx,
			func() domain.User {
				u, _ := domain.NewUser(in.Name(), in.Password(), in.Age())
				return u
			}(),
		)
	}); err != nil {
		return params.NewRegistOutput(false), err
	}

	return params.NewRegistOutput(true), nil
}
```

## テスト

- `user_repository_test.go`

```go
package repository

import (
	"context"
	"easyapp/internal/domain"
	"easyapp/internal/infrastructure"
	"easyapp/internal/infrastructure/repository/testdata"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func TestSave(t *testing.T) {

	tests := []struct {
		name          string            // テストケース名
		ctx           context.Context   // コンテキスト
		withTx        bool              // トランザクション有無
		user          domain.User       // 入力値
		setup         func(db *gorm.DB) // 事前セットアップ関数
		expectedError error             // 期待されるエラー
	}{
		{
			name:   "SuccessWithoutTx",
			ctx:    context.Background(),
			withTx: false,
			user: func() domain.User {
				u, _ := domain.NewUser("nob", "passwd", 13)
				return u
			}(),
			setup:         func(db *gorm.DB) {},
			expectedError: nil,
		},
		{
			name:   "SuccessWithTx",
			ctx:    context.Background(),
			withTx: true,
			user: func() domain.User {
				u, _ := domain.NewUser("nob", "passwd", 13)
				return u
			}(),
			setup:         func(db *gorm.DB) {},
			expectedError: nil,
		},
	}

	for _, test := range tests {

		t.Run(test.name, func(t *testing.T) {
			// テストデータベースに接続
			db := testdata.ConnectTestDB(t, "user")

			// 事前セットアップ
			test.setup(db)

			// トランザクション開始
			if test.withTx {
				tx := db.Begin()
				test.ctx = infrastructure.SetTx(context.Background(), tx)
			}

			// sqlの実行
			result := NewUserRepository(db).Save(test.ctx, test.user)

			// レスポンスの確認
			assert.Equal(t, test.expectedError, result)
		})
	}
}
```

- `user_usecase_test.go`

```go
package usecase

import (
	"context"
	"easyapp/internal/application/usecase/params"
	"easyapp/internal/domain"
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
		requestBody         params.RegistInput          // リクエストボディ
		setupRepositoryMock func(m *mockUserRepository) // repositoryモック設定
		expectedBody        params.RegistOutput         // 期待されるレスポンスボディ
		expectedError       error                       // 期待されるエラー
	}{
		{
			name:        "Success",
			requestBody: params.NewRegistInput("nob", "passwd", 13),
			setupRepositoryMock: func(m *mockUserRepository) {
				m.On(
					"Save",
					mock.Anything,
					func() domain.User {
						u, _ := domain.NewUser("nob", "passwd", 13)
						return u
					}(),
				).Return(
					nil,
				)
			},
			expectedBody:  params.NewRegistOutput(true),
			expectedError: nil,
		},
		{
			name:        "RepositoryError",
			requestBody: params.NewRegistInput("nob", "passwd", 13),
			setupRepositoryMock: func(m *mockUserRepository) {
				m.On(
					"Save",
					mock.Anything,
					func() domain.User {
						u, _ := domain.NewUser("nob", "passwd", 13)
						return u
					}(),
				).Return(
					errors.New("repository error"),
				)
			},
			expectedBody:  params.NewRegistOutput(false),
			expectedError: errors.New("repository error"),
		},
	}

	for _, test := range tests {

		// モック初期化
		mockRepository := new(mockUserRepository)
		mockTxManager := new(mockTxManager)

		t.Run(test.name, func(t *testing.T) {
			// モックの期待される動作を定義
			test.setupRepositoryMock(mockRepository)

			// usecaseの実行
			result, err := NewUserUsecase(mockRepository, mockTxManager).Regist(
				context.Background(),
				test.requestBody,
			)

			// レスポンスの検証
			assert.Equal(t, test.expectedBody, result)
			assert.Equal(t, test.expectedError, err)
		})
	}
}
```
