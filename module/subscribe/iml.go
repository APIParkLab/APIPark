package subscribe

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"github.com/eolinker/eosc/log"

	"github.com/APIParkLab/APIPark/gateway"

	"github.com/APIParkLab/APIPark/service/cluster"

	"github.com/eolinker/go-common/utils"

	"github.com/APIParkLab/APIPark/service/service"

	"github.com/eolinker/go-common/store"

	"github.com/eolinker/go-common/auto"

	"github.com/APIParkLab/APIPark/service/subscribe"

	subscribe_dto "github.com/APIParkLab/APIPark/module/subscribe/dto"
)

var (
	_ ISubscribeModule = (*imlSubscribeModule)(nil)
)

type imlSubscribeModule struct {
	serviceService        service.IServiceService          `autowired:""`
	subscribeService      subscribe.ISubscribeService      `autowired:""`
	subscribeApplyService subscribe.ISubscribeApplyService `autowired:""`
	clusterService        cluster.IClusterService          `autowired:""`
	transaction           store.ITransaction               `autowired:""`
}

func (i *imlSubscribeModule) getSubscribers(ctx context.Context, serviceIds []string) ([]*gateway.SubscribeRelease, error) {
	subscribers, err := i.subscribeService.SubscribersByProject(ctx, serviceIds...)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(subscribers, func(s *subscribe.Subscribe) *gateway.SubscribeRelease {
		return &gateway.SubscribeRelease{
			Service:     s.Service,
			Application: s.Application,
			Expired:     "0",
		}
	}), nil
}

func (i *imlSubscribeModule) initGateway(ctx context.Context, clientDriver gateway.IClientDriver) error {

	projects, err := i.serviceService.List(ctx)
	if err != nil {
		return err
	}
	serviceIds := utils.SliceToSlice(projects, func(p *service.Service) string {
		return p.Id
	})
	releases, err := i.getSubscribers(ctx, serviceIds)
	if err != nil {
		return err
	}

	return clientDriver.Subscribe().Online(ctx, releases...)
}

func (i *imlSubscribeModule) SearchSubscriptions(ctx context.Context, appId string, keyword string) ([]*subscribe_dto.SubscriptionItem, error) {
	info, err := i.serviceService.Get(ctx, appId)
	if err != nil {
		return nil, fmt.Errorf("get application error: %w", err)
	}
	if !info.AsApp {
		return nil, fmt.Errorf("service %s is not an application", appId)
	}

	// 获取当前订阅服务列表
	subscriptions, err := i.subscribeService.MySubscribeServices(ctx, appId, nil)
	if err != nil {
		return nil, err
	}
	serviceIds := utils.SliceToSlice(subscriptions, func(s *subscribe.Subscribe) string {
		return s.Service
	})
	services, err := i.serviceService.List(ctx, serviceIds...)
	if err != nil {
		return nil, fmt.Errorf("search service error: %w", err)
	}
	serviceMap := utils.SliceToMapArray(services, func(s *service.Service) string {
		return s.Id
	})

	return utils.SliceToSlice(subscriptions, func(s *subscribe.Subscribe) *subscribe_dto.SubscriptionItem {
		return &subscribe_dto.SubscriptionItem{
			Id:          s.Id,
			ApplyStatus: s.ApplyStatus,
			Service:     auto.UUID(s.Service),
			Team:        auto.UUID(info.Team),
			From:        s.From,
			CreateTime:  auto.TimeLabel(s.CreateAt),
		}
	}, func(s *subscribe.Subscribe) bool {
		_, ok := serviceMap[s.Service]
		if !ok {
			return false
		}
		if s.ApplyStatus != subscribe.ApplyStatusSubscribe && s.ApplyStatus != subscribe.ApplyStatusReview {
			return false
		}
		return true
	}), nil
}

func (i *imlSubscribeModule) RevokeSubscription(ctx context.Context, pid string, uuid string) error {
	_, err := i.serviceService.Get(ctx, pid)
	if err != nil {
		return fmt.Errorf("get service error: %w", err)
	}
	subscription, err := i.subscribeService.Get(ctx, uuid)
	if err != nil {
		return err
	}
	if subscription.ApplyStatus != subscribe.ApplyStatusSubscribe {
		return fmt.Errorf("subscription can not be revoked")
	}

	clusters, err := i.clusterService.List(ctx)
	if err != nil {
		return err
	}
	applyStatus := subscribe.ApplyStatusUnsubscribe
	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		err = i.subscribeService.Save(ctx, uuid, &subscribe.UpdateSubscribe{
			ApplyStatus: &applyStatus,
		})
		if err != nil {
			return err
		}
		for _, c := range clusters {
			err = i.offlineForCluster(ctx, c.Uuid, &gateway.SubscribeRelease{
				Service:     subscription.Service,
				Application: subscription.Application,
			})
			if err != nil {
				return err
			}
		}

		return nil
	})

}

func (i *imlSubscribeModule) DeleteSubscription(ctx context.Context, pid string, uuid string) error {
	_, err := i.serviceService.Get(ctx, pid)
	if err != nil {
		return fmt.Errorf("get service error: %w", err)
	}
	subscription, err := i.subscribeService.Get(ctx, uuid)
	if err != nil {
		return err
	}
	if subscription.ApplyStatus == subscribe.ApplyStatusSubscribe || subscription.ApplyStatus == subscribe.ApplyStatusReview {
		return fmt.Errorf("subscription can not be deleted")
	}
	return i.subscribeService.Delete(ctx, uuid)
}

func (i *imlSubscribeModule) RevokeApply(ctx context.Context, app string, uuid string) error {
	_, err := i.serviceService.Get(ctx, app)
	if err != nil {
		return fmt.Errorf("get app error: %w", err)
	}
	subscription, err := i.subscribeService.Get(ctx, uuid)
	if err != nil {
		return err
	}
	if subscription.ApplyStatus != subscribe.ApplyStatusReview {
		return fmt.Errorf("apply can not be revoked")
	}
	applyStatus := subscribe.ApplyStatusCancel
	return i.subscribeService.Save(ctx, uuid, &subscribe.UpdateSubscribe{
		ApplyStatus: &applyStatus,
	})
}

func (i *imlSubscribeModule) AddSubscriber(ctx context.Context, serviceId string, input *subscribe_dto.AddSubscriber) error {
	_, err := i.serviceService.Get(ctx, serviceId)
	if err != nil {
		return err
	}
	_, err = i.subscribeService.GetByServiceAndApplication(ctx, serviceId, input.Application)
	if err == nil {
		// 订阅方已存在
		return fmt.Errorf("subscriber is already exists")
	}

	sub := &gateway.SubscribeRelease{
		Service:     serviceId,
		Application: input.Application,
		Expired:     "0",
	}
	clusters, err := i.clusterService.List(ctx)
	if err != nil {
		return err
	}

	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		err = i.subscribeService.Create(ctx, &subscribe.CreateSubscribe{
			Uuid:        uuid.New().String(),
			Service:     serviceId,
			Application: input.Application,
			ApplyStatus: subscribe.ApplyStatusSubscribe,
			From:        subscribe.FromUser,
		})
		if err != nil {
			return err
		}
		for _, c := range clusters {
			err = i.onlineSubscriber(ctx, c.Uuid, sub)
			if err != nil {
				return fmt.Errorf("add subscriber for cluster[%s] %v", c.Uuid, err)
			}
		}

		return nil
	})

}

func (i *imlSubscribeModule) onlineSubscriber(ctx context.Context, clusterId string, subscriber *gateway.SubscribeRelease) error {

	client, err := i.clusterService.GatewayClient(ctx, clusterId)
	if err != nil {
		return err
	}
	defer func() {
		_ = client.Close(ctx)
	}()
	return client.Subscribe().Online(ctx, subscriber)

}

func (i *imlSubscribeModule) DeleteSubscriber(ctx context.Context, service string, serviceId string, applicationId string) error {
	_, err := i.serviceService.Get(ctx, service)
	if err != nil {
		return err
	}
	clusters, err := i.clusterService.List(ctx)
	if err != nil {
		return err
	}

	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		list, err := i.subscribeService.ListByApplication(ctx, serviceId, applicationId)
		if err != nil {
			return err
		}
		releaseInfo := &gateway.SubscribeRelease{
			Service:     serviceId,
			Application: applicationId,
		}
		for _, s := range list {
			err = i.subscribeService.Delete(ctx, s.Id)
			if err != nil {
				return err
			}
		}
		for _, c := range clusters {
			err = i.offlineForCluster(ctx, c.Uuid, releaseInfo)
			if err != nil {
				return fmt.Errorf("offline subscribe for cluster[%s] %s", c.Uuid, err)
			}
		}
		return nil
	})
}
func (i *imlSubscribeModule) offlineForCluster(ctx context.Context, clusterId string, config *gateway.SubscribeRelease) error {

	client, err := i.clusterService.GatewayClient(ctx, clusterId)
	if err != nil {
		return err
	}
	defer func() {
		_ = client.Close(ctx)
	}()
	return client.Subscribe().Offline(ctx, config)
}

func (i *imlSubscribeModule) SearchSubscribers(ctx context.Context, serviceId string, keyword string) ([]*subscribe_dto.Subscriber, error) {
	pInfo, err := i.serviceService.Get(ctx, serviceId)
	if err != nil {
		return nil, err
	}

	// 获取当前项目所有订阅方
	list, err := i.subscribeService.ListBySubscribeStatus(ctx, serviceId, subscribe.ApplyStatusSubscribe)
	if err != nil {
		return nil, err
	}

	if keyword == "" {
		items := make([]*subscribe_dto.Subscriber, 0, len(list))
		for _, subscriber := range list {
			items = append(items, &subscribe_dto.Subscriber{
				Id:         subscriber.Application,
				Service:    auto.UUID(subscriber.Service),
				Subscriber: auto.UUID(subscriber.Application),
				Team:       auto.UUID(pInfo.Team),
				Applier:    auto.UUID(subscriber.Applier),
				ApplyTime:  auto.TimeLabel(subscriber.CreateAt),
				From:       subscriber.From,
			})
		}
		return items, nil
	}
	serviceList, err := i.serviceService.Search(ctx, keyword, map[string]interface{}{
		"service": serviceId,
	})
	if err != nil {
		return nil, err
	}
	serviceMap := utils.SliceToMap(serviceList, func(s *service.Service) string {
		return s.Id
	})
	items := make([]*subscribe_dto.Subscriber, 0, len(list))
	for _, subscriber := range list {

		if _, ok := serviceMap[subscriber.Service]; ok {
			items = append(items, &subscribe_dto.Subscriber{
				Id:         subscriber.Id,
				Service:    auto.UUID(subscriber.Service),
				Subscriber: auto.UUID(subscriber.Application),
				Team:       auto.UUID(pInfo.Team),
				ApplyTime:  auto.TimeLabel(subscriber.CreateAt),
				From:       subscriber.From,
			})
		}
	}
	return items, nil
}

var _ ISubscribeApprovalModule = (*imlSubscribeApprovalModule)(nil)

type imlSubscribeApprovalModule struct {
	subscribeService      subscribe.ISubscribeService      `autowired:""`
	subscribeApplyService subscribe.ISubscribeApplyService `autowired:""`
	projectService        service.IServiceService          `autowired:""`
	clusterService        cluster.IClusterService          `autowired:""`
	transaction           store.ITransaction               `autowired:""`
}

func (i *imlSubscribeApprovalModule) Pass(ctx context.Context, pid string, id string, approveInfo *subscribe_dto.Approve) error {
	applyInfo, err := i.subscribeApplyService.Get(ctx, id)
	if err != nil {
		return err
	}

	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		userID := utils.UserId(ctx)
		status := subscribe.ApplyStatusSubscribe
		err = i.subscribeApplyService.Save(ctx, id, &subscribe.EditApply{
			Opinion:  &approveInfo.Opinion,
			Status:   &status,
			Approver: &userID,
		})
		if err != nil {
			return err
		}
		err = i.subscribeService.UpdateSubscribeStatus(ctx, applyInfo.Application, applyInfo.Service, status)
		if err != nil {
			return err
		}
		cs, err := i.clusterService.List(ctx)
		if err != nil {
			return err
		}
		for _, c := range cs {

			err := i.onlineSubscriber(ctx, c.Uuid, &gateway.SubscribeRelease{
				Service:     applyInfo.Service,
				Application: applyInfo.Application,
				Expired:     "0",
			})

			if err != nil {
				log.Warnf("online subscriber for cluster[%s] %v", c.Uuid, err)

			}
		}
		return nil
	})
}
func (i *imlSubscribeApprovalModule) onlineSubscriber(ctx context.Context, clusterId string, sub *gateway.SubscribeRelease) error {
	client, err := i.clusterService.GatewayClient(ctx, clusterId)
	if err != nil {
		return err
	}
	defer func() {
		_ = client.Close(ctx)
	}()
	return client.Subscribe().Online(ctx, sub)
}
func (i *imlSubscribeApprovalModule) Reject(ctx context.Context, pid string, id string, approveInfo *subscribe_dto.Approve) error {
	_, err := i.subscribeApplyService.Get(ctx, id)
	if err != nil {
		return err
	}

	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		userID := utils.UserId(ctx)
		status := subscribe.ApplyStatusRefuse
		err = i.subscribeApplyService.Save(ctx, id, &subscribe.EditApply{
			Opinion:  &approveInfo.Opinion,
			Status:   &status,
			Approver: &userID,
		})
		if err != nil {
			return err
		}
		return nil
		//return i.subscribeService.UpdateSubscribeStatus(ctx, applyInfo.Application, applyInfo.Service, status)
	})
}

func (i *imlSubscribeApprovalModule) GetApprovalList(ctx context.Context, pid string, status int) ([]*subscribe_dto.ApprovalItem, error) {
	applyStatus := make([]int, 0, 2)
	if status == 0 {
		// 获取待审批列表
		applyStatus = append(applyStatus, subscribe.ApplyStatusReview)
	} else {
		// 获取已审批列表
		applyStatus = append(applyStatus, subscribe.ApplyStatusRefuse, subscribe.ApplyStatusSubscribe)
	}
	items, err := i.subscribeApplyService.ListByStatus(ctx, pid, applyStatus...)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(items, func(s *subscribe.Apply) *subscribe_dto.ApprovalItem {
		return &subscribe_dto.ApprovalItem{
			Id:           s.Id,
			Service:      auto.UUID(s.Service),
			Team:         auto.UUID(s.Team),
			Application:  auto.UUID(s.Application),
			ApplyTeam:    auto.UUID(s.ApplyTeam),
			ApplyTime:    auto.TimeLabel(s.ApplyAt),
			Applier:      auto.UUID(s.Applier),
			Approver:     auto.UUID(s.Approver),
			ApprovalTime: auto.TimeLabel(s.ApproveAt),
			Status:       s.Status,
		}
	}), nil
}

func (i *imlSubscribeApprovalModule) GetApprovalDetail(ctx context.Context, pid string, id string) (*subscribe_dto.Approval, error) {
	_, err := i.projectService.Get(ctx, pid)
	if err != nil {
		return nil, err
	}
	item, err := i.subscribeApplyService.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	return &subscribe_dto.Approval{
		Id:           item.Id,
		Service:      auto.UUID(item.Service),
		Team:         auto.UUID(item.Team),
		Application:  auto.UUID(item.Application),
		ApplyTeam:    auto.UUID(item.ApplyTeam),
		ApplyTime:    auto.TimeLabel(item.ApplyAt),
		Applier:      auto.UUID(item.Applier),
		Approver:     auto.UUID(item.Approver),
		ApprovalTime: auto.TimeLabel(item.ApproveAt),
		Reason:       item.Reason,
		Opinion:      item.Opinion,
		Status:       item.Status,
	}, nil
}
