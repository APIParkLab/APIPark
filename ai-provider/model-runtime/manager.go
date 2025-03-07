package model_runtime

import (
	"github.com/eolinker/eosc"
)

var (
	defaultManager = NewManager()
)

type Manager struct {
	providers eosc.Untyped[string, IProvider]
}

func NewManager() *Manager {
	return &Manager{providers: eosc.BuildUntyped[string, IProvider]()}
}

func (m *Manager) Set(name string, driver IProvider) {
	m.providers.Set(name, driver)
}

func (m *Manager) Get(name string) (IProvider, bool) {
	return m.providers.Get(name)
}

func (m *Manager) Del(name string) {
	m.providers.Del(name)
}

func (m *Manager) List() []IProvider {
	//list := m.providers.List()
	//sort.Slice(list, func(i, j int) bool {
	//	if list[i].Sort() == list[j].Sort() {
	//		return list[i].ID() < list[j].ID()
	//	}
	//	return list[i].Sort() < list[j].Sort()
	//})
	return m.providers.List()
}

func Register(name string, driver IProvider) {
	defaultManager.Set(name, driver)
}

func Remove(name string) {
	defaultManager.Del(name)
}

func GetProvider(name string) (IProvider, bool) {
	return defaultManager.Get(name)
}

func Providers() []IProvider {
	return defaultManager.List()
}
