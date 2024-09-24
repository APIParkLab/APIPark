package provider

import "github.com/eolinker/eosc"

var (
	defaultManager = NewManager()
)

type Manager struct {
	providers eosc.Untyped[string, IAIProvider]
}

func NewManager() *Manager {
	return &Manager{providers: eosc.BuildUntyped[string, IAIProvider]()}
}

func (m *Manager) Set(name string, driver IAIProvider) {
	m.providers.Set(name, driver)
}

func (m *Manager) Get(name string) (IAIProvider, bool) {
	return m.providers.Get(name)
}

func (m *Manager) Del(name string) {
	m.providers.Del(name)
}

func (m *Manager) List() []IAIProvider {
	return m.providers.List()
}

func Register(name string, driver IAIProvider) {
	defaultManager.Set(name, driver)
}

func GetProvider(name string) (IAIProvider, bool) {
	return defaultManager.Get(name)
}

func Providers() []IAIProvider {
	return defaultManager.List()
}
