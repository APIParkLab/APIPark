package publish

import (
	"time"
	
	"github.com/APIParkLab/APIPark/stores/publish"
)

type Publish struct {
	Id          string
	Service     string
	Release     string
	Previous    string
	Version     string
	ApplyTime   time.Time
	Applicant   string
	Remark      string
	ApproveTime time.Time
	Approver    string
	Comments    string
	Status      StatusType
}

func FromEntity(e *publish.Publish) *Publish {
	return &Publish{
		Id:          e.UUID,
		Service:     e.Service,
		Release:     e.Release,
		Previous:    e.Previous,
		Version:     e.Version,
		ApplyTime:   e.ApplyTime,
		Applicant:   e.Applicant,
		Remark:      e.Remark,
		ApproveTime: e.ApproveTime,
		Approver:    e.Approver,
		Comments:    e.Comments,
		Status:      StatusType(e.Status),
	}
}

type Status struct {
	Publish  string
	Cluster  string
	Status   StatusType
	Error    string
	UpdateAt time.Time
}
