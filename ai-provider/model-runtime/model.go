package model_runtime

import (
	"encoding/json"
	"github.com/APIParkLab/APIPark/ai-provider/model-runtime/entity"
	"gopkg.in/yaml.v3"
	"strconv"
)

type IModel interface {
	ID() string
	Logo() string
	IConfig
}

type Model struct {
	id            string
	logo          string
	defaultConfig string
	validator     IParamValidator
}

func (m *Model) ID() string {
	return m.id
}

func (m *Model) Logo() string {
	return m.logo
}

func (m *Model) Check(cfg string) error {
	data := make(map[string]interface{})
	err := json.Unmarshal([]byte(cfg), &data)
	if err != nil {
		return err
	}
	return m.validator.Valid(data)
}

func (m *Model) DefaultConfig() string {
	return m.defaultConfig
}

func NewModel(data string, logo string) (IModel, error) {
	var cfg entity.AIModel
	err := yaml.Unmarshal([]byte(data), &cfg)
	if err != nil {
		return nil, err
	}
	params := make(ParamValidator, 0, len(cfg.ParameterRules))
	defaultConfig := make(map[string]interface{})
	for _, p := range cfg.ParameterRules {
		t := p.Type
		if t == "" {
			t = ParameterTypeStr
		}
		switch t {
		case ParameterTypeInt:
			switch t := p.Default.(type) {
			case int:
				defaultConfig[p.Name] = t
			case float64:
				defaultConfig[p.Name] = int(t)
			default:
				defaultConfig[p.Name] = 0
			}
		case ParameterTypeStr:
			switch t := p.Default.(type) {
			case int:
				defaultConfig[p.Name] = t
			case float64:
				defaultConfig[p.Name] = int(t)
			case string:
				defaultConfig[p.Name] = t
			case bool:
				defaultConfig[p.Name] = strconv.FormatBool(t)
			default:
				defaultConfig[p.Name] = ""
			}
		case ParameterTypeFloat:
			switch t := p.Default.(type) {
			case int:
				defaultConfig[p.Name] = float64(t)
			case float64:
				defaultConfig[p.Name] = t
			default:
				defaultConfig[p.Name] = float64(0)
			}
		case ParameterTypeBool:
			switch t := p.Default.(type) {
			case bool:
				defaultConfig[p.Name] = t
			case string:
				defaultConfig[p.Name] = t == "true"
			default:
				defaultConfig[p.Name] = false
			}
		default:
			continue
		}
		params = append(params, Param{
			Name:     p.Name,
			Default:  p.Default,
			Type:     t,
			Min:      p.Min,
			Max:      p.Max,
			Required: p.Required,
		})
	}
	dCfg, err := json.Marshal(defaultConfig)
	if err != nil {
		return nil, err
	}
	return &Model{
		id:            cfg.Model,
		logo:          logo,
		defaultConfig: string(dCfg),
		validator:     params,
	}, nil
}
