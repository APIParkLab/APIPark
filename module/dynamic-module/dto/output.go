package dynamic_module_dto

import (
	"github.com/eolinker/go-common/auto"
)

type DynamicModule struct {
	Id          string                 `json:"id"`
	Name        string                 `json:"title"`
	Driver      string                 `json:"driver"`
	Description string                 `json:"description"`
	Config      map[string]interface{} `json:"config"`
}

type PluginBasic struct {
	Id    string `json:"id"`
	Name  string `json:"name"`
	Title string `json:"title"`
}

type PluginInfo struct {
	*PluginBasic
	Drivers []*Field `json:"drivers"`
	Fields  []*Field `json:"fields"`
}

type Field struct {
	Name  string   `json:"name"`
	Title string   `json:"title"`
	Attr  string   `json:"attr,omitempty"`
	Enum  []string `json:"enum,omitempty"`
}

type ModuleDriver struct {
	Name  string `json:"name"`
	Title string `json:"title"`
	Path  string `json:"path"`
}

type OnlineInfo struct {
	Id          string           `json:"id"`
	Name        string           `json:"name"`
	Title       string           `json:"title"`
	Description string           `json:"description"`
	Partitions  []*PartitionInfo `json:"partitions"`
}

type PartitionInfo struct {
	Name       string         `json:"name"`
	Title      string         `json:"title"`
	Status     string         `json:"status"`
	Updater    auto.Label     `json:"updater" aolabel:"user"`
	UpdateTime auto.TimeLabel `json:"update_time"`
}
