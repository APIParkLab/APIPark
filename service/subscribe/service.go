package subscribe

import (
	"context"
	"reflect"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
)

type ISubscribeService interface {
	universally.IServiceGet[Subscribe]
	universally.IServiceDelete
	universally.IServiceCreate[CreateSubscribe]
	universally.IServiceEdit[UpdateSubscribe]
	CountMapByService(ctx context.Context, status int, service ...string) (map[string]int64, error)
	DeleteByApplication(ctx context.Context, service string, application string) error
	ListByApplication(ctx context.Context, service string, application ...string) ([]*Subscribe, error)
	ListByServices(ctx context.Context, serviceIds ...string) ([]*Subscribe, error)
	GetByServiceAndApplication(ctx context.Context, serviceId string, applicationId string) (*Subscribe, error)

	MySubscribeServices(ctx context.Context, application string, serviceIDs []string) ([]*Subscribe, error)
	UpdateSubscribeStatus(ctx context.Context, application string, service string, status int) error
	ListBySubscribeStatus(ctx context.Context, serviceId string, status int) ([]*Subscribe, error)
	SubscribersByProject(ctx context.Context, serviceIds ...string) ([]*Subscribe, error)
	Subscribers(ctx context.Context, project string, status int) ([]*Subscribe, error)
	SubscriptionsByApplication(ctx context.Context, applicationIds ...string) ([]*Subscribe, error)
}

type ISubscribeApplyService interface {
	universally.IServiceGet[Apply]
	universally.IServiceDelete
	universally.IServiceCreate[CreateApply]
	universally.IServiceEdit[EditApply]
	GetApply(ctx context.Context, serviceId string, appId string) (*Apply, error)
	ListByStatus(ctx context.Context, pid string, status ...int) ([]*Apply, error)
	Revoke(ctx context.Context, service string, application string) error
	RevokeById(ctx context.Context, id string) error
}

func init() {
	autowire.Auto[ISubscribeService](func() reflect.Value {
		return reflect.ValueOf(new(imlSubscribeService))
	})

	autowire.Auto[ISubscribeApplyService](func() reflect.Value {
		return reflect.ValueOf(new(imlSubscribeApplyService))
	})
}
