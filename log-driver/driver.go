package log_driver

import (
	"time"

	"github.com/eolinker/eosc"
)

type ILogDriver interface {
	LogInfo(clusterId string, id string) (*LogInfo, error)
	LogCount(clusterId string, conditions map[string]string, spendHour int64, group string) (map[string]int64, error)
	Logs(clusterId string, conditions map[string]string, start time.Time, end time.Time, limit int64, offset int64) ([]*Log, int64, error)
}

var (
	driverManager = NewDriverManager()
)

type DriverManager struct {
	drivers eosc.Untyped[string, ILogDriver]
}

func NewDriverManager() *DriverManager {
	return &DriverManager{drivers: eosc.BuildUntyped[string, ILogDriver]()}
}

func (m *DriverManager) Set(name string, driver ILogDriver) {
	m.drivers.Set(name, driver)
}

func (m *DriverManager) Get(name string) (ILogDriver, bool) {
	return m.drivers.Get(name)
}

func SetDriver(name string, driver ILogDriver) {
	driverManager.Set(name, driver)
}

func GetDriver(name string) (ILogDriver, bool) {
	return driverManager.Get(name)
}
