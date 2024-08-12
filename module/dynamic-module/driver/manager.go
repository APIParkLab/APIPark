package driver

import "github.com/eolinker/eosc"

var (
	manager = NewManager()
)

func NewManager() *Manager {
	return &Manager{
		drivers:        eosc.BuildUntyped[string, IDriver](),
		driversByGroup: eosc.BuildUntyped[string, DynamicDrivers](),
	}
}

type DynamicDrivers eosc.Untyped[string, IDriver]

type Manager struct {
	drivers        DynamicDrivers
	driversByGroup eosc.Untyped[string, DynamicDrivers]
}

func (m *Manager) Register(driver IDriver) {
	m.drivers.Set(driver.Name(), driver)
	if drivers, ok := m.driversByGroup.Get(driver.Group()); ok {
		drivers.Set(driver.Name(), driver)
	} else {
		drivers = eosc.BuildUntyped[string, IDriver]()
		drivers.Set(driver.Name(), driver)
		m.driversByGroup.Set(driver.Group(), drivers)
	}
}

func (m *Manager) Get(name string) (IDriver, bool) {
	return m.drivers.Get(name)
}

func (m *Manager) List() []IDriver {
	return m.drivers.List()
}

func (m *Manager) ListByGroup(group string) []IDriver {
	if drivers, ok := m.driversByGroup.Get(group); ok {
		return drivers.List()
	}
	return nil
}

func (m *Manager) Drivers() []string {
	return m.drivers.Keys()
}

func (m *Manager) DriversByGroup(group string) []string {
	if drivers, ok := m.driversByGroup.Get(group); ok {
		return drivers.Keys()
	}
	return nil
}

func Register(driver IDriver) {
	manager.Register(driver)
}

func Get(name string) (IDriver, bool) {
	return manager.Get(name)
}

func Drivers(group ...string) []string {
	if len(group) > 0 && group[0] != "" {
		return manager.DriversByGroup(group[0])
	}
	return manager.Drivers()
}

func List(group ...string) []IDriver {
	if len(group) > 0 && group[0] != "" {
		return manager.ListByGroup(group[0])
	}
	return manager.List()
}
