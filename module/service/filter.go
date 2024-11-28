package service

import (
	"context"

	"github.com/APIParkLab/APIPark/service/subscribe"

	service_dto "github.com/APIParkLab/APIPark/module/service/dto"
	"github.com/eolinker/go-common/auto"

	"github.com/APIParkLab/APIPark/service/service"
	"github.com/eolinker/eosc/log"
	"github.com/eolinker/go-common/utils"

	strategy_filter "github.com/APIParkLab/APIPark/strategy-filter"
)

var _ strategy_filter.IRemoteFilter = (*imlAppFilter)(nil)

type imlAppFilter struct {
	service           service.IServiceService     `autowired:""`
	subscriberService subscribe.ISubscribeService `autowired:""`
}

func (i *imlAppFilter) Name() string {
	return "application"
}

func (i *imlAppFilter) Title() string {
	return "consumer"
}

func (i *imlAppFilter) Labels(values ...string) []string {
	if len(values) == 0 {
		return nil
	}
	if values[0] == strategy_filter.ValuesALL {
		return []string{
			"all consumer",
		}
	}
	apps, err := i.service.AppList(context.Background(), values...)
	if err != nil {
		log.Error(err)
		return nil
	}
	return utils.SliceToSlice(apps, func(a *service.Service) string {
		return a.Name
	})
}

func (i *imlAppFilter) Type() string {
	return strategy_filter.TypeRemote
}

func (i *imlAppFilter) Scopes() []string {
	return []string{
		strategy_filter.ScopeGlobal,
		strategy_filter.ScopeService,
	}
}

func (i *imlAppFilter) Option() *strategy_filter.Option {
	return &strategy_filter.Option{
		Name:  i.Name(),
		Title: i.Title(),
		Type:  i.Type(),
	}
}

func (i *imlAppFilter) Titles() []strategy_filter.OptionTitle {
	return []strategy_filter.OptionTitle{
		{
			Field: "name",
			Title: "consumer",
		},
		{
			Field: "id",
			Title: "consumer id",
		},
		{
			Field: "description",
			Title: "description",
		},
	}
}

func (i *imlAppFilter) Key() string {
	return "id"
}

func (i *imlAppFilter) Target() string {
	return "list"
}

func (i *imlAppFilter) RemoteList(ctx context.Context, keyword string, condition map[string]interface{}, page int, pageSize int) ([]any, int64, error) {
	if condition == nil {
		condition = make(map[string]interface{})
	}
	if serviceId, ok := condition["service"]; ok {
		// 查询订阅了该服务的消费者
		v, ok := serviceId.(string)
		if ok {
			subscribers, err := i.subscriberService.Subscribers(ctx, v, subscribe.ApplyStatusSubscribe)
			if err != nil {
				return nil, 0, err
			}
			if len(subscribers) > 0 {
				appIds := utils.SliceToSlice(subscribers, func(s *subscribe.Subscribe) string {
					return s.Application
				})
				condition["uuid"] = appIds
			}

		}
		delete(condition, "service")
	}
	condition["as_app"] = true
	if pageSize == -1 {
		// 获取全部
		list, err := i.service.Search(ctx, keyword, condition, "update_at")
		if err != nil {
			return nil, 0, err
		}
		return utils.SliceToSlice(list, func(s *service.Service) any {
			return &service_dto.SimpleAppItem{
				Id:          s.Id,
				Name:        s.Name,
				Team:        auto.UUID(s.Team),
				Description: s.Description,
			}
		}), int64(len(list)), nil
	}
	list, total, err := i.service.SearchByPage(ctx, keyword, condition, page, pageSize, "update_at")
	if err != nil {
		return nil, 0, err
	}
	return utils.SliceToSlice(list, func(s *service.Service) any {
		return &service_dto.SimpleAppItem{
			Id:          s.Id,
			Name:        s.Name,
			Team:        auto.UUID(s.Team),
			Description: s.Description,
		}
	}), total, nil
}
