package strategy_driver

import (
	"github.com/APIParkLab/APIPark/gateway"
	strategy_dto "github.com/APIParkLab/APIPark/module/strategy/dto"
	"github.com/eolinker/eosc"
)

type IStrategyDriver interface {
	Driver() string
	ToRelease(s *strategy_dto.Strategy, labels map[string][]string, initStep int) *eosc.Base[gateway.StrategyRelease]
	Check(config interface{}) error
}
