package system_apikey

import (
	"context"

	"github.com/eolinker/go-common/utils"

	"github.com/google/uuid"

	system_apikey "github.com/APIParkLab/APIPark/service/system-apikey"

	system_apikey_dto "github.com/APIParkLab/APIPark/module/system-apikey/dto"
)

var _ IAPIKeyModule = new(imlAPIKeyModule)

type imlAPIKeyModule struct {
	apikeyService system_apikey.IAPIKeyService `autowired:""`
}

func (i *imlAPIKeyModule) Create(ctx context.Context, input *system_apikey_dto.Create) error {
	if input.Id == "" {
		input.Id = uuid.NewString()
	}
	return i.apikeyService.Create(ctx, &system_apikey.Create{
		Id:      input.Id,
		Name:    input.Name,
		Value:   input.Value,
		Expired: input.Expired,
	})
}

func (i *imlAPIKeyModule) Update(ctx context.Context, id string, input *system_apikey_dto.Update) error {
	return i.apikeyService.Save(ctx, id, &system_apikey.Update{
		Name:    input.Name,
		Value:   input.Value,
		Expired: input.Expired,
	})
}

func (i *imlAPIKeyModule) Delete(ctx context.Context, id string) error {
	return i.apikeyService.Delete(ctx, id)
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
