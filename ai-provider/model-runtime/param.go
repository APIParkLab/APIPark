package model_runtime

import "fmt"

const (
	ParameterTypeInt   = "int"
	ParameterTypeStr   = "string"
	ParameterTypeFloat = "float"
	ParameterTypeBool  = "bool"
)

type IParamValidator interface {
	Valid(map[string]interface{}) error
}

type ParamValidator []Param

type Param struct {
	Name     string      `json:"name" yaml:"name"`
	Default  interface{} `json:"default" yaml:"default"`
	Type     string      `json:"type" yaml:"type"`
	Min      float64     `json:"min" yaml:"min"`
	Max      float64     `json:"max" yaml:"max"`
	Required bool        `json:"required" yaml:"required"`
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
			_, ok = v.(string)
			if !ok {
				return fmt.Errorf("invalid parameter %s: %v", rule.Name, v)
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
