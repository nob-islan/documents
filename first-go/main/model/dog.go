package model

// 犬の構造体
type Dog struct {
	Name string
}

// 犬の種族名
func (dog Dog) Kind() string {
	return "dog"
}

// 犬の鳴き声
func (dog Dog) Bark() string {
	return "bowwow"
}
