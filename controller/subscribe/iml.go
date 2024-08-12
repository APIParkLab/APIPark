package subscribe

import (
	"fmt"
	
	"github.com/gin-gonic/gin"
	
	"github.com/APIParkLab/APIPark/module/subscribe"
	subscribe_dto "github.com/APIParkLab/APIPark/module/subscribe/dto"
)

var (
	_ ISubscribeController = (*imlSubscribeController)(nil)
)

type imlSubscribeController struct {
	module subscribe.ISubscribeModule `autowired:""`
}

//func (i *imlSubscribeController) PartitionServices(ctx *gin.Context, app string) ([]*subscribe_dto.PartitionServiceItem, error) {
//	return i.module.PartitionServices(ctx, app)
//}

func (i *imlSubscribeController) SearchSubscriptions(ctx *gin.Context, appId string, keyword string) ([]*subscribe_dto.SubscriptionItem, error) {
	return i.module.SearchSubscriptions(ctx, appId, keyword)
}

func (i *imlSubscribeController) RevokeSubscription(ctx *gin.Context, service string, uuid string) error {
	return i.module.RevokeSubscription(ctx, service, uuid)
}

func (i *imlSubscribeController) DeleteSubscription(ctx *gin.Context, service string, uuid string) error {
	return i.module.DeleteSubscription(ctx, service, uuid)
}

func (i *imlSubscribeController) AddSubscriber(ctx *gin.Context, service string, input *subscribe_dto.AddSubscriber) error {
	return i.module.AddSubscriber(ctx, service, input)
}

func (i *imlSubscribeController) DeleteSubscriber(ctx *gin.Context, service string, serviceId string, applicationId string) error {
	return i.module.DeleteSubscriber(ctx, service, serviceId, applicationId)
}

func (i *imlSubscribeController) RevokeApply(ctx *gin.Context, service string, uuid string) error {
	return i.module.RevokeApply(ctx, service, uuid)
}

func (i *imlSubscribeController) Search(ctx *gin.Context, service string, keyword string) ([]*subscribe_dto.Subscriber, error) {
	return i.module.SearchSubscribers(ctx, service, keyword)
}

var _ ISubscribeApprovalController = (*imlSubscribeApprovalController)(nil)

type imlSubscribeApprovalController struct {
	module subscribe.ISubscribeApprovalModule `autowired:""`
}

func (i *imlSubscribeApprovalController) GetApprovalList(ctx *gin.Context, service string, status int) ([]*subscribe_dto.ApprovalItem, error) {
	return i.module.GetApprovalList(ctx, service, status)
}

func (i *imlSubscribeApprovalController) GetApprovalDetail(ctx *gin.Context, service string, id string) (*subscribe_dto.Approval, error) {
	return i.module.GetApprovalDetail(ctx, service, id)
}

func (i *imlSubscribeApprovalController) Approval(ctx *gin.Context, service string, id string, approveInfo *subscribe_dto.Approve) error {
	switch approveInfo.Operate {
	case "pass":
		return i.module.Pass(ctx, service, id, approveInfo)
	case "refuse":
		return i.module.Reject(ctx, service, id, approveInfo)
	}
	return fmt.Errorf("unknown operate: %s", approveInfo.Operate)
}
