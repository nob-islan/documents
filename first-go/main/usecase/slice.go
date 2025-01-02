package usecase

import (
	"first-go/model"
	"fmt"
)

// string型のsliceの情報を出力します。
func PrintStringSliceInfo(s []string) {

	// slice本体
	fmt.Printf("The slice is %s \n", s)
	// length
	fmt.Printf("The length is %d \n", len(s))
	// capacity
	fmt.Printf("The capacity is %d \n", cap(s))
}

// int型のsliceの情報を出力します。
func PrintIntSliceInfo(s []int) {

	// slice本体
	fmt.Printf("The slice is %d \n", s)
	// length
	fmt.Printf("The length is %d \n", len(s))
	// capacity
	fmt.Printf("The capacity is %d \n", cap(s))
}

// ユーザのリストを出力します。
func PrintUsers(u []model.User) {

	for i, user := range u {
		fmt.Println(i, user)
	}
}
