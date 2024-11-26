package router

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/APIParkLab/APIPark/service/universally/commit"

	"github.com/APIParkLab/APIPark/service/service"
	"github.com/APIParkLab/APIPark/service/upstream"

	"gorm.io/gorm"

	"github.com/APIParkLab/APIPark/service/team"

	"github.com/google/uuid"

	"github.com/eolinker/go-common/auto"
	"github.com/eolinker/go-common/utils"

	"github.com/eolinker/go-common/store"

	"github.com/APIParkLab/APIPark/service/api"

	router_dto "github.com/APIParkLab/APIPark/module/router/dto"
)

var (
	_ IRouterModule       = (*imlRouterModule)(nil)
	_ IExportRouterModule = (*imlRouterModule)(nil)
)
var (
	asServer = map[string]bool{
		"as_server": true,
	}
)

type imlRouterModule struct {
	teamService     team.ITeamService         `autowired:""`
	serviceService  service.IServiceService   `autowired:""`
	apiService      api.IAPIService           `autowired:""`
	upstreamService upstream.IUpstreamService `autowired:""`
	transaction     store.ITransaction        `autowired:""`
}

func (i *imlRouterModule) SimpleAPIs(ctx context.Context, input *router_dto.InputSimpleAPI) ([]*router_dto.SimpleItem, error) {
	list, err := i.apiService.ListForServices(ctx, input.Services...)
	if err != nil {
		return nil, err
	}
	apiInfos, err := i.apiService.ListInfo(ctx, utils.SliceToSlice(list, func(s *api.API) string {
		return s.UUID
	})...)
	if err != nil {
		return nil, err
	}

	return utils.SliceToSlice(apiInfos, func(item *api.Info) *router_dto.SimpleItem {
		return &router_dto.SimpleItem{
			Id:      item.UUID,
			Name:    item.Name,
			Methods: item.Methods,
			Path:    item.Path,
		}
	}), nil
}

func (i *imlRouterModule) ExportAll(ctx context.Context) ([]*router_dto.Export, error) {

	apiList, err := i.apiService.ListInfo(ctx)
	if err != nil {
		return nil, err
	}
	apiIds := utils.SliceToSlice(apiList, func(a *api.Info) string {
		return a.UUID
	})
	proxyCommits, err := i.apiService.ListLatestCommitProxy(ctx, apiIds...)
	if err != nil {
		return nil, err
	}
	proxyCommitMap := utils.SliceToMap(proxyCommits, func(c *commit.Commit[api.Proxy]) string {
		return c.Target
	})

	return utils.SliceToSlice(apiList, func(a *api.Info) *router_dto.Export {
		match := make([]router_dto.Match, 0)
		if a.Match == "" {
			a.Match = "[]"
		}
		json.Unmarshal([]byte(a.Match), &match)
		info := &router_dto.Export{
			Id:          a.UUID,
			Name:        a.Name,
			Description: a.Description,
			Path:        a.Path,
			MatchRules:  match,
			Service:     a.Service,
			Team:        a.Team,
		}
		if v, ok := proxyCommitMap[a.UUID]; ok {
			info.Proxy = router_dto.FromServiceProxy(v.Data)
		}

		return info
	}), nil
}

func (i *imlRouterModule) SimpleList(ctx context.Context, serviceId string) ([]*router_dto.SimpleItem, error) {

	list, err := i.apiService.ListForService(ctx, serviceId)
	apiInfos, err := i.apiService.ListInfo(ctx, utils.SliceToSlice(list, func(s *api.API) string {
		return s.UUID
	})...)
	if err != nil {
		return nil, err
	}

	out := utils.SliceToSlice(apiInfos, func(item *api.Info) *router_dto.SimpleItem {
		return &router_dto.SimpleItem{
			Id:   item.UUID,
			Path: item.Path,
		}
	})
	return out, nil
}

func (i *imlRouterModule) Detail(ctx context.Context, serviceId string, apiId string) (*router_dto.Detail, error) {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}

	detail, err := i.apiService.GetInfo(ctx, apiId)
	if err != nil {
		return nil, err
	}
	protocols := []string{"HTTP", "HTTPS"}
	if len(detail.Protocols) > 0 {
		protocols = detail.Protocols
	}

	apiDetail := &router_dto.Detail{
		SimpleDetail: *router_dto.GenSimpleDetail(detail),
		Protocols:    protocols,
		Disable:      detail.Disable,
	}
	proxy, err := i.apiService.LatestProxy(ctx, apiId)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
	}
	if proxy != nil {
		apiDetail.Proxy = router_dto.FromServiceProxy(proxy.Data)
	}

	return apiDetail, nil
}

func (i *imlRouterModule) SimpleDetail(ctx context.Context, serviceId string, apiId string) (*router_dto.SimpleDetail, error) {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}

	detail, err := i.apiService.GetInfo(ctx, apiId)
	if err != nil {
		return nil, err
	}

	return router_dto.GenSimpleDetail(detail), nil
}

func (i *imlRouterModule) Search(ctx context.Context, keyword string, serviceId string) ([]*router_dto.Item, error) {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}

	list, err := i.apiService.Search(ctx, keyword, map[string]interface{}{
		"service": serviceId,
	})
	if err != nil {
		return nil, err
	}
	if len(list) == 0 {
		return []*router_dto.Item{}, nil
	}
	apiInfos, err := i.apiService.ListInfo(ctx, utils.SliceToSlice(list, func(s *api.API) string {
		return s.UUID
	})...)
	if err != nil {
		return nil, err
	}
	utils.Sort(apiInfos, func(a, b *api.Info) bool {
		return a.UpdateAt.After(b.UpdateAt)
	})
	out := utils.SliceToSlice(apiInfos, func(item *api.Info) *router_dto.Item {
		protocols := []string{"HTTP", "HTTPS"}
		if len(item.Protocols) > 0 {
			protocols = item.Protocols
		}
		return &router_dto.Item{
			Id:          item.UUID,
			Methods:     item.Methods,
			Protocols:   protocols,
			Path:        item.Path,
			Description: item.Description,
			Disable:     item.Disable,
			Creator:     auto.UUID(item.Creator),
			Updater:     auto.UUID(item.Updater),
			CreateTime:  auto.TimeLabel(item.CreateAt),
			UpdateTime:  auto.TimeLabel(item.UpdateAt),
			CanDelete:   true,
		}
	})

	return out, nil
}

func (i *imlRouterModule) SimpleSearch(ctx context.Context, keyword string, serviceId string) ([]*router_dto.SimpleItem, error) {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}

	list, err := i.apiService.Search(ctx, keyword, map[string]interface{}{
		"service": serviceId,
	})
	if err != nil {
		return nil, err
	}
	apiInfos, err := i.apiService.ListInfo(ctx, utils.SliceToSlice(list, func(s *api.API) string {
		return s.UUID
	})...)
	if err != nil {
		return nil, err
	}
	out := utils.SliceToSlice(apiInfos, func(item *api.Info) *router_dto.SimpleItem {
		return &router_dto.SimpleItem{
			Id:      item.UUID,
			Methods: item.Methods,
			Path:    item.Path,
		}
	})
	return out, nil
}

func (i *imlRouterModule) Create(ctx context.Context, serviceId string, dto *router_dto.Create) (*router_dto.SimpleDetail, error) {
	info, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}

	err = i.transaction.Transaction(ctx, func(ctx context.Context) error {
		if dto.Id == "" {
			dto.Id = uuid.New().String()
		}
		err = dto.Validate()
		if err != nil {
			return err
		}

		err = i.apiService.Exist(ctx, "", &api.Exist{Path: dto.Path, Methods: dto.Methods})
		if err != nil {
			return err
		}

		proxy := router_dto.ToServiceProxy(dto.Proxy)
		err = i.apiService.SaveProxy(ctx, dto.Id, proxy)
		if err != nil {
			return err
		}
		name := dto.Name
		if name == "" {
			name = dto.Id
		}
		match, _ := json.Marshal(dto.MatchRules)
		return i.apiService.Create(ctx, &api.Create{
			UUID:        dto.Id,
			Name:        name,
			Description: dto.Description,
			Service:     serviceId,
			Team:        info.Team,
			Methods:     dto.Methods,
			Protocols:   dto.Protocols,
			Path:        dto.Path,
			Match:       string(match),
			Upstream:    dto.Upstream,
		})
	})
	if err != nil {
		return nil, err
	}
	return i.SimpleDetail(ctx, serviceId, dto.Id)
}

func (i *imlRouterModule) Edit(ctx context.Context, serviceId string, apiId string, dto *router_dto.Edit) (*router_dto.SimpleDetail, error) {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}

	err = i.transaction.Transaction(ctx, func(ctx context.Context) error {
		if dto.Path != nil {
			err = i.apiService.Exist(ctx, apiId, &api.Exist{Path: *dto.Path, Methods: *dto.Methods})
			if err != nil {
				return err
			}
		}
		if dto.Proxy != nil {
			err = i.apiService.SaveProxy(ctx, apiId, router_dto.ToServiceProxy(dto.Proxy))
			if err != nil {
				return err
			}
		}
		var match *string
		if dto.MatchRules != nil {
			ml, _ := json.Marshal(dto.MatchRules)
			m := string(ml)
			match = &m
		}
		err = i.apiService.Save(ctx, apiId, &api.Edit{
			Description: dto.Description,
			Methods:     dto.Methods,
			Protocols:   dto.Protocols,
			Disable:     dto.Disable,
			Path:        dto.Path,
			Upstream:    dto.Upstream,
			Match:       match,
		})
		if err != nil {
			return err
		}

		return nil

	})
	if err != nil {
		return nil, err
	}
	return i.SimpleDetail(ctx, serviceId, apiId)
}

func (i *imlRouterModule) Delete(ctx context.Context, serviceId string, apiId string) error {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return err
	}
	return i.apiService.Delete(ctx, apiId)
}

func (i *imlRouterModule) Prefix(ctx context.Context, serviceId string) (string, error) {
	pInfo, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return "", err
	}

	if pInfo.Prefix != "" {
		if pInfo.Prefix[0] != '/' {
			pInfo.Prefix = fmt.Sprintf("/%s", strings.TrimSuffix(pInfo.Prefix, "/"))
		}
	}
	return strings.TrimSuffix(pInfo.Prefix, "/"), nil
}
