package core

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) subscribeApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/subscribers", []string{"context", "query:service", "query:keyword"}, []string{"subscribers"}, p.subscribeController.Search),

		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/service/subscriber", []string{"context", "query:service", "body"}, nil, p.subscribeController.AddSubscriber),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/service/subscriber", []string{"context", "query:service", "query:service", "query:application"}, nil, p.subscribeController.DeleteSubscriber),

		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/application/subscriptions", []string{"context", "query:application", "query:keyword"}, []string{"subscriptions"}, p.subscribeController.SearchSubscriptions),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/application/subscription/cancel", []string{"context", "query:application", "query:subscription"}, nil, p.subscribeController.RevokeSubscription),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/application/subscription/cancel_apply", []string{"context", "query:application", "query:subscription"}, nil, p.subscribeController.RevokeApply),

		// 审批相关
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/approval/subscribes", []string{"context", "query:service", "query:status"}, []string{"approvals"}, p.subscribeApprovalController.GetApprovalList),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/approval/subscribe", []string{"context", "query:service", "query:apply"}, []string{"approval"}, p.subscribeApprovalController.GetApprovalDetail),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/service/approval/subscribe", []string{"context", "query:service", "query:apply", "body"}, nil, p.subscribeApprovalController.Approval),
	}
}
