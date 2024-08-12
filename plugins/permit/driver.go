package permit

import (
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/pm3"
)

var (
	_ pm3.Driver = (*Driver)(nil)
)

func init() {
	pm3.Register("permit", &Driver{})
}

type Driver struct {
}

func (d *Driver) Create() (pm3.IPlugin, error) {
	p := new(pluginPermit)
	autowire.Autowired(p)
	return p, nil
}
