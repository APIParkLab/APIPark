package ai

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"time"

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

func newAIUpstream(provider string, uri model_runtime.IProviderURI) *gateway.DynamicRelease {
	return &gateway.DynamicRelease{
		BasicItem: &gateway.BasicItem{
			ID:          provider,
			Description: fmt.Sprintf("auto create by ai provider %s", provider),
			Resource:    "service",
			Version:     time.Now().Format("20060102150405"),
			MatchLabels: map[string]string{
				"module": "service",
			},
		},
		Attr: map[string]interface{}{
			"driver":    "http",
			"balance":   "round-robin",
			"nodes":     []string{fmt.Sprintf("%s weight=100", uri.Host())},
			"pass_host": "node",
			"scheme":    uri.Scheme(),
			"timeout":   300000,
		},
	}
}

var _ IProviderModule = (*imlProviderModule)(nil)

type imlProviderModule struct {
	providerService ai.IProviderService     `autowired:""`
	clusterService  cluster.IClusterService `autowired:""`
	transaction     store.ITransaction      `autowired:""`
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
			Id:   v.ID(),
			Name: v.Name(),
			Logo: v.Logo(),
		}
		if _, has := providerMap[v.ID()]; has {
			item.Configured = true
		}
		items = append(items, item)
	}
	return items, nil
}

func (i *imlProviderModule) Providers(ctx context.Context) ([]*ai_dto.ProviderItem, error) {
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

		item := &ai_dto.ProviderItem{
			Id:        v.ID(),
			Name:      v.Name(),
			Logo:      v.Logo(),
			Recommend: v.Recommend(),
			Sort:      v.Sort(),
		}
		if info, has := providerMap[v.ID()]; has {
			defaultLLM, has := v.GetModel(info.DefaultLLM)
			if !has {
				continue
			}
			item.Configured = true
			item.DefaultLLM = defaultLLM.ID()
			item.DefaultLLMLogo = defaultLLM.Logo()
			item.UpdateTime = info.UpdateAt
		}
		items = append(items, item)
	}
	sort.Slice(items, func(i, j int) bool {
		if items[i].Configured == items[j].Configured && items[i].Configured {
			return items[i].Name < items[j].Name
		}
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
			return nil, fmt.Errorf("ai provider llm not found")
		}
		return &ai_dto.Provider{
			Id:               p.ID(),
			Name:             p.Name(),
			Config:           p.DefaultConfig(),
			GetAPIKeyUrl:     p.HelpUrl(),
			DefaultLLM:       defaultLLM.ID(),
			DefaultLLMConfig: defaultLLM.Logo(),
		}, nil
	}
	defaultLLM, has := p.GetModel(info.DefaultLLM)
	if !has {
		model, has := p.DefaultModel(model_runtime.ModelTypeLLM)
		if !has {
			return nil, fmt.Errorf("ai provider llm not found")
		}
		defaultLLM = model
	}
	return &ai_dto.Provider{
		Id:               info.Id,
		Name:             info.Name,
		Config:           p.MaskConfig(info.Config),
		GetAPIKeyUrl:     p.HelpUrl(),
		DefaultLLM:       defaultLLM.ID(),
		DefaultLLMConfig: defaultLLM.DefaultConfig(),
	}, nil
}

func (i *imlProviderModule) LLMs(ctx context.Context, driver string) ([]*ai_dto.LLMItem, *ai_dto.ProviderItem, error) {
	p, has := model_runtime.GetProvider(driver)
	if !has {
		return nil, nil, fmt.Errorf("ai provider not found")
	}

	llms, has := p.ModelsByType(model_runtime.ModelTypeLLM)
	if !has {
		return nil, nil, fmt.Errorf("ai provider not found")
	}

	items := make([]*ai_dto.LLMItem, 0, len(llms))
	for _, v := range llms {
		items = append(items, &ai_dto.LLMItem{
			Id:     v.ID(),
			Logo:   v.Logo(),
			Config: v.DefaultConfig(),
			Scopes: []string{
				"chat",
			},
		})
	}
	info, err := i.providerService.Get(ctx, driver)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, err
		}
		defaultLLM, has := p.DefaultModel(model_runtime.ModelTypeLLM)
		if !has {
			return nil, nil, fmt.Errorf("ai provider default llm not found")
		}
		return items, &ai_dto.ProviderItem{
			Id:             p.ID(),
			Name:           p.Name(),
			DefaultLLM:     defaultLLM.ID(),
			DefaultLLMLogo: defaultLLM.Logo(),
			Logo:           p.Logo(),
			Configured:     false,
		}, nil
	}

	return items, &ai_dto.ProviderItem{Id: info.Id, Name: info.Name, DefaultLLM: info.DefaultLLM, Logo: p.Logo(), Configured: true}, nil
}

func (i *imlProviderModule) UpdateProviderStatus(ctx context.Context, id string, enable bool) error {
	driver, has := model_runtime.GetProvider(id)
	if !has {
		return fmt.Errorf("ai provider not found")
	}
	info, err := i.providerService.Get(ctx, id)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		return fmt.Errorf("ai provider not found")
	}

	return i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		err = i.providerService.Save(txCtx, id, &ai.SetProvider{
			Status: &enable,
		})
		if err != nil {
			return err
		}
		if enable {
			cfg := make(map[string]interface{})
			err = json.Unmarshal([]byte(info.Config), &cfg)
			if err != nil {
				log.Errorf("unmarshal ai provider config error,id is %s,err is %v", info.Id, err)
				return err
			}
			cfg["driver"] = info.Id

			return i.syncGateway(txCtx, cluster.DefaultClusterID, []*gateway.DynamicRelease{{
				BasicItem: &gateway.BasicItem{
					ID:          info.Id,
					Description: info.Name,
					Version:     info.UpdateAt.Format("20060102150405"),
					MatchLabels: map[string]string{
						"module": "ai-provider",
					},
				},
				Attr: cfg,
			}, newAIUpstream(info.Id, driver.URI()),
			}, enable)
		} else {
			return i.syncGateway(txCtx, cluster.DefaultClusterID, []*gateway.DynamicRelease{
				{
					BasicItem: &gateway.BasicItem{
						ID:       info.Id,
						Resource: info.Id,
					},
				},
				{
					BasicItem: &gateway.BasicItem{
						ID:       info.Id,
						Resource: "service",
					},
				},
			}, enable)
		}

	})

}

func (i *imlProviderModule) UpdateProviderConfig(ctx context.Context, id string, input *ai_dto.UpdateConfig) error {
	p, has := model_runtime.GetProvider(id)
	if !has {
		return fmt.Errorf("ai provider not found")
	}
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
	}
	err = p.Check(input.Config)
	if err != nil {
		return err
	}
	input.Config, err = p.GenConfig(input.Config, info.Config)
	if err != nil {
		return err
	}
	return i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		err = i.providerService.Save(ctx, id, &ai.SetProvider{
			Name:       &info.Name,
			DefaultLLM: &info.DefaultLLM,
			Config:     &input.Config,
		})
		if err != nil {
			return err
		}
		cfg := make(map[string]interface{})
		err = json.Unmarshal([]byte(input.Config), &cfg)
		if err != nil {
			log.Errorf("unmarshal ai provider config error,id is %s,err is %v", id, err)
			return err
		}

		return i.syncGateway(ctx, cluster.DefaultClusterID, []*gateway.DynamicRelease{
			{
				BasicItem: &gateway.BasicItem{
					ID:          id,
					Description: info.Name,
					Resource:    id,
					Version:     info.UpdateAt.Format("20060102150405"),
					MatchLabels: map[string]string{
						"module": "ai-provider",
					},
				},
				Attr: cfg,
			}, newAIUpstream(id, p.URI()),
		}, true)
	})
}

func (i *imlProviderModule) UpdateProviderDefaultLLM(ctx context.Context, id string, input *ai_dto.UpdateLLM) error {
	_, err := i.providerService.Get(ctx, id)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		return fmt.Errorf("ai provider not found")
	}
	return i.providerService.Save(ctx, id, &ai.SetProvider{
		DefaultLLM: &input.LLM,
	})
}

func (i *imlProviderModule) getAiProviders(ctx context.Context) ([]*gateway.DynamicRelease, error) {
	list, err := i.providerService.List(ctx)
	if err != nil {
		return nil, err
	}
	providers := make([]*gateway.DynamicRelease, 0, len(list))
	for _, p := range list {
		cfg := make(map[string]interface{})
		err = json.Unmarshal([]byte(p.Config), &cfg)
		if err != nil {
			log.Errorf("unmarshal ai provider config error,id is %s,err is %v", p.Id, err)
			continue
		}
		providers = append(providers, &gateway.DynamicRelease{
			BasicItem: &gateway.BasicItem{
				ID:          p.Id,
				Description: p.Name,
				Resource:    p.Id,
				Version:     p.UpdateAt.Format("20060102150405"),
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
	serviceClient, err := clientDriver.Dynamic("service")
	if err != nil {
		return err
	}
	for _, p := range providers {
		driver, has := model_runtime.GetProvider(p.ID)
		if !has {
			continue
		}
		client, err := clientDriver.Dynamic(p.ID)
		if err != nil {
			return err
		}
		err = client.Online(ctx, p)
		if err != nil {
			return err
		}

		err = serviceClient.Online(ctx, newAIUpstream(p.ID, driver.URI()))
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
			err = dynamicClient.Offline(ctx, releaseInfo)
		}
		if err != nil {
			return err
		}
	}

	return nil
}
