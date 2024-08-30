package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/APIParkLab/APIPark/service/universally/commit"
	"strings"

	"github.com/APIParkLab/APIPark/service/service"
	"github.com/APIParkLab/APIPark/service/upstream"

	"gorm.io/gorm"

	"github.com/APIParkLab/APIPark/service/team"

	"github.com/google/uuid"

	"github.com/eolinker/go-common/auto"
	"github.com/eolinker/go-common/utils"

	"github.com/eolinker/go-common/store"

	"github.com/APIParkLab/APIPark/service/api"

	api_dto "github.com/APIParkLab/APIPark/module/api/dto"
)

var (
	_ IApiModule       = (*imlApiModule)(nil)
	_ IExportApiModule = (*imlApiModule)(nil)
)
var (
	asServer = map[string]bool{
		"as_server": true,
	}
)

type imlApiModule struct {
	teamService     team.ITeamService         `autowired:""`
	serviceService  service.IServiceService   `autowired:""`
	apiService      api.IAPIService           `autowired:""`
	upstreamService upstream.IUpstreamService `autowired:""`
	transaction     store.ITransaction        `autowired:""`
}

func (i *imlApiModule) ExportAll(ctx context.Context) ([]*api_dto.ExportAPI, error) {

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

	return utils.SliceToSlice(apiList, func(a *api.Info) *api_dto.ExportAPI {
		match := make([]api_dto.Match, 0)
		if a.Match == "" {
			a.Match = "[]"
		}
		json.Unmarshal([]byte(a.Match), &match)
		info := &api_dto.ExportAPI{
			Id:          a.UUID,
			Name:        a.Name,
			Description: a.Description,
			Path:        a.Path,
			MatchRules:  match,
			Service:     a.Service,
			Team:        a.Team,
		}
		if v, ok := proxyCommitMap[a.UUID]; ok {
			info.Proxy = api_dto.FromServiceProxy(v.Data)
		}

		return info
	}), nil
}

func (i *imlApiModule) SimpleList(ctx context.Context, serviceId string) ([]*api_dto.ApiSimpleItem, error) {

	list, err := i.apiService.ListForService(ctx, serviceId)
	apiInfos, err := i.apiService.ListInfo(ctx, utils.SliceToSlice(list, func(s *api.API) string {
		return s.UUID
	})...)
	if err != nil {
		return nil, err
	}

	out := utils.SliceToSlice(apiInfos, func(item *api.Info) *api_dto.ApiSimpleItem {
		return &api_dto.ApiSimpleItem{
			Id:   item.UUID,
			Name: item.Name,
			Path: item.Path,
		}
	})
	return out, nil
}

func (i *imlApiModule) Detail(ctx context.Context, serviceId string, apiId string) (*api_dto.ApiDetail, error) {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}

	detail, err := i.apiService.GetInfo(ctx, apiId)
	if err != nil {
		return nil, err
	}

	apiDetail := &api_dto.ApiDetail{
		ApiSimpleDetail: *api_dto.GenApiSimpleDetail(detail),
	}
	proxy, err := i.apiService.LatestProxy(ctx, apiId)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
	}
	if proxy != nil {
		apiDetail.Proxy = api_dto.FromServiceProxy(proxy.Data)
	}

	return apiDetail, nil
}

func (i *imlApiModule) SimpleDetail(ctx context.Context, serviceId string, apiId string) (*api_dto.ApiSimpleDetail, error) {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}

	detail, err := i.apiService.GetInfo(ctx, apiId)
	if err != nil {
		return nil, err
	}

	return api_dto.GenApiSimpleDetail(detail), nil
}

func (i *imlApiModule) Search(ctx context.Context, keyword string, serviceId string) ([]*api_dto.ApiItem, error) {
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
	utils.Sort(apiInfos, func(a, b *api.Info) bool {
		return a.UpdateAt.After(b.UpdateAt)
	})
	out := utils.SliceToSlice(apiInfos, func(item *api.Info) *api_dto.ApiItem {
		return &api_dto.ApiItem{
			Id:         item.UUID,
			Name:       item.Name,
			Methods:    item.Methods,
			Protocols:  item.Protocols,
			Path:       item.Path,
			Creator:    auto.UUID(item.Creator),
			Updater:    auto.UUID(item.Updater),
			CreateTime: auto.TimeLabel(item.CreateAt),
			UpdateTime: auto.TimeLabel(item.UpdateAt),
			CanDelete:  true,
		}
	})

	return out, nil
}

func (i *imlApiModule) SimpleSearch(ctx context.Context, keyword string, serviceId string) ([]*api_dto.ApiSimpleItem, error) {
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
	out := utils.SliceToSlice(apiInfos, func(item *api.Info) *api_dto.ApiSimpleItem {
		return &api_dto.ApiSimpleItem{
			Id:   item.UUID,
			Name: item.Name,
			//Methods: item.Methods,
			Path: item.Path,
		}
	})
	return out, nil
}

func (i *imlApiModule) Create(ctx context.Context, serviceId string, dto *api_dto.CreateApi) (*api_dto.ApiSimpleDetail, error) {
	info, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}
	prefix, err := i.Prefix(ctx, serviceId)
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

		path := fmt.Sprintf("%s%s", prefix, dto.Path)
		err = i.apiService.Exist(ctx, "", &api.ExistAPI{Path: dto.Path, Method: dto.Method})
		if err != nil {
			return fmt.Errorf("api path %s,method: %s already exist", dto.Path, dto.Method)
		}
		proxy := api_dto.ToServiceProxy(dto.Proxy)
		err = i.apiService.SaveProxy(ctx, dto.Id, proxy)
		if err != nil {
			return err
		}

		match, _ := json.Marshal(dto.MatchRules)
		return i.apiService.Create(ctx, &api.CreateAPI{
			UUID:        dto.Id,
			Name:        dto.Name,
			Description: dto.Description,
			Service:     serviceId,
			Team:        info.Team,
			Method:      dto.Method,
			Path:        path,
			Match:       string(match),
		})
	})
	if err != nil {
		return nil, err
	}
	return i.SimpleDetail(ctx, serviceId, dto.Id)
}

func (i *imlApiModule) Edit(ctx context.Context, serviceId string, apiId string, dto *api_dto.EditApi) (*api_dto.ApiSimpleDetail, error) {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}

	err = i.transaction.Transaction(ctx, func(ctx context.Context) error {
		var up *string
		if dto.Proxy != nil {
			err = i.apiService.SaveProxy(ctx, apiId, api_dto.ToServiceProxy(dto.Proxy))
			if err != nil {
				return err
			}
		}
		err = i.apiService.Save(ctx, apiId, &api.EditAPI{
			Name:        dto.Info.Name,
			Description: dto.Info.Description,
			Upstream:    up,
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

func (i *imlApiModule) Delete(ctx context.Context, serviceId string, apiId string) error {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return err
	}
	return i.apiService.Delete(ctx, apiId)
}

func (i *imlApiModule) Copy(ctx context.Context, serviceId string, apiId string, dto *api_dto.CreateApi) (*api_dto.ApiSimpleDetail, error) {
	info, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}
	oldApi, err := i.apiService.Get(ctx, apiId)
	if err != nil {
		return nil, err
	}
	prefix, err := i.Prefix(ctx, serviceId)
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

		path := fmt.Sprintf("%s/%s", strings.TrimSuffix(prefix, "/"), strings.TrimPrefix(dto.Path, "/"))
		err = i.apiService.Exist(ctx, serviceId, &api.ExistAPI{Path: path, Method: dto.Method})
		if err != nil {
			return err
		}

		proxy, err := i.apiService.LatestProxy(ctx, oldApi.UUID)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
		}
		//upstreamId := ""
		if proxy != nil {
			err = i.apiService.SaveProxy(ctx, dto.Id, proxy.Data)
			if err != nil {
				return err
			}
		}

		match, _ := json.Marshal(dto.MatchRules)
		return i.apiService.Create(ctx, &api.CreateAPI{
			UUID:    dto.Id,
			Name:    dto.Name,
			Service: serviceId,
			Team:    info.Team,
			Method:  dto.Method,
			Path:    path,
			Match:   string(match),
		})

	})
	if err != nil {
		return nil, err
	}
	return i.SimpleDetail(ctx, serviceId, dto.Id)
}

func (i *imlApiModule) Prefix(ctx context.Context, serviceId string) (string, error) {
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
