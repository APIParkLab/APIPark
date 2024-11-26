package catalogue_dto

import "github.com/eolinker/go-common/auto"

type Item struct {
	Id       string  `json:"id"`
	Name     string  `json:"name"`
	Children []*Item `json:"children"`
	Sort     int     `json:"-"`
}

type ServiceItem struct {
	Id            string       `json:"id"`
	Name          string       `json:"name"`
	Tags          []auto.Label `json:"tags" aolabel:"tag"`
	Catalogue     auto.Label   `json:"catalogue" aolabel:"catalogue"`
	Description   string       `json:"description"`
	Logo          string       `json:"logo"`
	ApiNum        int64        `json:"api_num"`
	SubscriberNum int64        `json:"subscriber_num"`
}

type ServiceDetail struct {
	Name        string        `json:"name"`
	Description string        `json:"description"`
	Document    string        `json:"document"`
	Basic       *ServiceBasic `json:"basic"`
	//Apis        []*ServiceApi `json:"apis"`
	APIDoc string `json:"api_doc"`
}

type ServiceBasic struct {
	Team          auto.Label     `json:"team" aolabel:"team"`
	ApiNum        int            `json:"api_num"`
	AppNum        int            `json:"app_num"`
	Tags          []auto.Label   `json:"tags" aolabel:"tag"`
	Catalogue     auto.Label     `json:"catalogue" aolabel:"catalogue"`
	Version       string         `json:"version"`
	UpdateTime    auto.TimeLabel `json:"update_time"`
	Logo          string         `json:"logo"`
	ApprovalType  string         `json:"approval_type"`
	ServiceKind   string         `json:"service_kind"`
	InvokeAddress string         `json:"invoke_address"`
	SitePrefix    string         `json:"site_prefix"`
}

type ServiceApiBasic struct {
	Id          string         `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Method      string         `json:"method"`
	Path        string         `json:"path"`
	Creator     auto.Label     `json:"creator" aolabel:"user"`
	Updater     auto.Label     `json:"updater" aolabel:"user"`
	CreateTime  auto.TimeLabel `json:"create_time"`
	UpdateTime  auto.TimeLabel `json:"update_time"`
}

type ServiceApi struct {
	*ServiceApiBasic
	Doc interface{} `json:"doc"`
}

type Partition struct {
	Id     string `json:"id"`
	Name   string `json:"name"`
	Prefix string `json:"prefix"`
}

type Catalogue struct {
	Id     string `json:"id"`
	Name   string `json:"name"`
	Parent string `json:"parent"`
	Sort   int    `json:"sort"`
}

type ExportCatalogue struct {
	Id     string `json:"id"`
	Name   string `json:"name"`
	Parent string `json:"parent"`
	Sort   int    `json:"sort"`
}
