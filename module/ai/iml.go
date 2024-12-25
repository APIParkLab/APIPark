package ai

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"sort"
	"time"

	ai_key_dto "github.com/APIParkLab/APIPark/module/ai-key/dto"

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
	aiAPIService    ai_api.IAPIService      `autowired:""`
	aiKeyService    ai_key.IKeyService      `autowired:""`
	transaction     store.ITransaction      `autowired:""`
}

func (i *imlProviderModule) SimpleProvider(ctx context.Context, id string) (*ai_dto.SimpleProvider, error) {
	p, has := model_runtime.GetProvider(id)
	if !has {
		return nil, fmt.Errorf("ai provider not found")
	}
	return &ai_dto.SimpleProvider{
		Id:           p.ID(),
		Name:         p.Name(),
		Logo:         p.Logo(),
		GetAPIKeyUrl: p.HelpUrl(),
	}, nil
}

func (i *imlProviderModule) Sort(ctx context.Context, input *ai_dto.Sort) error {
	return i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		list, err := i.providerService.List(ctx)
		if err != nil {
			return err
		}
		providerMap := utils.SliceToMap(list, func(e *ai.Provider) string {
			return e.Id
		})
		for index, id := range input.Providers {
			_, has := providerMap[id]
			if !has {
				continue
			}
			priority := index + 1
			err = i.providerService.Save(txCtx, id, &ai.SetProvider{
				Priority: &priority,
			})
			if err != nil {
				return err
			}
		}
		return nil
	})
}

func (i *imlProviderModule) ConfiguredProviders(ctx context.Context) ([]*ai_dto.ConfiguredProviderItem, *auto.Label, error) {
	// 获取已配置的AI服务商
	list, err := i.providerService.List(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("get provider list error:%v", err)
	}
	aiAPIMap, err := i.aiAPIService.CountMapByProvider(ctx, "", nil)
	if err != nil {
		return nil, nil, fmt.Errorf("get ai api count error:%v", err)
	}
	providers := make([]*ai_dto.ConfiguredProviderItem, 0, len(list))
	for _, l := range list {
		// 检查是否有默认Key
		_, err = i.aiKeyService.DefaultKey(ctx, l.Id)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, nil, err
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
				return nil, nil, fmt.Errorf("create default key error:%v", err)
			}
		}

		p, has := model_runtime.GetProvider(l.Id)
		if !has {
			continue
		}
		keys, err := i.aiKeyService.KeysByProvider(ctx, l.Id)
		if err != nil {
			return nil, nil, fmt.Errorf("get provider keys error:%v", err)
		}

		keysStatus := make([]*ai_dto.KeyStatus, 0, len(keys))
		for _, k := range keys {
			status := ai_key_dto.ToKeyStatus(k.Status)
			switch status {
			case ai_key_dto.KeyNormal, ai_key_dto.KeyDisable, ai_key_dto.KeyError:
			default:
				status = ai_key_dto.KeyError
			}
			keysStatus = append(keysStatus, &ai_dto.KeyStatus{
				Id:     k.ID,
				Name:   k.Name,
				Status: status.String(),
			})
		}

		providers = append(providers, &ai_dto.ConfiguredProviderItem{
			Id:         l.Id,
			Name:       l.Name,
			Logo:       p.Logo(),
			DefaultLLM: l.DefaultLLM,
			Status:     ai_dto.ToProviderStatus(l.Status),
			APICount:   aiAPIMap[l.Id],
			KeyCount:   len(keysStatus),
			KeyStatus:  keysStatus,
			Priority:   l.Priority,
		})
	}
	sort.Slice(providers, func(i, j int) bool {
		if providers[i].Priority != providers[j].Priority {
			if providers[i].Priority == 0 {
				return false
			}
			if providers[j].Priority == 0 {
				return true
			}
			return providers[i].Priority < providers[j].Priority
		}
		return providers[i].Name < providers[j].Name
	})
	var backup *auto.Label
	for _, p := range providers {
		if p.Status == ai_dto.ProviderEnabled {
			backup = &auto.Label{
				Id:   p.Id,
				Name: p.Name,
			}
			break
		}
	}
	return providers, backup, nil
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
			Id:     v.ID(),
			Name:   v.Name(),
			Logo:   v.Logo(),
			Status: ai_dto.ProviderDisabled,
		}
		if info, has := providerMap[v.ID()]; has {
			item.Configured = true
			item.Status = ai_dto.ToProviderStatus(info.Status)
		}
		items = append(items, item)
	}
	return items, nil
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
		defaultLLM, _ := v.DefaultModel(model_runtime.ModelTypeLLM)
		item := &ai_dto.ProviderItem{
			Id:         v.ID(),
			Name:       v.Name(),
			Logo:       v.Logo(),
			DefaultLLM: defaultLLM.ID(),
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
	maxPriority, err := i.providerService.MaxPriority(ctx)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
	}
	maxPriority = maxPriority + 1
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
			Status:           ai_dto.ProviderDisabled,
			Priority:         maxPriority,
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
	if info.Priority == 0 {
		info.Priority = maxPriority
	}

	return &ai_dto.Provider{
		Id:               info.Id,
		Name:             info.Name,
		Config:           p.MaskConfig(info.Config),
		GetAPIKeyUrl:     p.HelpUrl(),
		DefaultLLM:       defaultLLM.ID(),
		DefaultLLMConfig: defaultLLM.DefaultConfig(),
		Priority:         info.Priority,
		Status:           ai_dto.ProviderEnabled,
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
			Id:         p.ID(),
			Name:       p.Name(),
			DefaultLLM: defaultLLM.ID(),
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
		status := 0
		if enable {
			status = 1
		}
		err = i.providerService.Save(txCtx, id, &ai.SetProvider{
			Status: &status,
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
		status := 0
		if input.Enable != nil && *input.Enable {
			status = 1
		}
		pInfo := &ai.SetProvider{
			Name:       &info.Name,
			DefaultLLM: &input.DefaultLLM,
			Config:     &input.Config,
			Priority:   input.Priority,
		}
		_, err = i.aiKeyService.DefaultKey(ctx, id)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
			err = i.aiKeyService.Create(ctx, &ai_key.Create{
				ID:         id,
				Name:       info.Name,
				Config:     info.Config,
				Provider:   id,
				Status:     1,
				ExpireTime: 0,
				Default:    true,
			})
		} else {
			err = i.aiKeyService.Save(ctx, id, &ai_key.Edit{
				Config: &info.Config,
			})
		}
		if err != nil {
			return err
		}
		if input.Enable != nil {
			status = 0
			if *input.Enable {
				status = 1
			}
			pInfo.Status = &status
		}
		err = i.providerService.Save(ctx, id, pInfo)
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

var _ IAIAPIModule = (*imlAIApiModule)(nil)

type imlAIApiModule struct {
	aiAPIService    ai_api.IAPIService    `autowired:""`
	aiAPIUseService ai_api.IAPIUseService `autowired:""`
}

func (i *imlAIApiModule) APIs(ctx context.Context, keyword string, providerId string, start int64, end int64, page int, pageSize int, sortCondition string, asc bool) ([]*ai_dto.APIItem, int64, error) {
	sortRule := "desc"
	if asc {
		sortRule = "asc"
	}
	switch sortCondition {
	default:
		apis, err := i.aiAPIService.Search(ctx, keyword, map[string]interface{}{
			"provider": providerId,
		}, "update_at desc")
		if err != nil {
			return nil, 0, err
		}

		if len(apis) <= 0 {
			return nil, 0, nil
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
			return nil, 0, err
		}

		apiItems := utils.SliceToSlice(results, func(e *ai_api.APIUse) *ai_dto.APIItem {
			info := apiMap[e.API]

			delete(apiMap, e.API)
			return &ai_dto.APIItem{
				Id:          e.API,
				Name:        info.Name,
				Service:     auto.UUID(info.Service),
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
		return apiItems, total, nil
	}
}
