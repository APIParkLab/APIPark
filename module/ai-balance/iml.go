package ai_balance

import (
	"context"
	"fmt"
	"sort"

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
	transaction    store.ITransaction         `autowired:""`
}

func (i *imlBalanceModule) Create(ctx context.Context, input *ai_balance_dto.Create) error {
	priority, err := i.balanceService.MaxPriority(ctx)
	if err != nil {
		return err
	}
	if input.Id == "" {
		input.Id = uuid.NewString()
	}
	providerName := ""
	modelName := ""
	// TODO: 名称进行优化
	switch input.Type {
	case ai_balance_dto.ModelTypeOnline:
	case ai_balance_dto.ModelTypeLocal:

	}
	return i.balanceService.Create(ctx, &ai_balance.Create{
		Id:           input.Id,
		Priority:     priority + 1,
		Provider:     input.Provider,
		ProviderName: providerName,
		Model:        input.Model,
		ModelName:    modelName,
		Type:         ai_balance_dto.ModelType(input.Type).Int(),
	})
}

func newRelease(item *ai_balance.Balance) *gateway.DynamicRelease {
	return &gateway.DynamicRelease{}
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
	for _, item := range list {
		err = i.syncGateway(ctx, cluster.DefaultClusterID, []*gateway.DynamicRelease{newRelease(item)}, true)
		if err != nil {
			return err
		}
	}
	return nil
}

func (i *imlBalanceModule) List(ctx context.Context) ([]*ai_balance_dto.Item, error) {
	list, err := i.balanceService.List(ctx)
	if err != nil {
		return nil, err
	}
	sort.Slice(list, func(i, j int) bool {
		return list[i].Priority < list[j].Priority
	})
	aiAPIMap, err := i.aiAPIService.CountMapByProvider(ctx, "", nil)
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
	return i.balanceService.Delete(ctx, id)
}

func (i *imlBalanceModule) syncGateway(ctx context.Context, clusterId string, releases []*gateway.DynamicRelease, online bool) error {
	return nil
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
