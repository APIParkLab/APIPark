package system

import (
	"context"

	"github.com/eolinker/go-common/server"

	ai_provider_local "github.com/APIParkLab/APIPark/ai-provider/local"
	"github.com/eolinker/go-common/register"

	"github.com/eolinker/go-common/store"

	"github.com/eolinker/go-common/utils"

	system_dto "github.com/APIParkLab/APIPark/module/system/dto"
	"github.com/APIParkLab/APIPark/service/setting"
)

var (
	_ ISettingModule = (*imlSettingModule)(nil)
)

type imlSettingModule struct {
	settingService setting.ISettingService `autowired:""`
	transaction    store.ITransaction      `autowired:""`
}

func (i *imlSettingModule) Get(ctx context.Context) *system_dto.Setting {
	v, err := i.settingService.All(ctx)
	if err != nil {
		return &system_dto.Setting{}
	}
	return system_dto.MapStringToStruct[system_dto.Setting](v)
}

func (i *imlSettingModule) Set(ctx context.Context, input *system_dto.InputSetting) error {
	err := input.Validate()
	if err != nil {
		return err
	}

	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		keyMap := system_dto.ToKeyMap(input)
		userId := utils.UserId(ctx)
		for k, v := range keyMap {
			err = i.settingService.Set(ctx, k, v, userId)
			if err != nil {
				return err
			}
		}
		if input.OllamaAddress != nil {
			ai_provider_local.ResetOllamaAddress(*input.OllamaAddress)
		}
		return nil
	})
}

func (i *imlSettingModule) OnInit() {
	register.Handle(func(v server.Server) {
		ctx := context.Background()

		address, has := i.settingService.Get(ctx, "system.ai_model.ollama_address")
		if has {
			ai_provider_local.ResetOllamaAddress(address)
		}

	})
}
