package log_driver

import "github.com/eolinker/eosc"

var (
	defaultFactoryManager = NewFactoryManager()
)

type IFactory interface {
	Create(config string) (ILogDriver, map[string]interface{}, error)
}

type factoryManager struct {
	factories eosc.Untyped[string, IFactory]
}

func NewFactoryManager() *factoryManager {
	return &factoryManager{factories: eosc.BuildUntyped[string, IFactory]()}
}

func (m *factoryManager) Set(name string, factory IFactory) {
	m.factories.Set(name, factory)
}

func (m *factoryManager) Get(name string) (IFactory, bool) {
	return m.factories.Get(name)
}

func RegisterFactory(name string, factory IFactory) {
	defaultFactoryManager.Set(name, factory)
}

func GetFactory(name string) (IFactory, bool) {
	return defaultFactoryManager.Get(name)
}

func Drivers() []string {
	return defaultFactoryManager.factories.Keys()
}
