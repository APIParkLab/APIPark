package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
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

var _ IApiModule = (*imlApiModule)(nil)
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
			Id:     item.UUID,
			Name:   item.Name,
			Method: item.Method,
			Path:   item.Path,
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
	
	document, err := i.apiService.LatestDocument(ctx, apiId)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
	}
	if document != nil {
		doc := make(map[string]interface{})
		err = json.Unmarshal([]byte(document.Data.Content), &doc)
		if err != nil {
			return nil, err
		}
		apiDetail.Doc = doc
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
			Method:     item.Method,
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
			Id:     item.UUID,
			Name:   item.Name,
			Method: item.Method,
			Path:   item.Path,
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
		err = i.apiService.SaveDocument(ctx, dto.Id, api_dto.ToServiceDocument(nil))
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
			//Upstream:    proxy.Upstream,
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
			//if dto.Proxy.Upstream != "" {
			//	up = &dto.Proxy.Upstream
			//}
		}
		err = i.apiService.Save(ctx, apiId, &api.EditAPI{
			Name:        dto.Info.Name,
			Description: dto.Info.Description,
			Upstream:    up,
		})
		if err != nil {
			return err
		}
		
		if dto.Doc != nil {
			err = i.apiService.SaveDocument(ctx, apiId, api_dto.ToServiceDocument(*dto.Doc))
			if err != nil {
				return err
			}
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
			//upstreamId = proxy.Data.Upstream
		}
		
		doc, err := i.apiService.LatestDocument(ctx, oldApi.UUID)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
		}
		if doc != nil {
			err = i.apiService.SaveDocument(ctx, dto.Id, doc.Data)
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
			//Upstream: upstreamId,
		})
		
	})
	if err != nil {
		return nil, err
	}
	return i.SimpleDetail(ctx, serviceId, dto.Id)
}

func (i *imlApiModule) ApiDocDetail(ctx context.Context, serviceId string, apiId string) (*api_dto.ApiDocDetail, error) {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}
	
	apiBase, err := i.apiService.Get(ctx, apiId)
	if err != nil {
		return nil, err
	}
	if apiBase.IsDelete {
		return nil, errors.New("api is delete")
	}
	
	detail, err := i.apiService.GetInfo(ctx, apiBase.UUID)
	if err != nil {
		return nil, err
	}
	document, err := i.apiService.LatestDocument(ctx, apiId)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
	}
	var doc map[string]interface{}
	if document != nil {
		doc = make(map[string]interface{})
		err = json.Unmarshal([]byte(document.Data.Content), &doc)
		if err != nil {
			return nil, err
		}
	}
	return &api_dto.ApiDocDetail{
		ApiSimpleDetail: *api_dto.GenApiSimpleDetail(detail),
		Doc:             doc,
	}, nil
}

func (i *imlApiModule) ApiProxyDetail(ctx context.Context, serviceId string, apiId string) (*api_dto.ApiProxyDetail, error) {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}
	apiBase, err := i.apiService.Get(ctx, apiId)
	if err != nil {
		return nil, err
	}
	if apiBase.IsDelete {
		return nil, errors.New("api is delete")
	}
	if apiBase.Service != serviceId {
		return nil, errors.New("api is not in project")
	}
	
	detail, err := i.apiService.GetInfo(ctx, apiId)
	if err != nil {
		return nil, err
	}
	
	apiDetail := &api_dto.ApiProxyDetail{
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
