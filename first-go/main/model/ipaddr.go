package model

import "fmt"

type IPaddr [4]byte

// 数値の配列をIPアドレスの形式にフォーマットして返します。
func (ip IPaddr) String() string {
	return fmt.Sprintf("%d.%d.%d.%d", ip[0], ip[1], ip[2], ip[3])
}
