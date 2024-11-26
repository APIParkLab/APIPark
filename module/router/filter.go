package router

import (
	"context"

	router_dto "github.com/APIParkLab/APIPark/module/router/dto"
	"github.com/eolinker/go-common/utils"

	"github.com/eolinker/eosc/log"

	"github.com/APIParkLab/APIPark/service/api"
	strategy_filter "github.com/APIParkLab/APIPark/strategy-filter"
)

var _ strategy_filter.IRemoteFilter = (*imlRouterFilter)(nil)

type imlRouterFilter struct {
	service api.IAPIService `autowired:""`
}

func (i *imlRouterFilter) Name() string {
	return "api"
}

func (i *imlRouterFilter) Title() string {
	return "API"
}

func (i *imlRouterFilter) Labels(values ...string) []string {
	list, err := i.service.ListInfo(context.Background(), values...)
	if err != nil {
		log.Errorf("get api labels error: %v", err)
		return nil
	}

	return utils.SliceToSlice(list, func(a *api.Info) string {
		return a.Name
	})
}

func (i *imlRouterFilter) Type() string {
	return strategy_filter.TypeRemote
}

func (i *imlRouterFilter) Scopes() []string {
	return []string{
		//strategy_filter.ScopeGlobal,
		strategy_filter.ScopeService,
	}
}

func (i *imlRouterFilter) Option() *strategy_filter.Option {
	return &strategy_filter.Option{
		Name:  i.Name(),
		Title: i.Title(),
		Type:  i.Type(),
	}
}

func (i *imlRouterFilter) Titles() []strategy_filter.OptionTitle {
	return []strategy_filter.OptionTitle{
		{
			Field: "name",
			Title: "api name",
		},
		{
			Field: "methods",
			Title: "methods",
		},
		{
			Field: "request_path",
			Title: "request path",
		},
	}
}

func (i *imlRouterFilter) Key() string {
	return "id"
}

func (i *imlRouterFilter) Target() string {
	return "list"
}

func (i *imlRouterFilter) RemoteList(ctx context.Context, keyword string, condition map[string]interface{}, page int, pageSize int) ([]any, int64, error) {
	if pageSize == -1 {
		// 获取全部
		list, err := i.service.Search(ctx, keyword, condition)
		if err != nil {
			return nil, 0, err
		}

		return utils.SliceToSlice(list, func(s *api.API) any {
			return &router_dto.SimpleItem{
				Id:      s.UUID,
				Path:    s.Path,
				Methods: s.Method,
			}
		}), int64(len(list)), nil
	}
	list, total, err := i.service.SearchByPage(ctx, keyword, condition, page, pageSize, "update_at")
	if err != nil {
		return nil, 0, err
	}
	return utils.SliceToSlice(list, func(s *api.API) any {
		return &router_dto.SimpleItem{
			Id:      s.UUID,
			Path:    s.Path,
			Methods: s.Method,
		}
	}), total, nil
}
