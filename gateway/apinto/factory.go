package apinto

import (
	"github.com/APIParkLab/APIPark/gateway"
)

func init() {
	gateway.Register("apinto", &Factory{})
}

var _ gateway.IFactory = &Factory{}

type Factory struct {
}

func (f *Factory) Create(config *gateway.ClientConfig) (gateway.IClientDriver, error) {
	return NewClientDriver(config)
}
