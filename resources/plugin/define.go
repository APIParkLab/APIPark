package plugin

import "github.com/APIParkLab/APIPark/model/plugin_model"

type defineT struct {
	Id     string                  `json:"id,omitempty" yaml:"id"`
	Kind   string                  `json:"kind,omitempty" yaml:"kind"`
	CName  string                  `json:"CName,omitempty" yaml:"CName"`
	Status string                  `json:"status,omitempty" yaml:"status"`
	Config plugin_model.ConfigType `json:"config" yaml:"config"`
	Desc   string                  `json:"desc,omitempty" yaml:"desc"`
	//Render plugin_model.Render     `json:"render,omitempty" yaml:"render"`
}

type defineRender struct {
	Render plugin_model.Render `json:"render,omitempty" yaml:"render"`
}
