package auth_driver

import "github.com/eolinker/eosc"

var (
	defaultManager = NewManager()
)

type Manager struct {
	authFactory eosc.Untyped[string, IFactory]
}

func NewManager() *Manager {
	return &Manager{
		authFactory: eosc.BuildUntyped[string, IFactory](),
	}
}

func (m *Manager) RegisterAuth(name string, auth IFactory) {
	m.authFactory.Set(name, auth)
}

func (m *Manager) GetAuth(name string) (IFactory, bool) {
	return m.authFactory.Get(name)
}

func GetAuthFactory(name string) (IFactory, bool) {
	return defaultManager.GetAuth(name)
}

func RegisterAuthFactory(name string, auth IFactory) {
	defaultManager.RegisterAuth(name, auth)
}
