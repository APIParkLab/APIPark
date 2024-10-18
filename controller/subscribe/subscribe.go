package subscribe

import (
	"reflect"
	
	"github.com/gin-gonic/gin"
	
	subscribe_dto "github.com/APIParkLab/APIPark/module/subscribe/dto"
	
	"github.com/eolinker/go-common/autowire"
)

type ISubscribeController interface {
	// AddSubscriber 添加订阅者
	AddSubscriber(ctx *gin.Context, project string, input *subscribe_dto.AddSubscriber) error
	// DeleteSubscriber 删除订阅者
	DeleteSubscriber(ctx *gin.Context, project string, serviceId string, applicationId string) error
	// Search 关键字获取订阅者列表
	Search(ctx *gin.Context, project string, keyword string) ([]*subscribe_dto.Subscriber, error)
	// SearchSubscriptions 关键字获取订阅服务列表
	SearchSubscriptions(ctx *gin.Context, appId string, keyword string) ([]*subscribe_dto.SubscriptionItem, error)
	// RevokeSubscription 取消订阅
	RevokeSubscription(ctx *gin.Context, project string, uuid string) error
	// DeleteSubscription 删除订阅
	DeleteSubscription(ctx *gin.Context, project string, uuid string) error
	// RevokeApply 取消申请
	RevokeApply(ctx *gin.Context, project string, uuid string) error
	//PartitionServices(ctx *gin.Context, app string) ([]*subscribe_dto.PartitionServiceItem, error)
}

type ISubscribeApprovalController interface {
	// GetApprovalList 获取审核列表
	GetApprovalList(ctx *gin.Context, project string, status int) ([]*subscribe_dto.ApprovalItem, error)
	// GetApprovalDetail 获取审核详情
	GetApprovalDetail(ctx *gin.Context, project string, id string) (*subscribe_dto.Approval, error)
	// Approval 审核
	Approval(ctx *gin.Context, project string, id string, approveInfo *subscribe_dto.Approve) error
}

func init() {
	autowire.Auto[ISubscribeController](func() reflect.Value {
		return reflect.ValueOf(new(imlSubscribeController))
	})
	autowire.Auto[ISubscribeApprovalController](func() reflect.Value {
		return reflect.ValueOf(new(imlSubscribeApprovalController))
	})
}
