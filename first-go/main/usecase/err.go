package usecase

import (
	"first-go/err"
	"fmt"
	"time"
)

// isEvenを呼んでエラーハンドリングします。
func HandleMyError(i int) {
	result, error := isEven(i)
	if error != nil {
		fmt.Println(error)
	} else {
		fmt.Println(result)
	}
}

// 入力値が偶数であればSuccess, 奇数であれば例外を返します。
func isEven(i int) (string, error) {
	if i%2 == 0 {
		return "Success!", nil
	} else {
		return "", err.MyError{When: time.Now(), Cause: "Input number is not even"}
	}
}
