package dto

import (
	"github.com/APIParkLab/APIPark/service/publish"
	"github.com/eolinker/go-common/auto"
)

type Publish struct {
	Id            string             `json:"id,omitempty"`
	Version       string             `json:"version,omitempty"`
	Remark        string             `json:"remark,omitempty"`
	VersionRemark string             `json:"version_remark,omitempty"`
	Comments      string             `json:"comments,omitempty"`
	Release       auto.Label         `json:"release,omitempty" aolabel:"release"`
	Previous      *auto.Label        `json:"previous,omitempty" aolabel:"release"`
	Service       auto.Label         `json:"service" aolabel:"service"`
	Applicant     auto.Label         `json:"applicant" aolabel:"user"`
	Approver      *auto.Label        `json:"approver,omitempty" aolabel:"user"`
	Status        publish.StatusType `json:"status,omitempty" `
	ApplyTIme     auto.TimeLabel     `json:"apply_time" `
	ApproveTime   auto.TimeLabel     `json:"approve_time"`
}

func FromModel(m *publish.Publish, versionRemark string) *Publish {

	p := &Publish{
		Id:            m.Id,
		Version:       m.Version,
		Remark:        m.Remark,
		VersionRemark: versionRemark,
		Comments:      m.Comments,
		Service:       auto.UUID(m.Service),
		Applicant:     auto.UUID(m.Applicant),
		Release:       auto.UUID(m.Release),

		Status:      m.Status,
		ApplyTIme:   auto.TimeLabel(m.ApplyTime),
		ApproveTime: auto.TimeLabel(m.ApproveTime),
	}
	if m.Approver != "" {
		p.Approver = auto.UUIDP(m.Approver)
	}
	if m.Previous != "" {
		p.Previous = auto.UUIDP(m.Previous)
	}
	return p
}

type PublishDetail struct {
	*Publish
	Diffs           *DiffOut         `json:"diffs"`
	PublishStatuses []*PublishStatus `json:"cluster_publish_status"`
}

type PublishStatus struct {
	//Cluster auto.Label `json:"partition" aolabel:"partition"`
	//Cluster auto.Label `json:"cluster" aolabel:"cluster"`
	Status string `json:"status"`
	Error  string `json:"error"`
}
