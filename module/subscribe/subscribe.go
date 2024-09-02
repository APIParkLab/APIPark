package subscribe

import (
	"context"
	"github.com/APIParkLab/APIPark/gateway"
	"github.com/APIParkLab/APIPark/module/system"
	"reflect"

	"github.com/eolinker/go-common/autowire"

	subscribe_dto "github.com/APIParkLab/APIPark/module/subscribe/dto"
)

type ISubscribeModule interface {
	// AddSubscriber 新增订阅方
	AddSubscriber(ctx context.Context, pid string, input *subscribe_dto.AddSubscriber) error
	ExistSubscriber(ctx context.Context, serviceId string, app string) error
	// DeleteSubscriber 删除订阅方
	DeleteSubscriber(ctx context.Context, project string, serviceId string, applicationId string) error
	// SearchSubscribers 关键字获取订阅方列表
	SearchSubscribers(ctx context.Context, pid string, keyword string) ([]*subscribe_dto.Subscriber, error)
	// SearchSubscriptions 关键字获取订阅服务列表
	SearchSubscriptions(ctx context.Context, appId string, keyword string) ([]*subscribe_dto.SubscriptionItem, error)
	// RevokeSubscription 取消订阅
	RevokeSubscription(ctx context.Context, pid string, uuid string) error
	// DeleteSubscription 删除订阅
	DeleteSubscription(ctx context.Context, pid string, uuid string) error
	// RevokeApply 取消申请
	RevokeApply(ctx context.Context, app string, uuid string) error

	//ExportAll(ctx context.Context) ([]*subscribe_dto.ExportSubscriber, error)
}

type IExportSubscribeModule interface {
	system.IExportModule[subscribe_dto.ExportSubscriber]
}

type ISubscribeApprovalModule interface {
	// GetApprovalList 获取审批列表
	GetApprovalList(ctx context.Context, pid string, status int) ([]*subscribe_dto.ApprovalItem, error)
	// GetApprovalDetail 获取审批详情
	GetApprovalDetail(ctx context.Context, pid string, id string) (*subscribe_dto.Approval, error)
	// Pass 通过审批
	Pass(ctx context.Context, pid string, id string, approveInfo *subscribe_dto.Approve) error
	// Reject 驳回审批
	Reject(ctx context.Context, pid string, id string, approveInfo *subscribe_dto.Approve) error

	ExportAll(ctx context.Context) ([]*subscribe_dto.ExportApproval, error)
}

type IExportSubscribeApprovalModule interface {
	system.IExportModule[subscribe_dto.ExportApproval]
}

func init() {
	subscribeModule := new(imlSubscribeModule)
	autowire.Auto[ISubscribeModule](func() reflect.Value {

		gateway.RegisterInitHandleFunc(subscribeModule.initGateway)
		return reflect.ValueOf(subscribeModule)
	})

	autowire.Auto[IExportSubscribeModule](func() reflect.Value {
		return reflect.ValueOf(subscribeModule)
	})

	applyModule := new(imlSubscribeApprovalModule)
	autowire.Auto[ISubscribeApprovalModule](func() reflect.Value {
		return reflect.ValueOf(applyModule)
	})

	autowire.Auto[IExportSubscribeApprovalModule](func() reflect.Value {
		return reflect.ValueOf(applyModule)
	})
}
