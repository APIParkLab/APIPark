package dto

import (
	"github.com/APIParkLab/APIPark/model/plugin_model"
	"github.com/eolinker/go-common/auto"
)

type Item struct {
	Name     string          `json:"name"`
	Cname    string          `json:"cname"`
	Extend   string          `json:"extend"`
	Desc     string          `json:"desc"`
	Operator *auto.Label     `json:"operator,omitempty" aolabel:"operator"`
	Update   *auto.TimeLabel `json:"update,omitempty"`
	Create   *auto.TimeLabel `json:"create,omitempty"`
}
type Define struct {
	Name    string                  `json:"name"`
	Cname   string                  `json:"cname"`
	Extend  string                  `json:"extend"`
	Desc    string                  `json:"desc"`
	Render  plugin_model.Render     `json:"render"`
	Default plugin_model.ConfigType `json:"default"`
}
type PluginOutput struct {
	//Cluster auto.Label              `json:"partition,omitempty" aolabel:"partition"`
	Name     string                  `json:"name"`
	Cname    string                  `json:"cname"`
	Extend   string                  `json:"extend"`
	Desc     string                  `json:"desc"`
	Status   plugin_model.Status     `json:"status"`
	Config   plugin_model.ConfigType `json:"config"`
	Operator *auto.Label             `json:"operator,omitempty" aolabel:"operator"`
	Update   *auto.TimeLabel         `json:"update,omitempty"`
	Create   *auto.TimeLabel         `json:"create,omitempty"`
}

type PluginOption struct {
	Name    string                  `json:"name"`
	Cname   string                  `json:"cname"`
	Desc    string                  `json:"desc"`
	Default plugin_model.ConfigType `json:"default"`
	Render  plugin_model.Render     `json:"render"`
}
