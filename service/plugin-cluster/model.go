package plugin_cluster

import (
	"time"
	
	"github.com/APIParkLab/APIPark/model/plugin_model"
	"github.com/APIParkLab/APIPark/stores/plugin"
)

type PluginOption struct {
	Name  string
	Cname string
	Desc  string
}
type PluginDefine struct {
	Extend string
	Name   string
	Cname  string
	Desc   string
	Kind   plugin_model.Kind
	Status plugin_model.Status
	Config plugin_model.ConfigType
	Render plugin_model.Render
	Update time.Time
}

func FromEntity(s *plugin.Define) *PluginDefine {
	return &PluginDefine{
		Extend: s.Extend,
		Name:   s.Name,
		Cname:  s.Cname,
		Desc:   s.Description,
		Kind:   s.Kind,
		Status: s.Status,
		Config: s.Config,
		Render: s.Render,
		Update: s.UpdateTime,
	}
}

type ConfigPartition struct {
	*Config
	Extend string
	Cname  string
	Desc   string
}

type Config struct {
	Plugin   string
	Status   plugin_model.Status
	Config   plugin_model.ConfigType
	Update   *time.Time
	Create   *time.Time
	Operator string
}

func ConfigFromStore(partition *plugin.Partition) *Config {
	return &Config{
		Plugin:   partition.Plugin,
		Status:   partition.Status,
		Config:   partition.Config,
		Update:   &partition.UpdateTime,
		Create:   &partition.CreateTime,
		Operator: partition.Operator,
	}
}
