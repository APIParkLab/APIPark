package gateway

import (
	"fmt"

	"github.com/eolinker/eosc"
)

type IFactoryManager interface {
	Set(name string, factory IFactory)
	GetClient(name string, config *ClientConfig) (IClientDriver, error)
	Drivers() []string
}

var factoryManager = NewFactoryManager()

func NewFactoryManager() IFactoryManager {
	return &FactoryManager{factory: eosc.BuildUntyped[string, IFactory]()}
}

type FactoryManager struct {
	factory eosc.Untyped[string, IFactory]
}

func (f *FactoryManager) Drivers() []string {
	return f.factory.Keys()
}

func (f *FactoryManager) Set(name string, factory IFactory) {
	f.factory.Set(name, factory)
}

func (f *FactoryManager) GetClient(name string, config *ClientConfig) (IClientDriver, error) {
	factory, ok := f.factory.Get(name)
	if !ok {
		return nil, fmt.Errorf("client driver %s not found", name)
	}
	driver, err := factory.Create(config)
	if err != nil {
		return nil, fmt.Errorf("create client driver error: %w", err)
	}
	return driver, nil
}

type IFactory interface {
	Create(config *ClientConfig) (IClientDriver, error)
}

func Register(name string, factory IFactory) {
	factoryManager.Set(name, factory)
}

func GetClient(name string, config *ClientConfig) (IClientDriver, error) {
	return factoryManager.GetClient(name, config)
}

func Drivers() []string {
	return factoryManager.Drivers()
}
