package auth

import "github.com/eolinker/eosc"

type IAuthDriver interface {
	Name() string
	ToPattern(cfg map[string]interface{}) interface{}
	ToConfig(cfg map[string]interface{}) interface{}
}

type DriverManager struct {
	drivers eosc.Untyped[string, IAuthDriver]
}

func NewAuthDriverManager() *DriverManager {
	return &DriverManager{
		drivers: eosc.BuildUntyped[string, IAuthDriver](),
	}
}

var (
	authDriverManager = NewAuthDriverManager()
)

func (a *DriverManager) Register(name string, driver IAuthDriver) {
	a.drivers.Set(name, driver)
}

func (a *DriverManager) Get(name string) (IAuthDriver, bool) {
	return a.drivers.Get(name)
}

func Register(name string, driver IAuthDriver) {
	authDriverManager.Register(name, driver)
}

func Get(name string) (IAuthDriver, bool) {
	return authDriverManager.Get(name)
}
