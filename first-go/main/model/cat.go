package model

// 猫の構造体
type Cat struct {
	Name string
}

// 猫の種族名
func (cat Cat) Kind() string {
	return "cat"
}

// 猫の鳴き声
func (cat Cat) Bark() string {
	return "meow"
}
