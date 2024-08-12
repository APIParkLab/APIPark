package setting

import (
	"context"
	"github.com/APIParkLab/APIPark/stores/setting"
)

var (
	_ ISettingService = (*imlSettingService)(nil)
)

type imlSettingService struct {
	store setting.ISettingStore `autowired:""`
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
