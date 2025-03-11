package ai

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"sort"
	"time"

	ai_model "github.com/APIParkLab/APIPark/service/ai-model"
	"github.com/google/uuid"

	ai_provider_local "github.com/APIParkLab/APIPark/ai-provider/local"

	"github.com/eolinker/go-common/register"
	"github.com/eolinker/go-common/server"

	ai_local "github.com/APIParkLab/APIPark/service/ai-local"

	ai_balance "github.com/APIParkLab/APIPark/service/ai-balance"

	"github.com/APIParkLab/APIPark/service/service"

	ai_key "github.com/APIParkLab/APIPark/service/ai-key"

	"github.com/eolinker/go-common/auto"

	ai_api "github.com/APIParkLab/APIPark/service/ai-api"

	model_runtime "github.com/APIParkLab/APIPark/ai-provider/model-runtime"
	"github.com/APIParkLab/APIPark/gateway"
	ai_dto "github.com/APIParkLab/APIPark/module/ai/dto"
	"github.com/APIParkLab/APIPark/service/ai"
	"github.com/APIParkLab/APIPark/service/cluster"
	"github.com/eolinker/eosc/log"
	"github.com/eolinker/go-common/store"
	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"
)

func newKey(key *ai_key.Key) *gateway.DynamicRelease {

	return &gateway.DynamicRelease{
		BasicItem: &gateway.BasicItem{
			ID:          fmt.Sprintf("%s-%s", key.Provider, key.ID),
			Description: key.Name,
			Resource:    "ai-key",
			Version:     time.Now().Format("20060102150405"),
			MatchLabels: map[string]string{
				"module": "ai-key",
			},
		},
		Attr: map[string]interface{}{
			"expired":  key.ExpireTime,
			"config":   key.Config,
			"provider": key.Provider,
			"priority": key.Priority,
			"disabled": key.Status == 0,
		},
	}
}

var _ IProviderModule = (*imlProviderModule)(nil)

type imlProviderModule struct {
	providerService      ai.IProviderService            `autowired:""`
	providerModelService ai_model.IProviderModelService `autowired:""`
	clusterService       cluster.IClusterService        `autowired:""`
	aiAPIService         ai_api.IAPIService             `autowired:""`
	aiKeyService         ai_key.IKeyService             `autowired:""`
	aiBalanceService     ai_balance.IBalanceService     `autowired:""`
	transaction          store.ITransaction             `autowired:""`
}

func (i *imlProviderModule) OnInit() {
	register.Handle(func(v server.Server) {
		ctx := context.Background()

		list, err := i.providerService.List(ctx)
		if err != nil {
			return
		}
		// register provider
		for _, p := range list {
			// get customize models
			models, _ := i.providerModelService.Search(ctx, "", map[string]interface{}{"provider": p.Id}, "update_at desc")
			iModels := make([]model_runtime.IModel, 0, len(models))
			if models != nil {
				for _, model := range models {
					// parse access_config & model_parameters
					iModel, _ := model_runtime.NewCustomizeModel(model.Id, model.Name, model_runtime.GetCustomizeLogo(), model.AccessConfiguration, model.ModelParameters)
					iModels = append(iModels, iModel)
				}
			}
			// default provider
			if p.Type == 0 {
				runtimeProvider, _ := model_runtime.GetProvider(p.Id)
				for _, tmpIModel := range iModels {
					tmpIModel.SetLogo(runtimeProvider.Logo())
					if p.DefaultLLM == tmpIModel.ID() {
						runtimeProvider.SetDefaultModel(model_runtime.ModelTypeLLM, tmpIModel)
					}
					runtimeProvider.SetModel(tmpIModel.ID(), tmpIModel)
				}
			} else {
				provider, _ := model_runtime.NewCustomizeProvider(p.Id, p.Name, iModels, p.DefaultLLM, p.Config)
				if provider != nil {
					model_runtime.Register(p.Id, provider)
				}
			}
		}
		i.transaction.Transaction(ctx, func(ctx context.Context) error {
			for _, l := range list {
				if l.Priority < 1 {
					continue
				}
				has, err := i.aiBalanceService.Exist(ctx, l.Id, l.DefaultLLM)
				if err != nil {
					return err
				}
				if has {
					continue
				}

				p, has := model_runtime.GetProvider(l.Id)
				if !has {
					continue
				}
				err = i.aiBalanceService.Create(ctx, &ai_balance.Create{
					Id:           uuid.NewString(),
					Priority:     l.Priority,
					Provider:     l.Id,
					ProviderName: p.Name(),
					Model:        l.DefaultLLM,
					ModelName:    l.DefaultLLM,
					Type:         0,
				})
				if err != nil {
					return err
				}
				priority := 0
				err = i.providerService.Save(ctx, l.Id, &ai.SetProvider{
					Priority: &priority,
				})
				if err != nil {
					return err
				}
			}
			return nil
		})

	})
}

func (i *imlProviderModule) Delete(ctx context.Context, id string) error {
	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		// 判断是否有api
		count, err := i.aiAPIService.CountByProvider(ctx, id)
		if err != nil {
			return err
		}
		if count > 0 {
			return fmt.Errorf("provider has api")
		}
		keys, err := i.aiKeyService.KeysByProvider(ctx, id)
		if err != nil {
			return err
		}
		err = i.aiKeyService.DeleteByProvider(ctx, id)
		if err != nil {
			return err
		}

		err = i.providerService.Delete(ctx, id)
		if err != nil {
			return err
		}
		// delete register provider
		model_runtime.Remove(id)
		releases := make([]*gateway.DynamicRelease, 0, len(keys))
		for _, key := range keys {
			releases = append(releases, newKey(key))
		}
		err = i.syncGateway(ctx, cluster.DefaultClusterID, releases, false)
		if err != nil {
			return err
		}
		return i.syncGateway(ctx, cluster.DefaultClusterID, []*gateway.DynamicRelease{
			{
				BasicItem: &gateway.BasicItem{
					ID:       id,
					Resource: "ai-provider",
				},
			},
		}, false)
	})
}

func (i *imlProviderModule) AddProvider(ctx context.Context, input *ai_dto.NewProvider) (*ai_dto.SimpleProvider, error) {
	// uuid = name
	if has := i.providerService.CheckUuidDuplicate(ctx, input.Name); has {
		return nil, fmt.Errorf("provider `%s` duplicate", input.Name)
	}
	config, defaultLLM := "{\"base_url\": \"\", \"api_key\": \"\"}", ""
	if err := i.providerService.Create(ctx, &ai.CreateProvider{
		Id:         input.Name,
		Name:       input.Name,
		DefaultLLM: defaultLLM,
		Config:     config,
		Type:       1,
	}); err != nil {
		return nil, err
	}
	// register provider
	iProvider, _ := model_runtime.NewCustomizeProvider(input.Name, input.Name, []model_runtime.IModel{}, "", "")
	model_runtime.Register(input.Name, iProvider)
	return &ai_dto.SimpleProvider{
		Id:            input.Name,
		Name:          input.Name,
		DefaultConfig: config,
		Logo:          model_runtime.GetCustomizeLogo(),
	}, nil
}

func (i *imlProviderModule) SimpleProvider(ctx context.Context, id string) (*ai_dto.SimpleProvider, error) {
	p, has := model_runtime.GetProvider(id)
	if !has {
		return nil, fmt.Errorf("ai provider not found")
	}
	return &ai_dto.SimpleProvider{
		Id:            p.ID(),
		Name:          p.Name(),
		Logo:          p.Logo(),
		DefaultConfig: p.DefaultConfig(),
		GetAPIKeyUrl:  p.HelpUrl(),
	}, nil
}

func (i *imlProviderModule) ConfiguredProviders(ctx context.Context, keyword string) ([]*ai_dto.ConfiguredProviderItem, error) {
	// 获取已配置的AI服务商
	list, err := i.providerService.Search(ctx, keyword, nil, "update_at")
	if err != nil {
		return nil, fmt.Errorf("get provider list error:%v", err)
	}
	aiAPIMap, err := i.aiAPIService.CountMapByProvider(ctx, "", nil)
	if err != nil {
		return nil, fmt.Errorf("get ai api count error:%v", err)
	}
	keyMap, err := i.aiKeyService.CountMapByProvider(ctx, "", nil)
	if err != nil {
		return nil, fmt.Errorf("get ai key count error:%v", err)
	}
	providers := make([]*ai_dto.ConfiguredProviderItem, 0, len(list))
	for _, l := range list {
		// 检查是否有默认Key
		_, err = i.aiKeyService.DefaultKey(ctx, l.Id)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, err
			}
			err = i.aiKeyService.Create(ctx, &ai_key.Create{
				ID:         l.Id,
				Name:       l.Name,
				Config:     l.Config,
				Provider:   l.Id,
				Priority:   1,
				Status:     1,
				ExpireTime: 0,
				UseToken:   0,
				Default:    true,
			})
			if err != nil {
				return nil, fmt.Errorf("create default key error:%v", err)
			}
		}

		p, has := model_runtime.GetProvider(l.Id)
		if !has {
			continue
		}
		apiCount := aiAPIMap[l.Id]

		providers = append(providers, &ai_dto.ConfiguredProviderItem{
			Id:         l.Id,
			Name:       l.Name,
			Logo:       p.Logo(),
			DefaultLLM: l.DefaultLLM,
			Status:     ai_dto.ToProviderStatus(l.Status),
			APICount:   apiCount,
			KeyCount:   keyMap[l.Id],
			CanDelete:  apiCount < 1,
			ModelCount: int64(len(p.Models())),
		})
	}

	return providers, nil
}

func (i *imlProviderModule) SimpleProviders(ctx context.Context) ([]*ai_dto.SimpleProviderItem, error) {
	list, err := i.providerService.List(ctx)
	if err != nil {
		return nil, err
	}
	providers := model_runtime.Providers()

	providerMap := utils.SliceToMap(list, func(e *ai.Provider) string {
		return e.Id
	})

	items := make([]*ai_dto.SimpleProviderItem, 0, len(providers))
	for _, v := range providers {
		item := &ai_dto.SimpleProviderItem{
			Id:            v.ID(),
			Name:          v.Name(),
			Logo:          v.Logo(),
			DefaultConfig: v.DefaultConfig(),
			Status:        ai_dto.ProviderDisabled,
		}
		if info, has := providerMap[v.ID()]; has {
			item.Configured = true
			item.Status = ai_dto.ToProviderStatus(info.Status)
		}
		items = append(items, item)
	}

	return items, nil
}

func (i *imlProviderModule) SimpleConfiguredProviders(ctx context.Context, all bool) ([]*ai_dto.SimpleProviderItem, *ai_dto.BackupProvider, error) {
	list, err := i.providerService.List(ctx)
	if err != nil {
		return nil, nil, err
	}

	items := make([]*ai_dto.SimpleProviderItem, 0, len(list))

	healthProvider := make(map[string]struct{})
	if all {
		healthProvider["ollama"] = struct{}{}
		items = append(items, &ai_dto.SimpleProviderItem{
			Id:            "ollama",
			Name:          "Ollama",
			Logo:          ai_provider_local.OllamaSvg,
			Configured:    true,
			DefaultConfig: "",
			Status:        ai_dto.ProviderEnabled,
			Type:          "local",
		})
	}

	var backup *ai_dto.BackupProvider
	for _, l := range list {
		p, has := model_runtime.GetProvider(l.Id)
		if !has {
			continue
		}
		model, has := p.GetModel(l.DefaultLLM)
		if !has {
			model, has = p.DefaultModel(model_runtime.ModelTypeLLM)
			if !has {
				continue
			}
		}
		item := &ai_dto.SimpleProviderItem{
			Id:            l.Id,
			Name:          l.Name,
			Logo:          p.Logo(),
			DefaultConfig: p.DefaultConfig(),
			Status:        ai_dto.ToProviderStatus(l.Status),
			Configured:    true,
			Model: &ai_dto.BasicInfo{
				Id:   model.ID(),
				Name: model.ID(),
			},
		}
		if item.Status == ai_dto.ProviderEnabled {
			healthProvider[l.Id] = struct{}{}
		}
		items = append(items, item)
	}

	aiBalanceItems, err := i.aiBalanceService.Search(ctx, "", nil, "priority asc")
	if err != nil {
		return nil, nil, err
	}
	for _, item := range aiBalanceItems {
		if _, has := healthProvider[item.Provider]; has {
			backup = &ai_dto.BackupProvider{
				Id:   item.Provider,
				Name: item.Provider,
				Model: &ai_dto.BasicInfo{
					Id:   item.Model,
					Name: item.Model,
				},
				Type: "local",
			}
			break
		}
	}
	return items, backup, nil
}

func (i *imlProviderModule) UnConfiguredProviders(ctx context.Context) ([]*ai_dto.ProviderItem, error) {
	list, err := i.providerService.List(ctx)
	if err != nil {
		return nil, err
	}
	providers := model_runtime.Providers()
	providerMap := utils.SliceToMap(list, func(e *ai.Provider) string {
		return e.Id
	})
	items := make([]*ai_dto.ProviderItem, 0, len(providers))
	for _, v := range providers {
		if _, has := providerMap[v.ID()]; has {
			// 已配置，跳过
			continue
		}
		defaultLLMID := ""
		defaultLLM, _ := v.DefaultModel(model_runtime.ModelTypeLLM)
		if defaultLLM != nil {
			defaultLLMID = defaultLLM.ID()
		}
		item := &ai_dto.ProviderItem{
			Id:         v.ID(),
			Name:       v.Name(),
			Logo:       v.Logo(),
			DefaultLLM: defaultLLMID,
			Sort:       v.Sort(),
		}
		items = append(items, item)
	}
	sort.Slice(items, func(i, j int) bool {
		if items[i].Sort != items[j].Sort {
			if items[i].Sort == 0 {
				return false
			}
			if items[j].Sort == 0 {
				return true
			}
			return items[i].Sort < items[j].Sort
		}
		return items[i].Name < items[j].Name
	})
	return items, nil
}

func (i *imlProviderModule) Provider(ctx context.Context, id string) (*ai_dto.Provider, error) {
	p, has := model_runtime.GetProvider(id)
	if !has {
		return nil, fmt.Errorf("ai provider not found")
	}

	info, err := i.providerService.Get(ctx, id)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		defaultLLM, has := p.DefaultModel(model_runtime.ModelTypeLLM)
		if !has {
			defaultLLM, _ = model_runtime.NewCustomizeModel("", "", "", "", "")
		}
		providerModelConfig := p.GetModelConfig()
		return &ai_dto.Provider{
			Id:               p.ID(),
			Name:             p.Name(),
			Config:           p.DefaultConfig(),
			GetAPIKeyUrl:     p.HelpUrl(),
			DefaultLLM:       defaultLLM.ID(),
			DefaultLLMConfig: defaultLLM.Logo(),
			Status:           ai_dto.ProviderDisabled,
			//Priority:         maxPriority,
			Type: 0,
			ModelConfig: ai_dto.ModelConfig{
				AccessConfigurationStatus: providerModelConfig.AccessConfigurationStatus,
				AccessConfigurationDemo:   providerModelConfig.AccessConfigurationDemo,
			},
		}, nil
	}
	defaultLLM, has := p.GetModel(info.DefaultLLM)
	if !has {
		model, has := p.DefaultModel(model_runtime.ModelTypeLLM)
		if !has || model == nil {
			defaultLLM, _ = model_runtime.NewCustomizeModel("", "", "", "", "")
		} else {
			defaultLLM = model
		}
	}

	return &ai_dto.Provider{
		Id:               info.Id,
		Name:             info.Name,
		Config:           p.MaskConfig(info.Config),
		GetAPIKeyUrl:     p.HelpUrl(),
		DefaultLLM:       defaultLLM.ID(),
		DefaultLLMConfig: defaultLLM.DefaultConfig(),
		//Priority:         info.Priority,
		Status:     ai_dto.ToProviderStatus(info.Status),
		Configured: true,
		Type:       info.Type,
		ModelConfig: ai_dto.ModelConfig{
			AccessConfigurationStatus: false,
			AccessConfigurationDemo:   "",
		},
	}, nil
}

func (i *imlProviderModule) LLMs(ctx context.Context, driver string) ([]*ai_dto.LLMItem, *ai_dto.ProviderItem, error) {
	p, has := model_runtime.GetProvider(driver)
	if !has {
		return nil, nil, fmt.Errorf("ai provider not found")
	}

	llms, _ := p.ModelsByType(model_runtime.ModelTypeLLM)
	modelApiCountMap, _ := i.aiAPIService.CountMapByModel(ctx, "", map[string]interface{}{"provider": driver})
	items := make([]*ai_dto.LLMItem, 0, len(llms))
	for _, v := range llms {
		items = append(items, &ai_dto.LLMItem{
			Id:                  v.ID(),
			Name:                v.Name(),
			Logo:                v.Logo(),
			Config:              v.DefaultConfig(),
			AccessConfiguration: v.AccessConfiguration(),
			ModelParameters:     v.ModelParameters(),
			Scopes: []string{
				"chat",
			},
			Type:     "chat",
			IsSystem: v.Source() != "customize",
			ApiCount: modelApiCountMap[v.ID()],
		})
	}
	info, err := i.providerService.Get(ctx, driver)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, err
		}
		defaultLLMID := ""
		defaultLLM, _ := p.DefaultModel(model_runtime.ModelTypeLLM)
		if defaultLLM != nil {
			defaultLLMID = defaultLLM.ID()
		}
		return items, &ai_dto.ProviderItem{
			Id:         p.ID(),
			Name:       p.Name(),
			DefaultLLM: defaultLLMID,
			Logo:       p.Logo(),
		}, nil
	}

	return items, &ai_dto.ProviderItem{
		Id:         info.Id,
		Name:       info.Name,
		DefaultLLM: info.DefaultLLM,
		Logo:       p.Logo(),
	}, nil
}

func (i *imlProviderModule) UpdateProviderConfig(ctx context.Context, id string, input *ai_dto.UpdateConfig) error {
	p, has := model_runtime.GetProvider(id)
	if !has {
		return fmt.Errorf("ai provider not found")
	}

	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		info, err := i.providerService.Get(ctx, id)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
			if input.DefaultLLM == "" {
				defaultLLM, has := p.DefaultModel(model_runtime.ModelTypeLLM)
				if !has {
					return fmt.Errorf("ai provider default llm not found")
				}
				input.DefaultLLM = defaultLLM.ID()
			}
			info = &ai.Provider{
				Id:         id,
				Name:       p.Name(),
				DefaultLLM: input.DefaultLLM,
				Config:     input.Config,
			}
			err = i.providerService.Create(ctx, &ai.CreateProvider{
				Id:         info.Id,
				Name:       info.Name,
				DefaultLLM: input.DefaultLLM,
				Config:     input.Config,
			})
			if err != nil {
				return err
			}
		}
		model, has := p.GetModel(input.DefaultLLM)
		if !has {
			return fmt.Errorf("ai provider model not found")
		}
		err = p.Check(input.Config)
		if err != nil {
			return err
		}
		input.Config, err = p.GenConfig(input.Config, info.Config)
		if err != nil {
			return err
		}
		if input.DefaultLLM != "" {
			if defaultLLM, has := p.GetModel(input.DefaultLLM); has {
				p.SetDefaultModel(model_runtime.ModelTypeLLM, defaultLLM)
			}
		}
		status := 0
		if input.Enable != nil && *input.Enable {
			status = 1
		}
		pInfo := &ai.SetProvider{
			Name:       &info.Name,
			DefaultLLM: &input.DefaultLLM,
			Config:     &input.Config,
			Status:     &status,
		}
		_, err = i.aiKeyService.DefaultKey(ctx, id)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
			err = i.aiKeyService.Create(ctx, &ai_key.Create{
				ID:         id,
				Name:       info.Name,
				Config:     input.Config,
				Provider:   id,
				Status:     1,
				ExpireTime: 0,
				Default:    true,
				Priority:   1,
			})
		} else {
			err = i.aiKeyService.Save(ctx, id, &ai_key.Edit{
				Config: &input.Config,
				Status: &status,
			})
		}
		if err != nil {
			return err
		}
		err = i.providerService.Save(ctx, id, pInfo)
		if err != nil {
			return err
		}
		// customize provider
		if info.Type == 1 {
			uri, uriErr := model_runtime.GetCustomizeProviderURI(input.Config, false)
			if uriErr != nil {
				return uriErr
			}
			p.SetURI(uri)
		}
		if *pInfo.Status == 0 {
			return i.syncGateway(ctx, cluster.DefaultClusterID, []*gateway.DynamicRelease{
				{
					BasicItem: &gateway.BasicItem{
						ID:       id,
						Resource: "ai-provider",
					},
				},
			}, false)
		}
		// 获取当前供应商默认Key信息
		defaultKey, err := i.aiKeyService.DefaultKey(ctx, id)
		if err != nil {
			return err
		}
		cfg := make(map[string]interface{})
		cfg["provider"] = info.Id
		cfg["model"] = model.Name()
		cfg["model_config"] = model.DefaultConfig()
		cfg["base"] = fmt.Sprintf("%s://%s", p.URI().Scheme(), p.URI().Host())
		return i.syncGateway(ctx, cluster.DefaultClusterID, []*gateway.DynamicRelease{
			{
				BasicItem: &gateway.BasicItem{
					ID:          id,
					Description: info.Name,
					Resource:    "ai-provider",
					Version:     info.UpdateAt.Format("20060102150405"),
					MatchLabels: map[string]string{
						"module": "ai-provider",
					},
				},
				Attr: cfg,
			}, newKey(defaultKey),
		}, true)

		return nil
	})
}

func (i *imlProviderModule) getAiProviders(ctx context.Context) ([]*gateway.DynamicRelease, error) {
	list, err := i.providerService.List(ctx)
	if err != nil {
		return nil, err
	}

	providers := make([]*gateway.DynamicRelease, 0, len(list))
	for _, l := range list {
		// 获取当前供应商所有Key信息

		driver, has := model_runtime.GetProvider(l.Id)
		if !has {
			return nil, fmt.Errorf("provider not found: %s", l.Id)
		}
		model, has := driver.GetModel(l.DefaultLLM)
		if !has {
			return nil, fmt.Errorf("model not found: %s", l.DefaultLLM)
		}
		cfg := make(map[string]interface{})
		cfg["provider"] = l.Id
		cfg["model"] = l.DefaultLLM
		cfg["model_config"] = model.DefaultConfig()
		providers = append(providers, &gateway.DynamicRelease{
			BasicItem: &gateway.BasicItem{
				ID:          l.Id,
				Description: l.Name,
				Resource:    "ai-provider",
				Version:     l.UpdateAt.Format("20060102150405"),
				MatchLabels: map[string]string{
					"module": "ai-provider",
				},
			},
			Attr: cfg,
		})
	}
	return providers, nil
}

func (i *imlProviderModule) initGateway(ctx context.Context, clusterId string, clientDriver gateway.IClientDriver) error {
	providers, err := i.getAiProviders(ctx)
	if err != nil {
		return err
	}

	for _, p := range providers {
		client, err := clientDriver.Dynamic(p.Resource)
		if err != nil {
			return err
		}
		err = client.Online(ctx, p)
		if err != nil {
			return err
		}
	}

	return nil
}

func (i *imlProviderModule) syncGateway(ctx context.Context, clusterId string, releases []*gateway.DynamicRelease, online bool) error {
	client, err := i.clusterService.GatewayClient(ctx, clusterId)
	if err != nil {
		log.Errorf("get apinto client error: %v", err)
		return nil
	}
	defer func() {
		err := client.Close(ctx)
		if err != nil {
			log.Warn("close apinto client:", err)
		}
	}()
	for _, releaseInfo := range releases {
		dynamicClient, err := client.Dynamic(releaseInfo.Resource)
		if err != nil {
			return err
		}
		if online {
			err = dynamicClient.Online(ctx, releaseInfo)
		} else {
			dynamicClient.Offline(ctx, releaseInfo)
		}
		if err != nil {
			return err
		}
	}

	return nil
}

var _ IAIAPIModule = (*imlAIApiModule)(nil)

type imlAIApiModule struct {
	aiAPIService        ai_api.IAPIService          `autowired:""`
	aiAPIUseService     ai_api.IAPIUseService       `autowired:""`
	serviceService      service.IServiceService     `autowired:""`
	aiLocalModelService ai_local.ILocalModelService `autowired:""`
}

func (i *imlAIApiModule) APIs(ctx context.Context, keyword string, providerId string, start int64, end int64, page int, pageSize int, sortCondition string, asc bool, models []string, serviceIds []string) ([]*ai_dto.APIItem, *ai_dto.Condition, int64, error) {
	modelItems := make([]*ai_dto.BasicInfo, 0)
	if providerId == "ollama" {
		items, err := i.aiLocalModelService.Search(ctx, "", nil, "update_at desc")
		if err != nil {
			return nil, nil, 0, err
		}
		modelItems = utils.SliceToSlice(items, func(e *ai_local.LocalModel) *ai_dto.BasicInfo {
			return &ai_dto.BasicInfo{
				Id:   e.Id,
				Name: e.Name,
			}
		})
	} else {
		p, has := model_runtime.GetProvider(providerId)
		if !has {
			return nil, nil, 0, fmt.Errorf("ai provider not found")
		}
		modelItems = utils.SliceToSlice(p.Models(), func(e model_runtime.IModel) *ai_dto.BasicInfo {
			return &ai_dto.BasicInfo{
				Id:   e.ID(),
				Name: e.ID(),
			}
		})
	}

	sortRule := "desc"
	if asc {
		sortRule = "asc"
	}
	services, err := i.serviceService.ServiceListByKind(ctx, service.AIService)
	if err != nil {
		return nil, nil, 0, err
	}
	serviceItems := make([]*ai_dto.BasicInfo, 0, len(services))
	serviceTeamMap := make(map[string]string)
	for _, s := range services {
		serviceItems = append(serviceItems, &ai_dto.BasicInfo{
			Id:   s.Id,
			Name: s.Name,
		})
		serviceTeamMap[s.Id] = s.Team

	}

	condition := &ai_dto.Condition{Services: serviceItems, Models: modelItems}
	switch sortCondition {
	default:
		w := map[string]interface{}{
			"provider": providerId,
		}
		if len(models) > 0 {
			w["model"] = models
		}
		if len(serviceIds) > 0 {
			w["service"] = serviceIds
		}
		apis, err := i.aiAPIService.Search(ctx, keyword, w, "update_at desc")
		if err != nil {
			return nil, nil, 0, err
		}

		if len(apis) <= 0 {
			return nil, condition, 0, nil
		}
		apiMap := make(map[string]*ai_api.API)
		apiIds := make([]string, 0, len(apis))
		for _, a := range apis {
			apiMap[a.ID] = a
			apiIds = append(apiIds, a.ID)
		}
		offset := (page - 1) * pageSize
		results, _, err := i.aiAPIUseService.SumByApisPage(ctx, providerId, start, end, offset, pageSize, fmt.Sprintf("total_token %s", sortRule), apiIds...)
		if err != nil {
			return nil, nil, 0, err
		}

		apiItems := utils.SliceToSlice(results, func(e *ai_api.APIUse) *ai_dto.APIItem {
			info := apiMap[e.API]

			delete(apiMap, e.API)
			return &ai_dto.APIItem{
				Id:          e.API,
				Name:        info.Name,
				Service:     auto.UUID(info.Service),
				Team:        auto.UUID(serviceTeamMap[info.Service]),
				Method:      http.MethodPost,
				RequestPath: info.Path,
				Model: auto.Label{
					Id:   info.Model,
					Name: info.Model,
				},
				UpdateTime: auto.TimeLabel(info.UpdateAt),
				UseToken:   e.TotalToken,
				Disable:    info.Disable,
			}
		})
		sortApis := make([]*ai_dto.APIItem, 0, len(apiMap))
		for _, a := range apiMap {
			sortApis = append(sortApis, &ai_dto.APIItem{
				Id:          a.ID,
				Name:        a.Name,
				Service:     auto.UUID(a.Service),
				Team:        auto.UUID(serviceTeamMap[a.Service]),
				Method:      http.MethodPost,
				RequestPath: a.Path,
				Model: auto.Label{
					Id:   a.Model,
					Name: a.Model,
				},
				UpdateTime: auto.TimeLabel(a.UpdateAt),
				UseToken:   0,
				Disable:    a.Disable,
			})
		}
		// 排序
		sort.Slice(sortApis, func(i, j int) bool {
			return time.Time(sortApis[i].UpdateTime).After(time.Time(sortApis[j].UpdateTime))
		})
		size := pageSize - len(apiItems)
		for i := offset; i < offset+size && i < len(sortApis); i++ {
			apiItems = append(apiItems, sortApis[i])
		}

		total := int64(len(apis))
		return apiItems, condition, total, nil
	}
}
