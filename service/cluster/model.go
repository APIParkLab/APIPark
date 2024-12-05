package cluster

import (
	"time"

	"github.com/APIParkLab/APIPark/stores/cluster"
)

type Cluster struct {
	Uuid       string
	Name       string
	Resume     string
	Cluster    string
	Creator    string
	Updater    string
	Status     int
	CreateTime time.Time
	UpdateTime time.Time
}

func FromEntity(entity *cluster.Cluster) *Cluster {
	return &Cluster{
		Uuid:       entity.UUID,
		Name:       entity.Name,
		Resume:     entity.Resume,
		Cluster:    entity.Cluster,
		Creator:    entity.Creator,
		Updater:    entity.Updater,
		CreateTime: entity.CreateAt,
		UpdateTime: entity.UpdateAt,
	}
}

type Node struct {
	Uuid       string
	Name       string
	Cluster    string
	Peer       []string
	Admin      []string
	Server     []string
	CreateTime time.Time
}
