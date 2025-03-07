package model_runtime

import (
	"encoding/json"
	"github.com/APIParkLab/APIPark/ai-provider/model-runtime/entity"
	"gopkg.in/yaml.v3"
	"strconv"
)

type IModel interface {
	ID() string
	Name() string
	Logo() string
	Source() string
	SetLogo(logo string)
	AccessConfiguration() string
	ModelParameters() string
	IConfig
}

type Model struct {
	id                  string
	logo                string
	name                string
	accessConfiguration string
	modelParameters     string
	// default: ""/"system", "customize"
	source string
	//defaultConfig string
	IConfig
	//validator IParamValidator
}

func (m *Model) SetLogo(logo string) {
	m.logo = logo
}

func (m *Model) Name() string {
	return m.name
}

type CustomizeProviderConfig struct {
	ApiEndpointUrl string `json:"api_endpoint_url"`
	ApiKey         string `json:"api_key"`
}

func (m *Model) ID() string {
	return m.id
}

func (m *Model) Source() string {
	return m.source
}

func (m *Model) Logo() string {
	return m.logo
}

func (m *Model) AccessConfiguration() string {
	return m.accessConfiguration
}

func (m *Model) ModelParameters() string {
	return m.modelParameters
}

func NewCustomizeModel(id string, name string, logo string, accessConfiguration string, modelParameters string) (IModel, error) {
	if logo == "" {
		logo = GetCustomizeLogo()
	}
	// handle access_config & model_config
	return &Model{
		id:                  id,
		name:                name,
		logo:                logo,
		source:              "customize",
		accessConfiguration: accessConfiguration,
		modelParameters:     modelParameters,
		IConfig:             NewConfig(modelParameters, nil),
	}, nil
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
	dCfg, err := json.MarshalIndent(defaultConfig, "", "  ")
	if err != nil {
		return nil, err
	}
	return &Model{
		id:                  cfg.Model,
		name:                cfg.Model,
		logo:                logo,
		accessConfiguration: "",
		IConfig:             NewConfig(string(dCfg), params),
	}, nil
}
