package model_runtime

import (
	"encoding/json"
	"fmt"
	"hash/fnv"
	"net/url"
	"strings"
	"sync"

	yaml "gopkg.in/yaml.v3"

	"github.com/APIParkLab/APIPark/ai-provider/model-runtime/entity"
	"github.com/eolinker/eosc"
)

const (
	ModelTypeLLM = "llm"
)

type IProvider interface {
	IProviderInfo
	GetModelConfig() ModelConfig
	SetModel(id string, model IModel)
	RemoveModel(id string)
	SetDefaultModel(modelType string, model IModel)
	GetModel(name string) (IModel, bool)
	Models() []IModel
	ModelsByType(modelType string) ([]IModel, bool)
	IConfig
	MaskConfig(cfg string) string
	Sort() int
	Recommend() bool
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
	SetURI(IProviderURI)
	URI() IProviderURI
}

func GetCustomizeLogo() string {
	logo, _ := providerDir.ReadFile("customize/assets/icon_s_en.svg")

	return string(logo)
}

func GetCustomizeProviderURI(config string, emptyURI bool) (IProviderURI, error) {
	var providerCfg CustomizeProviderConfig
	if strings.TrimSpace(config) != "" {
		err := json.Unmarshal([]byte(config), &providerCfg)
		if err != nil {
			return nil, err
		}
	}
	if providerCfg.BaseUrl == "" && emptyURI {
		return &providerUri{
			scheme: "",
			host:   "",
			path:   "",
		}, nil
	}
	uri, err := newProviderUri(providerCfg.BaseUrl)
	if err != nil {
		return nil, err
	}
	return uri, nil
}

func NewCustomizeProvider(id string, name string, models []IModel, defaultModel string, config string) (IProvider, error) {
	uri, err := GetCustomizeProviderURI(config, true)
	if err != nil {
		return nil, err
	}

	provider := &Provider{
		id:        id,
		name:      name,
		logo:      GetCustomizeLogo(),
		helpUrl:   "",
		registry:  newModelRegistry(),
		maskKeys:  make([]string, 0),
		recommend: false,
		sort:      0,
		uri:       uri,
		modelConfig: ModelConfig{
			AccessConfigurationStatus: false,
			AccessConfigurationDemo:   "",
		},
	}
	provider.IConfig = NewConfig("", nil)

	for _, model := range models {
		provider.SetModel(model.ID(), model)
		if defaultModel == "" {
			defaultModel = model.ID()
		}
		if model.ID() == defaultModel {
			provider.SetDefaultModel(name, model)
		}
	}

	return provider, nil
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
		id:        providerCfg.Provider,
		name:      providerCfg.Label[entity.LanguageEnglish],
		logo:      modelLogo,
		helpUrl:   providerCfg.Help.URL[entity.LanguageEnglish],
		registry:  newModelRegistry(),
		maskKeys:  make([]string, 0),
		recommend: providerCfg.Recommend,
		sort:      providerCfg.Sort,
		uri:       uri,
		modelConfig: ModelConfig{
			AccessConfigurationStatus: providerCfg.ModelConfig.AccessConfigurationStatus,
			AccessConfigurationDemo:   providerCfg.ModelConfig.AccessConfigurationDemo,
		},
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
		}
	}

	return provider, nil
}

type Provider struct {
	id          string
	name        string
	logo        string
	helpUrl     string
	registry    *ModelRegistry
	maskKeys    []string
	uri         IProviderURI
	sort        int
	recommend   bool
	modelConfig ModelConfig
	mu          sync.Mutex
	IConfig
}

type ModelRegistry struct {
	models        eosc.Untyped[string, IModel]
	defaultModels eosc.Untyped[string, IModel]

	typeIndex  map[string]*modelNode // type->header node
	reverseMap map[string]*modelNode // ID->node
	typeShard  [8]sync.RWMutex       // lock
}

type modelNode struct {
	model      IModel
	prev, next *modelNode
	typeKey    string
}

func newModelRegistry() *ModelRegistry {
	return &ModelRegistry{
		models:        eosc.BuildUntyped[string, IModel](),
		defaultModels: eosc.BuildUntyped[string, IModel](),
		typeIndex:     make(map[string]*modelNode),
		reverseMap:    make(map[string]*modelNode),
	}
}

func (r *ModelRegistry) getShard(key string) *sync.RWMutex {
	h := fnv.New32a()
	h.Write([]byte(key))
	return &r.typeShard[h.Sum32()%8]
}

type ModelConfig struct {
	AccessConfigurationStatus bool
	AccessConfigurationDemo   string
}

func (p *Provider) GetModelConfig() ModelConfig {
	return p.modelConfig
}

func (p *Provider) Sort() int {
	return p.sort
}

func (p *Provider) Recommend() bool {
	return p.recommend
}

func (p *Provider) URI() IProviderURI {
	return p.uri
}

func (p *Provider) SetURI(uri IProviderURI) {
	p.uri = uri
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

func (r *ModelRegistry) addModel(m IModel, isDefault bool) {
	_, exist := r.models.Get(m.ID())
	r.models.Set(m.ID(), m)

	// get lock
	shard := r.getShard(m.ID())
	shard.Lock()
	defer shard.Unlock()

	if exist {
		if node, exist := r.reverseMap[m.ID()]; exist {
			node.model = m
		}
	} else {
		node := &modelNode{
			model:   m,
			typeKey: m.ModelType(),
		}
		if head := r.typeIndex[m.ModelType()]; head != nil {
			node.next = head
			head.prev = node
		}
		r.typeIndex[m.ModelType()] = node
		r.reverseMap[m.ID()] = node
	}

	// default model
	if isDefault {
		r.defaultModels.Set(m.ModelType(), m)
	}
}

func (r *ModelRegistry) removeModel(id string) {
	r.models.Del(id)

	// check node exist
	node, exist := r.reverseMap[id]
	if !exist {
		return
	}

	// get lock
	shard := r.getShard(node.typeKey)
	shard.Lock()
	defer shard.Unlock()

	// delete node chain
	if node.prev != nil {
		node.prev.next = node.next
	} else {
		r.typeIndex[node.typeKey] = node.next
	}
	if node.next != nil {
		node.next.prev = node.prev
	}

	// clean index
	delete(r.reverseMap, id)
	if r.typeIndex[node.typeKey] == nil {
		delete(r.typeIndex, node.typeKey)
	}
}

func (p *Provider) DefaultModel(modelType string) (IModel, bool) {
	return p.registry.defaultModels.Get(modelType)
}

func (p *Provider) GetModel(name string) (IModel, bool) {
	return p.registry.models.Get(name)
}

func (p *Provider) Models() []IModel {
	return p.registry.models.List()
}

func (p *Provider) ModelsByType(modelType string) ([]IModel, bool) {
	shard := p.registry.getShard(modelType)
	shard.RLock()
	defer shard.RUnlock()

	var result []IModel
	if node := p.registry.typeIndex[modelType]; node != nil {
		for n := node; n != nil; n = n.next {
			result = append(result, n.model)
		}
	}
	return result, true
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
	p.registry.addModel(model, true)
}

func (p *Provider) SetModel(id string, model IModel) {
	p.registry.addModel(model, false)
}

func (p *Provider) RemoveModel(id string) {
	p.registry.removeModel(id)
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
