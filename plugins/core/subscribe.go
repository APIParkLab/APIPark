package core

import (
	"net/http"

	"github.com/APIParkLab/APIPark/resources/access"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) subscribeApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/subscribers", []string{"context", "query:service", "query:keyword"}, []string{"subscribers"}, p.subscribeController.Search, access.SystemWorkspaceServiceViewAll, access.TeamServiceSubscriptionView),

		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/service/subscriber", []string{"context", "query:service", "body"}, nil, p.subscribeController.AddSubscriber, access.SystemWorkspaceServiceManagerAll, access.TeamServiceSubscriptionManager),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/service/subscriber", []string{"context", "query:service", "query:service", "query:application"}, nil, p.subscribeController.DeleteSubscriber, access.SystemWorkspaceServiceManagerAll, access.TeamServiceSubscriptionManager),

		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/application/subscriptions", []string{"context", "query:application", "query:keyword"}, []string{"subscriptions"}, p.subscribeController.SearchSubscriptions, access.SystemWorkspaceApplicationViewAll, access.TeamConsumerSubscriptionViewSubscribed),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/application/subscription/cancel", []string{"context", "query:application", "query:subscription"}, nil, p.subscribeController.RevokeSubscription, access.SystemWorkspaceApplicationManagerAll, access.TeamConsumerSubscriptionSubscribe, access.TeamConsumerSubscriptionManagerSubscribed),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/application/subscription/cancel_apply", []string{"context", "query:application", "query:subscription"}, nil, p.subscribeController.RevokeApply, access.SystemWorkspaceApplicationManagerAll, access.TeamConsumerSubscriptionSubscribe, access.TeamConsumerSubscriptionManagerSubscribed),

		// 审核相关
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/approval/subscribes", []string{"context", "query:service", "query:status"}, []string{"approvals"}, p.subscribeApprovalController.GetApprovalList, access.SystemWorkspaceServiceViewAll, access.TeamServiceSubscriptionView),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/approval/subscribe", []string{"context", "query:service", "query:apply"}, []string{"approval"}, p.subscribeApprovalController.GetApprovalDetail, access.SystemWorkspaceServiceViewAll, access.TeamServiceSubscriptionView),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/service/approval/subscribe", []string{"context", "query:service", "query:apply", "body"}, nil, p.subscribeApprovalController.Approval),
	}
}
