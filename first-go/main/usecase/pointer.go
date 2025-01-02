package usecase

import "fmt"

// ポインタに関するアレコレ
func InspectPointer() {

	// 検証対象の数値
	i := 42
	// ポインタを取得し、ポインタの値およびポインタの指す先の変数の値を画面表示
	pointer := &i
	fmt.Println("pointer of i: ", pointer, "; value of i: ", *pointer)

	// ポインタを使って変数を代入し、再度上記項目を表示
	*pointer = 21
	fmt.Println("pointer of i: ", pointer, "; value of i: ", *pointer)
}
