package certificate_dto

import (
	"github.com/APIParkLab/APIPark/service/certificate"
	"github.com/eolinker/go-common/auto"
)

type Certificate struct {
	Id         string         `json:"id"`
	Name       string         `json:"name"`
	Domains    []string       `json:"domains"`
	Partition  string         `json:"partition"`
	NotBefore  auto.TimeLabel `json:"not_before"`
	NotAfter   auto.TimeLabel `json:"not_after"`
	Updater    auto.Label     `json:"updater" aolabel:"user"`
	UpdateTime auto.TimeLabel `json:"update_time,omitempty"`
}

func FromModel(c *certificate.Certificate) *Certificate {
	return &Certificate{
		Id:         c.ID,
		Name:       c.Name,
		Domains:    c.Domains,
		Partition:  c.Cluster,
		NotBefore:  auto.TimeLabel(c.NotBefore),
		NotAfter:   auto.TimeLabel(c.NotAfter),
		Updater:    auto.UUID(c.Updater),
		UpdateTime: auto.TimeLabel(c.UpdateTime),
	}
}

type File struct {
	Key  string `json:"key"`
	Cert string `json:"pem"`
}
