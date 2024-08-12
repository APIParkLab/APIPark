package publish_flow

import (
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/pm3"
)

type Driver struct {
}

func (d *Driver) Create() (pm3.IPlugin, error) {
	p := new(plugin)
	autowire.Autowired(p)
	return p, nil
}

func init() {
	pm3.Register("publish_flow", new(Driver))
}
