package commit

import "sync"

var (
	lock    sync.Mutex
	onceMap = make(map[string]struct{})
)

func onceMigrate(key string, f func()) {
	lock.Lock()
	defer lock.Unlock()
	if _, ok := onceMap[key]; ok {
		return
	}
	f()
	onceMap[key] = struct{}{}
}
