package model_runtime

import (
	"encoding/json"
	"fmt"
)

const (
	ParameterTypeInt   = "int"
	ParameterTypeStr   = "string"
	ParameterTypeFloat = "float"
	ParameterTypeBool  = "bool"
)

type IParamValidator interface {
	Valid(map[string]interface{}) error
	GenConfig(target map[string]interface{}, origin map[string]interface{}) (string, error)
}

type ParamValidator []Param

func (p ParamValidator) GenConfig(target map[string]interface{}, origin map[string]interface{}) (string, error) {
	for _, rule := range p {
		if !rule.Secret {
			continue
		}
		vv, ok := origin[rule.Name]
		if !ok {
			continue
		}
		v, ok := vv.(string)
		if !ok || v == "******" {
			continue
		}
		tv, ok := target[rule.Name]
		if !ok {
			continue
		}
		v, ok = tv.(string)
		if !ok || v == "******" {
			target[rule.Name] = origin[rule.Name]
		}

	}
	data, err := json.Marshal(target)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

type Param struct {
	Name     string      `json:"name" yaml:"name"`
	Default  interface{} `json:"default" yaml:"default"`
	Type     string      `json:"type" yaml:"type"`
	Min      float64     `json:"min" yaml:"min"`
	Max      float64     `json:"max" yaml:"max"`
	Required bool        `json:"required" yaml:"required"`
	Secret   bool        `json:"secret" yaml:"secret"`
}

func (p ParamValidator) Valid(params map[string]interface{}) error {
	for _, rule := range p {
		v, ok := params[rule.Name]
		if !ok {
			if rule.Required {
				return fmt.Errorf("missing required parameter %s", rule.Name)
			}
			continue
		}

		switch rule.Type {
		case ParameterTypeInt:
			r, ok := v.(int)
			if !ok {
				return fmt.Errorf("invalid parameter %s: %v", rule.Name, v)
			}
			if r < int(rule.Min) || r > int(rule.Max) {
				return fmt.Errorf("invalid parameter %s: %v", rule.Name, v)
			}
		case ParameterTypeFloat:
			r, ok := v.(float64)
			if !ok {
				return fmt.Errorf("invalid parameter %s: %v", rule.Name, v)
			}
			if r < rule.Min || r > rule.Max {
				return fmt.Errorf("invalid parameter %s: %v", rule.Name, v)
			}
		case ParameterTypeStr:
			vv, ok := v.(string)
			if !ok {
				return fmt.Errorf("invalid parameter %s: %v", rule.Name, v)
			}
			if rule.Required && len(vv) == 0 {
				return fmt.Errorf("parameter %s is empty", rule.Name)
			}
		case ParameterTypeBool:
			_, ok = v.(bool)
			if !ok {
				return fmt.Errorf("invalid parameter %s: %v", rule.Name, v)
			}
		}
	}
	return nil

}
