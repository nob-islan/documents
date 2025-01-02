package err

import (
	"fmt"
	"time"
)

// 初めての独自例外です。
type MyError struct {
	When  time.Time
	Cause string
}

func (e MyError) Error() string {
	return fmt.Sprintf("Time: %v, Cause: %s", e.When, e.Cause)
}
