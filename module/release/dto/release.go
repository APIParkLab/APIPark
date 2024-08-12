package dto

import (
	"github.com/APIParkLab/APIPark/module/publish/dto"
	"github.com/eolinker/go-common/auto"
)

type Release struct {
	Id          string         `json:"id,omitempty"`
	Version     string         `json:"version,omitempty"`
	Service     auto.Label     `json:"service,omitempty" aolabel:"service"`
	CreateTime  auto.TimeLabel `json:"create_time"`
	Creator     auto.Label     `json:"creator" aolabel:"user"`
	Status      Status         `json:"status,omitempty"`
	FlowId      string         `json:"flowId,omitempty"`
	Remark      string         `json:"remark,omitempty"`
	CanDelete   bool           `json:"can_delete,omitempty"`
	CanRollback bool           `json:"can_rollback,omitempty"`
}

type Detail struct {
	Id         string         `json:"id,omitempty"`
	Version    string         `json:"version,omitempty"`
	Remark     string         `json:"remark,omitempty"`
	Service    auto.Label     `json:"service,omitempty" aolabel:"service"`
	CreateTime auto.TimeLabel `json:"createTime"`
	Creator    auto.Label     `json:"creator" aolabel:"user"`
	Diffs      *dto.DiffOut   `json:"diffs,omitempty"`
}
