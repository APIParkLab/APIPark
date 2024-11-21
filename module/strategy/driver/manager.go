package strategy_driver

import (
	"fmt"

	"github.com/eolinker/eosc"
)

var manager = newManager()

func newManager() *Manager {
	return &Manager{
		drivers: eosc.BuildUntyped[string, IStrategyDriver](),
	}
}

type Manager struct {
	drivers eosc.Untyped[string, IStrategyDriver]
}

func (m *Manager) AddDriver(driver IStrategyDriver) {
	m.drivers.Set(driver.Driver(), driver)
}

func (m *Manager) GetDriver(driver string) (IStrategyDriver, bool) {
	return m.drivers.Get(driver)
}

func (m *Manager) GetDrivers() []string {
	return m.drivers.Keys()
}

func (m *Manager) Delete(name string) {
	m.drivers.Del(name)
}

func GetDriver(name string) (IStrategyDriver, bool) {
	return manager.GetDriver(name)
}

func Register(driver IStrategyDriver) {
	manager.AddDriver(driver)
}

func CheckConfig(name string, config interface{}) error {
	driver, has := manager.GetDriver(name)
	if !has {
		return fmt.Errorf("driver %s not found", name)
	}

	return driver.Check(config)
}
