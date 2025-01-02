package usecase

import (
	"fmt"
	"strings"
)

// サンプルのmap
var m = map[int]string{
	1: "one",
	2: "two",
	3: "three",
}

// mapについてキーに対する値が存在するかを確認します。
func ExistElement(x int) bool {

	_, exist := m[x]
	return exist
}

// mapのキーとそれに対応する値を出力します。
func PrintElements() {

	for i, j := range m {
		fmt.Println(i, "->", j)
	}
}

// 入力された文章について、各単語の出現回数を返すmapを作成します。
func WordCount(x string) map[string]int {

	// 返却値を宣言
	wordCountMap := make(map[string]int)

	// 入力された文章を配列化
	wordArray := strings.Fields(x)
	// 各単語についてmapを作成
	for _, word := range wordArray {
		_, exist := wordCountMap[word]
		if exist {
			wordCountMap[word] = wordCountMap[word] + 1
		} else {
			wordCountMap[word] = 1
		}
	}

	return wordCountMap
}
