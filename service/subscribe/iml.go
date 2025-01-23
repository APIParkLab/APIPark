package subscribe

import (
	"context"
	"time"

	"github.com/eolinker/go-common/utils"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/APIParkLab/APIPark/stores/subscribe"
)

const (
	// ApplyStatusRefuse 拒绝
	ApplyStatusRefuse = iota
	// ApplyStatusReview 审核中
	ApplyStatusReview
	// ApplyStatusSubscribe 已订阅
	ApplyStatusSubscribe
	// ApplyStatusUnsubscribe 已退订
	ApplyStatusUnsubscribe
	// ApplyStatusCancel 取消申请
	ApplyStatusCancel
)

const (
	// FromUser 用户添加
	FromUser = iota
	// FromSubscribe 订阅
	FromSubscribe
)

var (
	_ ISubscribeService = (*imlSubscribeService)(nil)
)

type imlSubscribeService struct {
	store subscribe.ISubscribeStore `autowired:""`
	universally.IServiceGet[Subscribe]
	universally.IServiceDelete
	universally.IServiceCreate[CreateSubscribe]
	universally.IServiceEdit[UpdateSubscribe]
}

func (i *imlSubscribeService) GetByServiceAndApplication(ctx context.Context, serviceId string, applicationId string) (*Subscribe, error) {
	info, err := i.store.First(ctx, map[string]interface{}{"service": serviceId, "application": applicationId})
	if err != nil {
		return nil, err
	}
	return FromEntity(info), nil
}

func (i *imlSubscribeService) CountMapByService(ctx context.Context, status int, service ...string) (map[string]int64, error) {
	w := make(map[string]interface{})
	if len(service) > 0 {
		w["service"] = service
	}

	w["apply_status"] = status
	return i.store.CountByGroup(ctx, "", w, "service")
}

func (i *imlSubscribeService) ListByServices(ctx context.Context, serviceIds ...string) ([]*Subscribe, error) {
	w := make(map[string]interface{})
	if len(serviceIds) > 0 {
		w["service"] = serviceIds
	}
	list, err := i.store.List(ctx, w, "create_at desc")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}

func (i *imlSubscribeService) SubscriptionsByApplication(ctx context.Context, applicationIds ...string) ([]*Subscribe, error) {
	w := make(map[string]interface{})
	if len(applicationIds) > 0 {
		w["application"] = applicationIds
	}

	//w["apply_status"] = ApplyStatusSubscribe
	list, err := i.store.List(ctx, w, "create_at desc")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}

func (i *imlSubscribeService) DeleteByApplication(ctx context.Context, service string, application string) error {
	_, err := i.store.DeleteWhere(ctx, map[string]interface{}{"service": service, "application": application})
	return err
}

func (i *imlSubscribeService) SubscribersByProject(ctx context.Context, serviceIds ...string) ([]*Subscribe, error) {
	w := make(map[string]interface{})
	if len(serviceIds) > 0 {
		w["service"] = serviceIds
	}

	w["apply_status"] = ApplyStatusSubscribe
	list, err := i.store.List(ctx, w, "create_at desc")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}

func (i *imlSubscribeService) Subscribers(ctx context.Context, service string, status int) ([]*Subscribe, error) {
	list, err := i.store.List(ctx, map[string]interface{}{"apply_status": status, "service": service}, "create_at desc")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}

func (i *imlSubscribeService) ListBySubscribeStatus(ctx context.Context, serviceId string, status int) ([]*Subscribe, error) {
	w := make(map[string]interface{})
	if serviceId != "" {
		w["service"] = serviceId
	}
	w["apply_status"] = status
	list, err := i.store.List(ctx, w, "create_at desc")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}

func (i *imlSubscribeService) UpdateSubscribeStatus(ctx context.Context, application string, service string, status int) error {
	info, err := i.store.First(ctx, map[string]interface{}{"service": service, "application": application})
	if err != nil {
		return err
	}
	info.ApplyStatus = status
	info.ApproveAt = time.Now()
	//info.Approver = utils.UserId(ctx)
	return i.store.Save(ctx, info)
}

func (i *imlSubscribeService) MySubscribeServices(ctx context.Context, application string, serviceIDs []string) ([]*Subscribe, error) {
	w := make(map[string]interface{})

	if len(serviceIDs) > 0 {
		w["service"] = serviceIDs
	}
	//if len(partitionIds) > 0 {
	//	w["partition"] = partitionIds
	//}
	w["application"] = application
	list, err := i.store.List(ctx, w, "create_at desc")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}

func (i *imlSubscribeService) ListByApplication(ctx context.Context, service string, application ...string) ([]*Subscribe, error) {
	w := make(map[string]interface{})
	if len(application) > 0 {
		w["application"] = application
	}
	w["service"] = service
	list, err := i.store.List(ctx, w)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}

func (i *imlSubscribeService) OnComplete() {
	i.IServiceGet = universally.NewGet[Subscribe, subscribe.Subscribe](i.store, FromEntity)
	i.IServiceCreate = universally.NewCreator[CreateSubscribe, subscribe.Subscribe](i.store, "subscribe", i.createEntityHandler, i.uniquestHandler, i.labelHandler)
	i.IServiceDelete = universally.NewDelete[subscribe.Subscribe](i.store)
	i.IServiceEdit = universally.NewEdit[UpdateSubscribe, subscribe.Subscribe](i.store, i.updateHandler, i.labelHandler)
}

func (i *imlSubscribeService) idHandler(e *subscribe.Subscribe) int64 {
	return e.Id
}
func (i *imlSubscribeService) labelHandler(e *subscribe.Subscribe) []string {
	return []string{e.Service}
}
func (i *imlSubscribeService) uniquestHandler(t *CreateSubscribe) []map[string]interface{} {
	return []map[string]interface{}{{"uuid": t.Uuid}}
}
func (i *imlSubscribeService) createEntityHandler(t *CreateSubscribe) *subscribe.Subscribe {
	return &subscribe.Subscribe{
		UUID:        t.Uuid,
		Name:        t.Uuid,
		Application: t.Application,
		Service:     t.Service,
		From:        t.From,
		Applier:     t.Applier,
		CreateAt:    time.Now(),
		ApplyStatus: t.ApplyStatus,
	}
}

func (i *imlSubscribeService) updateHandler(e *subscribe.Subscribe, t *UpdateSubscribe) {
	if t.ApplyStatus != nil {
		e.ApplyStatus = *t.ApplyStatus
	}
	if t.From != nil {
		e.From = *t.From
	}
}

var (
	_ ISubscribeApplyService = (*imlSubscribeApplyService)(nil)
)

type imlSubscribeApplyService struct {
	store subscribe.ISubscribeApplyStore `autowired:""`
	universally.IServiceGet[Apply]
	universally.IServiceDelete
	universally.IServiceCreate[CreateApply]
	universally.IServiceEdit[EditApply]
}

func (i *imlSubscribeApplyService) GetApply(ctx context.Context, serviceId string, appId string) (*Apply, error) {
	info, err := i.store.First(ctx, map[string]interface{}{"service": serviceId, "application": appId})
	if err != nil {
		return nil, err
	}
	return FromApplyEntity(info), err
}

func (i *imlSubscribeApplyService) ListByStatus(ctx context.Context, pid string, status ...int) ([]*Apply, error) {
	w := make(map[string]interface{})
	w["service"] = pid
	if len(status) > 0 {
		w["status"] = status
	}
	list, err := i.store.List(ctx, w, "apply_at desc")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromApplyEntity), nil
}

func (i *imlSubscribeApplyService) RevokeById(ctx context.Context, id string) error {
	_, err := i.store.UpdateWhere(ctx, map[string]interface{}{"uuid": id}, map[string]interface{}{"status": -1})
	return err
}

func (i *imlSubscribeApplyService) Revoke(ctx context.Context, service string, application string) error {
	_, err := i.store.UpdateWhere(ctx, map[string]interface{}{"service": service, "application": application}, map[string]interface{}{"status": -1})
	return err
}

func (i *imlSubscribeApplyService) OnComplete() {
	i.IServiceGet = universally.NewGet[Apply, subscribe.Apply](i.store, FromApplyEntity)
	i.IServiceCreate = universally.NewCreator[CreateApply, subscribe.Apply](i.store, "subscribe_apply", i.createEntityHandler, i.uniquestHandler, i.labelHandler)
	i.IServiceDelete = universally.NewDelete[subscribe.Apply](i.store)
	i.IServiceEdit = universally.NewEdit[EditApply, subscribe.Apply](i.store, i.updateHandler, i.labelHandler)
}

func (i *imlSubscribeApplyService) idHandler(e *subscribe.Apply) int64 {
	return e.Id
}

func (i *imlSubscribeApplyService) labelHandler(e *subscribe.Apply) []string {
	return []string{e.Service}
}

func (i *imlSubscribeApplyService) uniquestHandler(t *CreateApply) []map[string]interface{} {
	return []map[string]interface{}{{"uuid": t.Uuid}}
}

func (i *imlSubscribeApplyService) createEntityHandler(t *CreateApply) *subscribe.Apply {
	now := time.Now()
	return &subscribe.Apply{
		Uuid:        t.Uuid,
		Name:        t.Uuid,
		Service:     t.Service,
		Team:        t.Team,
		Application: t.Application,
		ApplyTeam:   t.ApplyTeam,
		Applier:     t.Applier,
		ApplyAt:     now,
		Approver:    "",
		ApproveAt:   now,
		Status:      t.Status,
		Opinion:     "",
		Reason:      t.Reason,
	}
}

func (i *imlSubscribeApplyService) updateHandler(e *subscribe.Apply, t *EditApply) {
	if t.Approver != nil {
		e.Approver = *t.Approver
		e.ApproveAt = time.Now()
	}
	if t.Status != nil {
		e.Status = *t.Status
	}
	if t.Opinion != nil {
		e.Opinion = *t.Opinion
	}
	if t.Applier != nil {
		e.Applier = *t.Applier
		e.ApplyAt = time.Now()
	}

}
