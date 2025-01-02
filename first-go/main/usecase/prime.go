package usecase

import "fmt"

// 素数かどうかを判定します。
func isPrime(x int) bool {

	var result bool = true
	var i int = 2

	for result && i < x {
		result = !(x%i == 0)
		i++
	}

	return result
}

// 指定された数値以下の素数を出力します。
func PrintPrimeNumbers(x int) {

	for i := 2; i < x; i++ {
		if isPrime(i) {
			fmt.Print(i, " ")
		}
	}
}
