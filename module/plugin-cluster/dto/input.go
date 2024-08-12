package dto

import "github.com/APIParkLab/APIPark/model/plugin_model"

type PluginSetting struct {
	Status plugin_model.Status     `json:"status"`
	Config plugin_model.ConfigType `json:"config"`
}
