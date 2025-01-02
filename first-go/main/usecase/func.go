package usecase

import "fmt"

// 数値yをx倍した値を返します。
func times(x, y int) {

	fmt.Println(y * x)
}

// 数値をv倍する関数を返します。
func GetTimesFunc(v int) func(w int) {

	// v倍する関数を宣言
	vTime := func(w int) {
		times(v, w)
	}

	return vTime
}

// sumにxを足します。
func adder() func(x int) int {
	sum := 0
	return func(x int) int {
		sum += x
		return sum
	}
}

// adderを使って1~10までの値を足し上げます。
func UseAdder() {

	adder := adder()

	for i := 1; i <= 10; i++ {
		fmt.Println(adder(i))
	}
}

// フィボナッチ数列の第n項を計算します。
func calcFibonacciNextVal() func() int {
	i := 0 // n-2項
	j := 1 // n-1項

	return func() int {
		k := i + j // n項目
		i = j      // iをn-1項目とする
		j = k      // n項目

		return k
	}
}

// calcFibonacciNextValを使ってフィボナッチ数列を出力します。
func Fibonacci() {

	calc := calcFibonacciNextVal()

	for i := 1; i < 10; i++ {
		fmt.Println(calc())
	}
}
