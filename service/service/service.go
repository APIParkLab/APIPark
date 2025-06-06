package service

import (
	"context"
	"reflect"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
)

type IServiceService interface {
	universally.IServiceGet[Service]
	universally.IServiceDelete
	universally.IServiceCreate[Create]
	universally.IServiceEdit[Edit]
	ServiceCountByTeam(ctx context.Context, teamId ...string) (map[string]int64, error)
	AppCountByTeam(ctx context.Context, teamId ...string) (map[string]int64, error)
	SearchPublicServices(ctx context.Context, keyword string) ([]*Service, error)
	Check(ctx context.Context, id string, rule map[string]bool) (*Service, error)
	ServiceList(ctx context.Context, serviceIds ...string) ([]*Service, error)
	ServiceListByKind(ctx context.Context, kind Kind, serviceIds ...string) ([]*Service, error)
	AppList(ctx context.Context, appIds ...string) ([]*Service, error)
	AppListByTeam(ctx context.Context, teamId ...string) ([]*Service, error)
	ForceDelete(ctx context.Context, id string) error
}

func init() {
	autowire.Auto[IServiceService](func() reflect.Value {
		return reflect.ValueOf(new(imlServiceService))
	})
}
