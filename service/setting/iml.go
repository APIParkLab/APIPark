package setting

import (
	"context"

	"github.com/eolinker/go-common/utils"

	"github.com/APIParkLab/APIPark/stores/setting"
)

var (
	_ ISettingService = (*imlSettingService)(nil)
)

const (
	KeyInvokeAddress = "system.node.invoke_address"
	KeySitePrefix    = "system.setting.site_prefix"
)

type imlSettingService struct {
	store setting.ISettingStore `autowired:""`
}

func (i *imlSettingService) All(ctx context.Context) (map[string]string, error) {
	list, err := i.store.All(ctx)
	if err != nil {
		return nil, err
	}
	return utils.SliceToMapO(list, func(v *setting.Setting) (string, string) {
		return v.Name, v.Value
	}), nil
}

func (i *imlSettingService) Get(ctx context.Context, name string) (string, bool) {
	ev, err := i.store.Get(ctx, name)
	if err != nil {
		return "", false
	}
	return ev.Value, true
}

func (i *imlSettingService) Set(ctx context.Context, name string, value string, operator string) error {

	return i.store.Set(ctx, name, value, operator)
}
