package influxdb_v2

import (
	"encoding/json"
	"fmt"
	"net/url"

	"github.com/eolinker/go-common/autowire"

	"github.com/APIParkLab/APIPark/module/monitor/driver/influxdb-v2/flux"

	"github.com/APIParkLab/APIPark/module/monitor/driver"
)

var _ driver.IDriver = (*influxdbV2)(nil)

const (
	name = "influxdb-v2"
)

func init() {
	d := newInfluxdbV2()
	autowire.Autowired(d)
	driver.Register(d)
}

type InfluxdbV2Config struct {
	Addr  string `json:"addr"`
	Token string `json:"token"`
	Org   string `json:"org"`
}

func newInfluxdbV2() *influxdbV2 {
	return &influxdbV2{}
}

type influxdbV2 struct {
	fluxQuery flux.IFluxQuery `autowired:""`
}

func (i *influxdbV2) Name() string {
	return name
}

func (i *influxdbV2) Check(cfg string) error {
	var data InfluxdbV2Config
	err := json.Unmarshal([]byte(cfg), &data)
	if err != nil {
		return err
	}

	_, err = url.Parse(data.Addr)
	if err != nil {
		return fmt.Errorf("addr is invalid")
	}
	return nil
}

func (i *influxdbV2) Create(cfg string) (driver.IExecutor, error) {
	return newExecutor(cfg, i.fluxQuery)
}
