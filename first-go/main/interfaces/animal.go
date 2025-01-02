package interfaces

import "fmt"

// 動物の動作のインターフェース
type Animal interface {
	// 種族名
	Kind() string
	// 鳴く
	Bark() string
}

// 動物のアクションを実行します。
func Action(a Animal) {
	fmt.Printf("%v, %s, %s \n", a.Kind(), a, a.Bark())
}
