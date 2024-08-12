package plugin

import (
	_ "embed"

	"gopkg.in/yaml.v3"
)

//go:embed apinto_plugin.yml
var pluginData []byte

type GlobalPlugin struct {
	Config     interface{} `json:"config,omitempty"` //Plugin***Config
	Id         string      `json:"id"`
	InitConfig interface{} `json:"init_config,omitempty"`
	Name       string      `json:"name"`   //名称
	Status     string      `json:"status"` //enable,disable,global
	Rely       string      `json:"rely"`   //依赖哪个插件
}

var pluginConf []*GlobalPlugin

func init() {
	var err error

	pc := make([]*GlobalPlugin, 0)
	err = yaml.Unmarshal(pluginData, &pc)
	if err != nil {
		panic(err)
	}

	pluginConf = pc
}

func GetGlobalPluginConf() []*GlobalPlugin {
	return pluginConf
}
