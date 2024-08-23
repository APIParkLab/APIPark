package driver

import (
	"errors"

	"github.com/eolinker/eosc"
)

var (
	ErrDriverNotFound = errors.New("driver not found")
)

type Manager struct {
	drivers eosc.Untyped[string, IDriver]
}

var (
	manager = NewManager()
)

func NewManager() *Manager {
	return &Manager{
		drivers: eosc.BuildUntyped[string, IDriver](),
	}
}

func (m *Manager) Register(driver IDriver) {
	m.drivers.Set(driver.Name(), driver)
}

func (m *Manager) Get(name string) (IDriver, bool) {
	return m.drivers.Get(name)
}

func (m *Manager) Names() []string {
	return m.drivers.Keys()
}

func Get(name string) (IDriver, bool) {
	return manager.Get(name)
}

func Register(driver IDriver) {
	manager.Register(driver)
}

func CreateExecutor(name string, cfg string) (IExecutor, error) {
	d, has := manager.Get(name)
	if !has {
		return nil, ErrDriverNotFound
	}
	return d.Create(cfg)
}

func Check(name string, cfg string) error {
	d, has := manager.Get(name)
	if !has {
		return ErrDriverNotFound
	}
	return d.Check(cfg)
}
