package subscribe_dto

import "github.com/eolinker/go-common/auto"

type Subscriber struct {
	Id      string     `json:"id"`
	Service auto.Label `json:"service" aolabel:"service"`
	//Cluster []auto.Label `json:"partition" aolabel:"partition"`

	Subscriber auto.Label     `json:"subscriber"  aolabel:"service"`
	Team       auto.Label     `json:"team" aolabel:"team"`
	ApplyTime  auto.TimeLabel `json:"apply_time"`
	Applier    auto.Label     `json:"applier" aolabel:"user"`
	//Approver   auto.Label     `json:"approver" aolabel:"user"`
	From int `json:"from"`
}

type SubscriptionItem struct {
	Id      string     `json:"id"`
	Service auto.Label `json:"service" aolabel:"service"`
	//Cluster   auto.Label `json:"partition" aolabel:"partition"`
	ApplyStatus int        `json:"apply_status"`
	Team        auto.Label `json:"team" aolabel:"team"`
	//Applier     auto.Label     `json:"applier" aolabel:"user"`
	From       int            `json:"from"`
	CreateTime auto.TimeLabel `json:"create_time"`
}

type Approval struct {
	Id           string         `json:"id,omitempty"`
	Service      auto.Label     `json:"service" aolabel:"service"`
	Team         auto.Label     `json:"team" aolabel:"team"`
	Application  auto.Label     `json:"application" aolabel:"service"`
	ApplyTeam    auto.Label     `json:"apply_team" aolabel:"team"`
	ApplyTime    auto.TimeLabel `json:"apply_time"`
	Applier      auto.Label     `json:"applier" aolabel:"user"`
	Approver     auto.Label     `json:"approver" aolabel:"user"`
	ApprovalTime auto.TimeLabel `json:"approval_time"`
	Reason       string         `json:"reason"`
	Opinion      string         `json:"opinion"`
	Status       int            `json:"status"`
}

type ApprovalItem struct {
	Id           string         `json:"id"`
	Service      auto.Label     `json:"service" aolabel:"service"`
	Team         auto.Label     `json:"team" aolabel:"team"`
	Application  auto.Label     `json:"application" aolabel:"service"`
	ApplyTeam    auto.Label     `json:"apply_team" aolabel:"team"`
	ApplyTime    auto.TimeLabel `json:"apply_time"`
	Applier      auto.Label     `json:"applier" aolabel:"user"`
	Approver     auto.Label     `json:"approver" aolabel:"user"`
	ApprovalTime auto.TimeLabel `json:"approval_time"`
	Status       int            `json:"status"`
}

//
//type PartitionServiceItem struct {
//	Id         string `json:"id"`
//	Name       string `json:"name"`
//	ServiceNum int64  `json:"service_num"`
//}
