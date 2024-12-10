package api

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/APIParkLab/APIPark/service/universally/commit"

	"github.com/APIParkLab/APIPark/stores/api"

	"github.com/eolinker/go-common/utils"

	"github.com/eolinker/go-common/auto"

	"github.com/APIParkLab/APIPark/service/universally"
)

var (
	_ IAPIService = (*imlAPIService)(nil)
)

type HistoryType string

const (
	HistoryRequest HistoryType = "request"
	HistoryProxy   HistoryType = "proxy"
	HistoryPlugin  HistoryType = "plugin"
)

type imlAPIService struct {
	store                api.IApiBaseStore                     `autowired:""`
	apiInfoStore         api.IAPIInfoStore                     `autowired:""`
	requestCommitService commit.ICommitWithKeyService[Request] `autowired:""`
	proxyCommitService   commit.ICommitWithKeyService[Proxy]   `autowired:""`
	universally.IServiceGet[API]
	universally.IServiceDelete
}

func (i *imlAPIService) ListForServices(ctx context.Context, serviceIds ...string) ([]*API, error) {
	w := map[string]interface{}{}
	if len(serviceIds) > 0 {
		w["service"] = serviceIds
	}
	list, err := i.store.List(ctx, w)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}

func (i *imlAPIService) ListInfoForServices(ctx context.Context, serviceIds ...string) ([]*Info, error) {
	w := map[string]interface{}{}
	if len(serviceIds) > 0 {
		w["service"] = serviceIds
	}
	list, err := i.apiInfoStore.List(ctx, w)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntityInfo), nil
}

func (i *imlAPIService) ListLatestCommitRequest(ctx context.Context, aid ...string) ([]*commit.Commit[Request], error) {
	return i.requestCommitService.ListLatest(ctx, aid...)
}

func (i *imlAPIService) LatestRequest(ctx context.Context, aid string) (*commit.Commit[Request], error) {
	return i.requestCommitService.Latest(ctx, aid)
}

func (i *imlAPIService) GetRequestCommit(ctx context.Context, commitId string) (*commit.Commit[Request], error) {
	return i.requestCommitService.Get(ctx, commitId)
}

func (i *imlAPIService) ListRequestCommit(ctx context.Context, commitId ...string) ([]*commit.Commit[Request], error) {
	return i.requestCommitService.List(ctx, commitId...)
}

func (i *imlAPIService) SaveRequest(ctx context.Context, aid string, data *Request) error {
	return i.requestCommitService.Save(ctx, aid, data)
}

func (i *imlAPIService) CountMapByService(ctx context.Context, service ...string) (map[string]int64, error) {
	w := map[string]interface{}{}
	if len(service) > 0 {
		w["service"] = service
	}
	return i.store.CountByGroup(ctx, "", w, "service")
}

func (i *imlAPIService) ListInfoForService(ctx context.Context, serviceId string) ([]*Info, error) {
	apis, err := i.store.List(ctx, map[string]interface{}{
		"service": serviceId,
	})
	aids := utils.SliceToSlice(apis, func(a *api.API) int64 {
		return a.Id
	})
	list, err := i.apiInfoStore.List(ctx, map[string]interface{}{
		"service": serviceId,
		"id":      aids,
	})
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntityInfo), nil
}

func (i *imlAPIService) ListInfo(ctx context.Context, aids ...string) ([]*Info, error) {
	w := map[string]interface{}{}
	if len(aids) > 0 {
		w["uuid"] = aids
	}
	list, err := i.apiInfoStore.List(ctx, w)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntityInfo), nil
}

func (i *imlAPIService) GetInfo(ctx context.Context, aid string) (*Info, error) {

	info, err := i.apiInfoStore.GetByUUID(ctx, aid)
	if err != nil {
		return nil, err
	}
	return FromEntityInfo(info), nil
}

func (i *imlAPIService) Save(ctx context.Context, id string, model *Edit) error {
	if model == nil {
		return errors.New("input is nil")
	}
	return i.apiInfoStore.Transaction(ctx, func(ctx context.Context) error {
		ev, err := i.apiInfoStore.GetByUUID(ctx, id)
		if err != nil {
			return err
		}
		if model.Name != nil {
			ev.Name = *model.Name
		}

		if model.Description != nil {
			ev.Description = *model.Description
		}
		if model.Protocols != nil {
			ev.Protocol = *model.Protocols
		}
		if model.Path != nil {
			ev.Path = *model.Path
		}
		if model.Match != nil {
			ev.Match = *model.Match
		}
		if model.Methods != nil {
			ev.Method = *model.Methods
		}
		if model.Disable != nil {
			ev.Disable = *model.Disable
		}
		if model.Upstream != nil {
			ev.Upstream = *model.Upstream
		}

		e := i.apiInfoStore.Save(ctx, ev)
		if e != nil {
			return e
		}
		return i.store.SetLabels(ctx, ev.Id, getLabels(ev)...)

	})
}
func getLabels(input *api.Info, appends ...string) []string {
	labels := make([]string, 0, len(appends)+9)
	labels = append(labels, input.UUID, input.Name, input.Description, input.Path, input.Service, input.Team, input.Updater)
	labels = append(labels, appends...)
	return labels
}
func (i *imlAPIService) Create(ctx context.Context, input *Create) (err error) {
	operater := utils.UserId(ctx)
	return i.store.Transaction(ctx, func(ctx context.Context) error {
		if input.UUID != "" {
			_, err = i.store.GetByUUID(ctx, input.UUID)
			if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}

		} else {
			input.UUID = uuid.NewString()
		}
		if input.Upstream == "" {
			input.Upstream = input.Service
		}

		ne := api.API{
			UUID:     input.UUID,
			Name:     input.Name,
			Service:  input.Service,
			Team:     input.Team,
			Creator:  operater,
			CreateAt: time.Now(),
			Upstream: input.Upstream,
			Method:   input.Methods,
			Path:     input.Path,
		}
		err = i.store.Insert(ctx, &ne)
		if err != nil {
			return err
		}
		ev := &api.Info{
			Id:          ne.Id,
			UUID:        ne.UUID,
			Name:        ne.Name,
			Description: input.Description,
			Updater:     operater,
			UpdateAt:    time.Now(),
			Creator:     operater,
			CreateAt:    time.Now(),
			Method:      input.Methods,
			Path:        input.Path,
			Match:       input.Match,
			Upstream:    input.Upstream,
			Service:     input.Service,
			Team:        input.Team,
		}
		err = i.apiInfoStore.Save(ctx, ev)
		if err != nil {
			return err
		}
		err = i.store.SetLabels(ctx, ne.Id, getLabels(ev)...)
		if err != nil {
			return err
		}
		return nil
	})
}

func (i *imlAPIService) ListProxyCommit(ctx context.Context, commitId ...string) ([]*commit.Commit[Proxy], error) {
	return i.proxyCommitService.List(ctx, commitId...)
}

func (i *imlAPIService) CountByService(ctx context.Context, service string) (int64, error) {
	return i.store.CountWhere(ctx, map[string]interface{}{
		"service": service,
	})
}

func (i *imlAPIService) Exist(ctx context.Context, aid string, a *Exist) error {
	list, err := i.store.Search(ctx, "", map[string]interface{}{
		"path": a.Path,
	})
	if err != nil {
		return err
	}
	existMethodMap := make(map[string]struct{})
	for _, t := range list {
		if len(t.Method) == 0 {
			if t.UUID != aid {
				return fmt.Errorf("method(%v),path(%s) is exist", a.Methods, a.Path)
			}
			continue
		}
		if t.UUID == aid {
			continue
		}

		for _, m := range t.Method {

			existMethodMap[m] = struct{}{}
		}
	}
	for _, m := range a.Methods {
		if _, ok := existMethodMap[m]; ok {

			return fmt.Errorf("method(%s),path(%s) is exist", m, a.Path)
		}
	}
	return nil
}

func (i *imlAPIService) ListForService(ctx context.Context, serviceId string) ([]*API, error) {
	list, err := i.listForService(ctx, serviceId, false)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}
func (i *imlAPIService) listForService(ctx context.Context, serviceId string, isDelete bool) ([]*api.API, error) {
	return i.store.ListQuery(ctx, "service=? and is_delete=?", []interface{}{serviceId, isDelete}, "id")
}
func (i *imlAPIService) ListLatestCommitProxy(ctx context.Context, apiUUID ...string) ([]*commit.Commit[Proxy], error) {

	return i.proxyCommitService.ListLatest(ctx, apiUUID...)

}

func (i *imlAPIService) LatestProxy(ctx context.Context, aid string) (*commit.Commit[Proxy], error) {

	return i.proxyCommitService.Latest(ctx, aid)
}

func (i *imlAPIService) GetProxyCommit(ctx context.Context, commitId string) (*commit.Commit[Proxy], error) {
	return i.proxyCommitService.Get(ctx, commitId)
}

func (i *imlAPIService) SaveProxy(ctx context.Context, aid string, data *Proxy) error {

	return i.proxyCommitService.Save(ctx, aid, data)
}

func (i *imlAPIService) GetLabels(ctx context.Context, ids ...string) map[string]string {
	if len(ids) == 0 {
		return nil
	}
	list, err := i.apiInfoStore.ListQuery(ctx, "`uuid` in (?)", []interface{}{ids}, "id")
	if err != nil {
		return nil
	}
	return utils.SliceToMapO(list, func(i *api.Info) (string, string) {
		return i.UUID, i.Name
	})
}

func (i *imlAPIService) OnComplete() {
	i.IServiceGet = universally.NewGetSoftDelete[API, api.API](i.store, FromEntity)

	i.IServiceDelete = universally.NewSoftDelete[api.API](i.store)

	auto.RegisterService("api", i)
}
