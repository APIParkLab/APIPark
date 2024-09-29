package model_runtime

import (
	"encoding/json"
	"fmt"
	"github.com/APIParkLab/APIPark/ai-provider/model-runtime/entity"
	"github.com/eolinker/eosc"
	"gopkg.in/yaml.v3"
	"strings"
)

const (
	ModelTypeLLM = "llm"
)

type IProvider interface {
	IProviderInfo
	GetModel(name string) (IModel, bool)
	Models() []IModel
	ModelsByType(modelType string) ([]IModel, bool)
	IConfig
	MaskConfig(cfg string) string
}

type IProviderInfo interface {
	ID() string
	Name() string
	DefaultModel(modelType string) (IModel, bool)
	HelpUrl() string
	Logo() string
}

func NewProvider(providerData string, modelContents map[string]eosc.Untyped[string, string]) (IProvider, error) {
	var providerCfg entity.Provider
	err := yaml.Unmarshal([]byte(providerData), &providerCfg)
	if err != nil {
		return nil, err
	}

	assetsFiles, ok := modelContents[DirAssets]
	if !ok {
		return nil, fmt.Errorf("assets not found")
	}
	delete(modelContents, DirAssets)
	providerLogo, _ := assetsFiles.Get(providerCfg.IconLarge[entity.LanguageEnglish])
	modelLogo, _ := assetsFiles.Get(providerCfg.IconSmall[entity.LanguageEnglish])
	provider := &Provider{
		id:            providerCfg.Provider,
		name:          providerCfg.Label[entity.LanguageEnglish],
		logo:          providerLogo,
		helpUrl:       providerCfg.Help.URL[entity.LanguageEnglish],
		models:        eosc.BuildUntyped[string, IModel](),
		defaultModels: eosc.BuildUntyped[string, IModel](),
		modelsByType:  eosc.BuildUntyped[string, []IModel](),
		maskKeys:      make([]string, 0),
	}
	defaultCfg := make(map[string]string)
	params := make(ParamValidator, 0, len(providerCfg.ProviderCredentialSchema.CredentialFormSchemas))
	for _, v := range providerCfg.ProviderCredentialSchema.CredentialFormSchemas {
		params = append(params, Param{
			Name:     v.Variable,
			Default:  v.Label[entity.LanguageEnglish],
			Type:     ParameterTypeStr,
			Required: v.Required,
		})
		if v.Type == "secret-input" {
			provider.maskKeys = append(provider.maskKeys, v.Variable)
		}
		defaultCfg[v.Variable] = v.Label[entity.LanguageEnglish]
	}
	defaultCfgByte, _ := json.MarshalIndent(defaultCfg, "", "  ")
	provider.defaultConfig = string(defaultCfgByte)
	provider.paramValidator = params
	for name, f := range modelContents {
		models := make([]IModel, 0, f.Count())
		defaultModel := providerCfg.Default[name]
		for i, v := range f.List() {
			model, err := NewModel(v, modelLogo)
			if err != nil {
				return nil, err
			}
			provider.SetModel(model.ID(), model)
			if i == 0 && defaultModel == "" {
				defaultModel = model.ID()
			}
			if model.ID() == defaultModel {
				provider.SetDefaultModel(name, model)
			}
			models = append(models, model)
		}
		provider.SetModelsByType(name, models)
	}
	return provider, nil
}

type Provider struct {
	id             string
	name           string
	logo           string
	helpUrl        string
	defaultConfig  string
	paramValidator IParamValidator
	models         eosc.Untyped[string, IModel]
	defaultModels  eosc.Untyped[string, IModel]
	modelsByType   eosc.Untyped[string, []IModel]
	maskKeys       []string
}

func (p *Provider) ID() string {
	return p.id
}

func (p *Provider) Name() string {
	return p.name
}

func (p *Provider) HelpUrl() string {
	return p.helpUrl
}

func (p *Provider) Logo() string {
	return p.logo
}

func (p *Provider) DefaultModel(modelType string) (IModel, bool) {
	return p.defaultModels.Get(modelType)
}

func (p *Provider) GetModel(name string) (IModel, bool) {
	return p.models.Get(name)
}

func (p *Provider) Models() []IModel {
	return p.models.List()
}

func (p *Provider) ModelsByType(modelType string) ([]IModel, bool) {
	return p.modelsByType.Get(modelType)
}

func (p *Provider) Check(cfg string) error {
	data := make(map[string]interface{})
	err := json.Unmarshal([]byte(cfg), &data)
	if err != nil {
		return err
	}
	return p.paramValidator.Valid(data)
}

func (p *Provider) DefaultConfig() string {
	return p.defaultConfig
}

func (p *Provider) MaskConfig(cfg string) string {
	var data map[string]string
	err := json.Unmarshal([]byte(cfg), &data)
	if err != nil {
		return cfg
	}
	for _, key := range p.maskKeys {
		if v, ok := data[key]; ok {
			data[key] = PartialMasking(v, 4, -1)
		}
	}
	result, _ := json.Marshal(data)
	return string(result)
}

func (p *Provider) SetDefaultModel(modelType string, model IModel) {
	p.defaultModels.Set(modelType, model)
}

func (p *Provider) SetModel(id string, model IModel) {
	p.models.Set(id, model)
}

func (p *Provider) SetModelsByType(modelType string, models []IModel) {
	p.modelsByType.Set(modelType, models)
}

func PartialMasking(origin string, begin int, length int) string {
	target := strings.Builder{}
	runes := []rune(origin)
	size := len(runes)
	if begin > size {
		return origin
	} else if length == -1 || begin+length > size {
		for i := 0; i < begin; i++ {
			target.WriteRune(runes[i])
		}
		for i := begin; i < size; i++ {
			target.WriteRune('*')
		}
	} else {
		for i := 0; i < begin; i++ {
			target.WriteRune(runes[i])
		}
		for i := begin; i < begin+length; i++ {
			target.WriteRune('*')
		}
		for i := begin + length; i < size; i++ {
			target.WriteRune(runes[i])
		}
	}
	return target.String()
}
