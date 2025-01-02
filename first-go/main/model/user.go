package model

import "fmt"

// ユーザ
type User struct {
	Id   int
	Name string
	Age  int
}

// Userが若者かどうか判定するメソッド
func (u User) IsYoung() bool {
	const youngAge = 20
	return u.Age < youngAge
}

// getter
func (u User) GetName() string {
	return u.Name
}

// setter
func (u *User) SetName(name string) {
	u.Name = name
}

func (u User) String() string {
	return fmt.Sprintf("名前: %s, 年齢: %d", u.Name, u.Age)
}
