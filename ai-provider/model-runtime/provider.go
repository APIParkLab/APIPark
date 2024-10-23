package model_runtime

import (
	"encoding/json"
	"fmt"
	"net/url"

	yaml "gopkg.in/yaml.v3"

	"github.com/APIParkLab/APIPark/ai-provider/model-runtime/entity"
	"github.com/eolinker/eosc"
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

type IProviderURI interface {
	Scheme() string
	Host() string
	Path() string
}

type IProviderInfo interface {
	ID() string
	Name() string
	DefaultModel(modelType string) (IModel, bool)
	HelpUrl() string
	Logo() string
	URI() IProviderURI
}

func NewProvider(providerData string, modelContents map[string]eosc.Untyped[string, string]) (IProvider, error) {
	var providerCfg entity.Provider
	err := yaml.Unmarshal([]byte(providerData), &providerCfg)
	if err != nil {
		return nil, err
	}
	uri, err := newProviderUri(providerCfg.Address)
	if err != nil {
		return nil, err
	}
	assetsFiles, ok := modelContents[DirAssets]
	if !ok {
		return nil, fmt.Errorf("assets not found")
	}

	delete(modelContents, DirAssets)
	//providerLogo, ok := assetsFiles.Get(providerCfg.IconLarge[entity.LanguageEnglish])
	//if !ok {
	//	return nil, fmt.Errorf("provider logo not found:%s", providerCfg.Provider)
	//}
	modelLogo, ok := assetsFiles.Get(providerCfg.IconSmall[entity.LanguageEnglish])
	if !ok {
		return nil, fmt.Errorf("model logo not found:%s", providerCfg.Provider)
	}
	provider := &Provider{
		id:            providerCfg.Provider,
		name:          providerCfg.Label[entity.LanguageEnglish],
		logo:          modelLogo,
		helpUrl:       providerCfg.Help.URL[entity.LanguageEnglish],
		models:        eosc.BuildUntyped[string, IModel](),
		defaultModels: eosc.BuildUntyped[string, IModel](),
		modelsByType:  eosc.BuildUntyped[string, []IModel](),
		maskKeys:      make([]string, 0),
		uri:           uri,
	}
	defaultCfg := make(map[string]string)
	params := make(ParamValidator, 0, len(providerCfg.ProviderCredentialSchema.CredentialFormSchemas))
	for _, v := range providerCfg.ProviderCredentialSchema.CredentialFormSchemas {
		param := Param{
			Name:     v.Variable,
			Default:  v.Label[entity.LanguageEnglish],
			Type:     ParameterTypeStr,
			Required: v.Required,
		}

		if v.Type == "secret-input" {
			provider.maskKeys = append(provider.maskKeys, v.Variable)
			param.Secret = true
		}
		params = append(params, param)
		defaultCfg[v.Variable] = v.Label[entity.LanguageEnglish]
	}
	defaultCfgByte, _ := json.MarshalIndent(defaultCfg, "", "  ")
	provider.IConfig = NewConfig(string(defaultCfgByte), params)
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
	id            string
	name          string
	logo          string
	helpUrl       string
	models        eosc.Untyped[string, IModel]
	defaultModels eosc.Untyped[string, IModel]
	modelsByType  eosc.Untyped[string, []IModel]
	maskKeys      []string
	uri           IProviderURI
	IConfig
}

func (p *Provider) URI() IProviderURI {
	return p.uri
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

func (p *Provider) MaskConfig(cfg string) string {
	var data map[string]string
	err := json.Unmarshal([]byte(cfg), &data)
	if err != nil {
		return cfg
	}
	for _, key := range p.maskKeys {
		if _, ok := data[key]; ok {
			data[key] = "******"
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

type providerUri struct {
	scheme string
	host   string
	path   string
}

func newProviderUri(addr string) (IProviderURI, error) {
	uri, err := url.Parse(addr)
	if err != nil {
		return nil, err
	}
	if uri.Host == "" {
		return nil, fmt.Errorf("host is empty")
	}
	if uri.Scheme == "" {
		return nil, fmt.Errorf("scheme is empty")
	}

	return &providerUri{
		scheme: uri.Scheme,
		host:   uri.Host,
		path:   uri.Path,
	}, nil
}

func (p *providerUri) Scheme() string {
	return p.scheme
}

func (p *providerUri) Host() string {
	return p.host
}

func (p *providerUri) Path() string {
	return p.path
}
