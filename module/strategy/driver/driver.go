package strategy_driver

import (
	strategy_dto "github.com/APIParkLab/APIPark/module/strategy/dto"
)

type IStrategyDriver interface {
	Driver() string
	ToApinto(strategy strategy_dto.Strategy) interface{}
	Check(config interface{}) error
}
