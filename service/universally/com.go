package universally

import "github.com/eolinker/go-common/store"

const (
	SoftDeleteField = "is_delete"
	SoftDeleteWhere = "is_delete = false"
)

func assert(e any) {
	if _, ok := e.(store.Table); !ok {
		panic("not implement store.Table")
	}
}
func idValue(v any) int64 {
	return (v.(store.Table)).IdValue()
}
