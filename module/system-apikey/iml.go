package system_apikey

import (
	"context"
	"time"

	"github.com/APIParkLab/APIPark/service/cluster"

	"github.com/eolinker/go-common/store"

	"github.com/APIParkLab/APIPark/gateway"

	"github.com/eolinker/go-common/utils"

	"github.com/google/uuid"

	system_apikey "github.com/APIParkLab/APIPark/service/system-apikey"

	system_apikey_dto "github.com/APIParkLab/APIPark/module/system-apikey/dto"
)

var _ IAPIKeyModule = new(imlAPIKeyModule)

type imlAPIKeyModule struct {
	apikeyService system_apikey.IAPIKeyService `autowired:""`
	clusterServer cluster.IClusterService      `autowired:""`
	transaction   store.ITransaction           `autowired:""`
}

func (i *imlAPIKeyModule) Create(ctx context.Context, input *system_apikey_dto.Create) error {
	if input.Id == "" {
		input.Id = uuid.NewString()
	}
	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		err := i.apikeyService.Create(ctx, &system_apikey.Create{
			Id:      input.Id,
			Name:    input.Name,
			Value:   input.Value,
			Expired: input.Expired,
		})
		if err != nil {
			return err
		}
		client, err := i.clusterServer.GatewayClient(ctx, cluster.DefaultClusterID)
		if err != nil {
			return err
		}
		return i.online(ctx, client)
	})
}

func (i *imlAPIKeyModule) Update(ctx context.Context, id string, input *system_apikey_dto.Update) error {
	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		err := i.apikeyService.Save(ctx, id, &system_apikey.Update{
			Name:    input.Name,
			Value:   input.Value,
			Expired: input.Expired,
		})
		if err != nil {
			return err
		}
		client, err := i.clusterServer.GatewayClient(ctx, cluster.DefaultClusterID)
		if err != nil {
			return err
		}
		return i.online(ctx, client)
	})
}

func (i *imlAPIKeyModule) Delete(ctx context.Context, id string) error {
	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		err := i.apikeyService.Delete(ctx, id)
		if err != nil {
			return err
		}
		client, err := i.clusterServer.GatewayClient(ctx, cluster.DefaultClusterID)
		if err != nil {
			return err
		}
		return i.online(ctx, client)
	})
}

func (i *imlAPIKeyModule) Get(ctx context.Context, id string) (*system_apikey_dto.APIKey, error) {
	info, err := i.apikeyService.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	return system_apikey_dto.ToAPIKey(info), nil
}

func (i *imlAPIKeyModule) Search(ctx context.Context, keyword string) ([]*system_apikey_dto.Item, error) {
	list, err := i.apikeyService.Search(ctx, keyword, nil, "create_at desc")
	if err != nil {
		return nil, err
	}

	return utils.SliceToSlice(list, system_apikey_dto.ToAPIKeyItem), nil
}

func (i *imlAPIKeyModule) SimpleList(ctx context.Context) ([]*system_apikey_dto.SimpleItem, error) {
	list, err := i.apikeyService.Search(ctx, "", nil, "create_at desc")
	if err != nil {
		return nil, err
	}

	return utils.SliceToSlice(list, system_apikey_dto.ToAPIKeySimpleItem), nil
}

func (i *imlAPIKeyModule) online(ctx context.Context, client gateway.IClientDriver) error {

	// 获取所有apikey
	list, err := i.apikeyService.Search(ctx, "", nil, "create_at desc")
	if err != nil {
		return err
	}
	app := &gateway.ApplicationRelease{
		BasicItem: &gateway.BasicItem{
			ID:          "apipark-global",
			Description: "apipark global consumer",
			Version:     time.Now().Format("20060102150405"),
		},
		Authorizations: utils.SliceToSlice(list, func(a *system_apikey.APIKey) *gateway.Authorization {
			authCfg := map[string]interface{}{
				"apikey": utils.Md5(a.Value),
			}
			return &gateway.Authorization{
				Type:           "apikey",
				Position:       "header",
				TokenName:      "Authorization",
				Expire:         a.Expired,
				Config:         authCfg,
				HideCredential: true,
				Label: map[string]string{
					"authorization":      a.Id,
					"authorization_name": a.Name,
				},
			}
		}),
	}
	err = client.Application().Online(ctx, app)
	if err != nil {
		return err
	}
	return nil
}

func (i *imlAPIKeyModule) initGateway(ctx context.Context, clusterId string, clientDriver gateway.IClientDriver) error {
	return i.online(ctx, clientDriver)
}
