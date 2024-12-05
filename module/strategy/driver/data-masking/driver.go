package data_masking

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/APIParkLab/APIPark/gateway"
	"github.com/eolinker/eosc"

	strategy_driver "github.com/APIParkLab/APIPark/module/strategy/driver"

	strategy_dto "github.com/APIParkLab/APIPark/module/strategy/dto"
)

func init() {
	strategy_driver.Register(&strategyDriver{confName: "data_mask"})
}

type strategyDriver struct {
	confName string
}

func (d *strategyDriver) Driver() string {
	return "data-masking"
}

func (d *strategyDriver) ToRelease(s *strategy_dto.Strategy, labels map[string][]string, initStep int) *eosc.Base[gateway.StrategyRelease] {
	filters := make(map[string][]string)

	for _, f := range s.Filters {
		filters[f.Name] = f.Values
	}
	for key, value := range labels {
		filters[key] = value
	}

	base := eosc.NewBase[gateway.StrategyRelease]()
	base.Config = &gateway.StrategyRelease{
		Name:     s.Id,
		Desc:     s.Name,
		Driver:   "data_mask",
		Priority: initStep + s.Priority,
		Filters:  filters,
		IsDelete: s.IsDelete,
	}
	cfg := make(map[string]interface{})
	cfg[d.confName] = s.Config
	base.Append = cfg
	return base

}

func (d *strategyDriver) Check(config interface{}) error {
	if config == nil {
		return nil
	}
	data, err := json.Marshal(config)
	if err != nil {
		return err
	}
	var cfg Config
	err = json.Unmarshal(data, &cfg)
	if err != nil {
		return err
	}
	for _, r := range cfg.Rules {
		if r.Match == nil {
			return errors.New("match can't be null. ")
		}
		if r.Mask == nil {
			return errors.New("mask can't be null. ")
		}

		if _, ok := validMatchTypes[r.Match.Type]; !ok {
			return fmt.Errorf("match type %s is illegal. ", r.Match.Type)
		}

		if r.Match.Type == "inner" {
			if _, ok := validMatchInnerValues[r.Match.Value]; !ok {
				return fmt.Errorf("match value %s is illegal. ", r.Match.Value)
			}
		}
		if _, ok := validMaskTypes[r.Mask.Type]; !ok {
			return fmt.Errorf("mask type %s is illegal. ", r.Mask.Type)
		}
		if r.Mask.Replace != nil {
			if _, ok := validReplaceTypes[r.Mask.Replace.Type]; !ok {
				return fmt.Errorf("replace type %s is illegal. ", r.Mask.Replace.Type)
			}
		}
	}
	return nil
}
