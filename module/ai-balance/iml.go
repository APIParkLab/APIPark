package ai_balance

import (
	"context"
	"errors"
	"fmt"
	"sort"

	"github.com/APIParkLab/APIPark/service/setting"

	ai_provider_local "github.com/APIParkLab/APIPark/ai-provider/local"

	model_runtime "github.com/APIParkLab/APIPark/ai-provider/model-runtime"

	"gorm.io/gorm"

	ai_key "github.com/APIParkLab/APIPark/service/ai-key"

	ai_api "github.com/APIParkLab/APIPark/service/ai-api"

	"github.com/google/uuid"

	ai_balance "github.com/APIParkLab/APIPark/service/ai-balance"

	"github.com/eolinker/go-common/store"

	"github.com/APIParkLab/APIPark/gateway"

	"github.com/APIParkLab/APIPark/service/cluster"

	ai_balance_dto "github.com/APIParkLab/APIPark/module/ai-balance/dto"
	"github.com/eolinker/eosc/log"
)

var _ IBalanceModule = (*imlBalanceModule)(nil)

type imlBalanceModule struct {
	clusterService cluster.IClusterService    `autowired:""`
	aiAPIService   ai_api.IAPIService         `autowired:""`
	aiKeyService   ai_key.IKeyService         `autowired:""`
	balanceService ai_balance.IBalanceService `autowired:""`
	settingService setting.ISettingService    `autowired:""`
	transaction    store.ITransaction         `autowired:""`
}

func (i *imlBalanceModule) SyncLocalBalances(ctx context.Context, address string) error {
	releases, err := i.getLocalBalances(ctx, address)
	if err != nil {
		return err
	}
	return i.syncGateway(ctx, cluster.DefaultClusterID, releases, true)
}

func (i *imlBalanceModule) Create(ctx context.Context, input *ai_balance_dto.Create) error {
	has, err := i.balanceService.Exist(ctx, input.Provider, input.Model)
	if err != nil {
		return err
	}
	if has {
		return fmt.Errorf("model already exists")
	}
	priority, err := i.balanceService.MaxPriority(ctx)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		priority = 0
	}
	if input.Id == "" {
		input.Id = uuid.NewString()
	}
	providerName := ""
	modelName := ""
	base := ""
	switch input.Type {
	case ai_balance_dto.ModelTypeOnline:
		p, has := model_runtime.GetProvider(input.Provider)
		if !has {
			return fmt.Errorf("provider not found")
		}
		providerName = p.Name()
		modelName = input.Model
		base = fmt.Sprintf("%s://%s", p.URI().Scheme(), p.URI().Host())
	case ai_balance_dto.ModelTypeLocal:
		input.Provider = ai_provider_local.ProviderLocal
		providerName = ai_provider_local.ProviderLocal
		modelName = input.Model
		v, has := i.settingService.Get(ctx, "system.ai_model.ollama_address")
		if !has {
			return fmt.Errorf("ollama address not found")
		}
		base = v
	}

	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		err = i.balanceService.Create(ctx, &ai_balance.Create{
			Id:           input.Id,
			Priority:     priority + 1,
			Provider:     input.Provider,
			ProviderName: providerName,
			Model:        input.Model,
			ModelName:    modelName,
			Type:         ai_balance_dto.ModelType(input.Type).Int(),
		})
		if err != nil {
			return err
		}
		item, err := i.balanceService.Get(ctx, input.Id)
		if err != nil {
			return err
		}
		return i.syncGateway(ctx, cluster.DefaultClusterID, []*gateway.DynamicRelease{newRelease(item, base)}, true)
	})

}

func newRelease(item *ai_balance.Balance, base string) *gateway.DynamicRelease {

	cfg := make(map[string]interface{})
	cfg["provider"] = item.Provider
	cfg["model"] = item.Model
	cfg["model_config"] = ai_provider_local.LocalConfig
	cfg["base"] = base
	cfg["priority"] = item.Priority
	return &gateway.DynamicRelease{
		BasicItem: &gateway.BasicItem{
			ID:          item.Id,
			Description: item.ModelName,
			Resource:    "ai-provider",
			Version:     item.UpdateAt.Format("20060102150405"),
			MatchLabels: map[string]string{
				"module": "ai-provider",
			},
		},
		Attr: cfg,
	}
}

func (i *imlBalanceModule) Sort(ctx context.Context, input *ai_balance_dto.Sort) error {
	var list []*ai_balance.Balance
	var err error
	switch input.Sort {
	case "after":
		list, err = i.balanceService.SortAfter(ctx, input.Origin, input.Target)
	default:
		list, err = i.balanceService.SortBefore(ctx, input.Origin, input.Target)
	}
	if err != nil {
		return err
	}
	v, has := i.settingService.Get(ctx, "system.ai_model.ollama_address")
	if !has {
		return fmt.Errorf("ollama address not found")
	}
	releases := make([]*gateway.DynamicRelease, 0, len(list))
	for _, item := range list {
		base := v
		if item.Provider != ai_provider_local.ProviderLocal {
			p, has := model_runtime.GetProvider(item.Provider)
			if !has {
				continue
			}
			base = fmt.Sprintf("%s://%s", p.URI().Scheme(), p.URI().Host())
		}

		releases = append(releases, newRelease(item, base))
	}
	err = i.syncGateway(ctx, cluster.DefaultClusterID, releases, true)
	if err != nil {
		return err
	}
	return nil
}

func (i *imlBalanceModule) List(ctx context.Context, keyword string) ([]*ai_balance_dto.Item, error) {
	list, err := i.balanceService.Search(ctx, keyword, nil, "priority asc")
	if err != nil {
		return nil, err
	}
	sort.Slice(list, func(i, j int) bool {
		return list[i].Priority < list[j].Priority
	})
	aiAPIMap, err := i.aiAPIService.CountMapByModel(ctx, "", nil)
	if err != nil {
		return nil, fmt.Errorf("get ai api count error:%v", err)
	}
	keyMap, err := i.aiKeyService.CountMapByProvider(ctx, "", nil)
	if err != nil {
		return nil, fmt.Errorf("get ai key count error:%v", err)
	}
	result := make([]*ai_balance_dto.Item, 0, len(list))
	for i, item := range list {
		priority := i + 1
		result = append(result, &ai_balance_dto.Item{
			Id: item.Id,
			Provider: &ai_balance_dto.BasicItem{
				Id:   item.Provider,
				Name: item.ProviderName,
			},
			Model: &ai_balance_dto.BasicItem{
				Id:   item.Model,
				Name: item.ModelName,
			},
			Priority: priority,
			Type:     ai_balance_dto.ModelTypeFromInt(item.Type),
			State:    ai_balance_dto.ModelStateFromInt(item.State),
			APICount: aiAPIMap[item.Model],
			KeyCount: keyMap[item.Provider],
		})
	}
	return result, nil
}

func (i *imlBalanceModule) Delete(ctx context.Context, id string) error {
	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		err := i.balanceService.Delete(ctx, id)
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

func (i *imlBalanceModule) syncGateway(ctx context.Context, clusterId string, releases []*gateway.DynamicRelease, online bool) error {
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

func (i *imlBalanceModule) getLocalBalances(ctx context.Context, v string) ([]*gateway.DynamicRelease, error) {
	balances, err := i.balanceService.Search(ctx, "", map[string]interface{}{"provider": ai_provider_local.ProviderLocal}, "priority asc")
	if err != nil {
		return nil, err
	}
	if v == "" {
		var has bool
		v, has = i.settingService.Get(ctx, "system.ai_model.ollama_address")
		if !has {
			return nil, fmt.Errorf("ollama address not found")
		}
	}

	releases := make([]*gateway.DynamicRelease, 0, len(balances))
	for _, item := range balances {
		base := v
		if item.Provider != ai_provider_local.ProviderLocal {
			p, has := model_runtime.GetProvider(item.Provider)
			if !has {
				continue
			}
			base = fmt.Sprintf("%s://%s%s", p.URI().Scheme(), p.URI().Host(), p.URI().Path())
		}
		releases = append(releases, newRelease(item, base))
	}
	return releases, nil
}

func (i *imlBalanceModule) getBalances(ctx context.Context) ([]*gateway.DynamicRelease, error) {
	balances, err := i.balanceService.Search(ctx, "", nil, "priority asc")
	if err != nil {
		return nil, err
	}
	v, has := i.settingService.Get(ctx, "system.ai_model.ollama_address")
	if !has {
		return nil, fmt.Errorf("ollama address not found")
	}
	releases := make([]*gateway.DynamicRelease, 0, len(balances))
	for _, item := range balances {
		base := v
		if item.Provider != ai_provider_local.ProviderLocal {
			p, has := model_runtime.GetProvider(item.Provider)
			if !has {
				continue
			}
			base = fmt.Sprintf("%s://%s%s", p.URI().Scheme(), p.URI().Host(), p.URI().Path())
		}
		releases = append(releases, newRelease(item, base))
	}
	return releases, nil
}

func (i *imlBalanceModule) initGateway(ctx context.Context, clusterId string, clientDriver gateway.IClientDriver) error {
	releases, err := i.getBalances(ctx)
	if err != nil {
		return err
	}
	for _, p := range releases {
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
