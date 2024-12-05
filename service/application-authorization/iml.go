package application_authorization

import (
	"context"
	"time"

	"github.com/eolinker/go-common/utils"

	"github.com/eolinker/go-common/auto"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/APIParkLab/APIPark/stores/service"
)

var (
	_ IAuthorizationService = (*imlAuthorizationService)(nil)
)

type imlAuthorizationService struct {
	store service.IAuthorizationStore `autowired:""`
	universally.IServiceGet[Authorization]
	universally.IServiceDelete
	universally.IServiceCreate[Create]
	universally.IServiceEdit[Edit]
}

func (i *imlAuthorizationService) CountByApp(ctx context.Context, appId ...string) (map[string]int64, error) {
	w := map[string]interface{}{}
	if len(appId) > 0 {
		w["application"] = appId
	}
	return i.store.CountByGroup(ctx, "", w, "application")
}

func (i *imlAuthorizationService) ListByApp(ctx context.Context, appId ...string) ([]*Authorization, error) {
	w := map[string]interface{}{}
	if len(appId) > 0 {
		w["application"] = appId
	}
	list, err := i.store.List(ctx, w, "update_at desc")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}

func (i *imlAuthorizationService) GetLabels(ctx context.Context, ids ...string) map[string]string {
	if len(ids) == 0 {
		return nil
	}
	list, err := i.store.ListQuery(ctx, "`uuid` in (?)", []interface{}{ids}, "id")
	if err != nil {
		return nil
	}
	return utils.SliceToMapO(list, func(i *service.Authorization) (string, string) {
		return i.UUID, i.Name
	})
}

func (i *imlAuthorizationService) OnComplete() {
	i.IServiceGet = universally.NewGet[Authorization, service.Authorization](i.store, FromEntity)

	i.IServiceDelete = universally.NewDelete[service.Authorization](i.store)

	i.IServiceCreate = universally.NewCreator[Create, service.Authorization](i.store, "project_authorization", createEntityHandler, uniquestHandler, labelHandler)

	i.IServiceEdit = universally.NewEdit[Edit, service.Authorization](i.store, updateHandler, labelHandler)
	auto.RegisterService("service_authorization", i)
}

func labelHandler(e *service.Authorization) []string {
	return []string{e.Name, e.UUID}
}
func uniquestHandler(i *Create) []map[string]interface{} {
	return []map[string]interface{}{{"uuid": i.UUID}}
}
func createEntityHandler(i *Create) *service.Authorization {
	now := time.Now()
	return &service.Authorization{
		UUID:           i.UUID,
		Name:           i.Name,
		Application:    i.Application,
		Type:           i.Type,
		Position:       i.Position,
		TokenName:      i.TokenName,
		Config:         i.Config,
		ExpireTime:     i.ExpireTime,
		CreateAt:       now,
		UpdateAt:       now,
		HideCredential: i.HideCredential,
	}
}

func updateHandler(e *service.Authorization, i *Edit) {
	if i.Name != nil {
		e.Name = *i.Name
	}
	if i.Position != nil {
		e.Position = *i.Position
	}
	if i.TokenName != nil {
		e.TokenName = *i.TokenName
	}
	if i.Config != nil {
		e.Config = *i.Config
	}
	if i.ExpireTime != nil {
		e.ExpireTime = *i.ExpireTime
	}
	if i.HideCredential != nil {
		e.HideCredential = *i.HideCredential
	}
	e.UpdateAt = time.Now()
}
