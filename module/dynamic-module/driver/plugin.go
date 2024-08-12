package driver

type PluginCfg struct {
	Id      string        `json:"id,omitempty" yaml:"id"`
	Name    string        `json:"name,omitempty" yaml:"name"`
	Cname   string        `json:"cname,omitempty" yaml:"cname"`
	Resume  string        `json:"resume,omitempty" yaml:"resume"`
	Version string        `json:"version,omitempty" yaml:"version"`
	ICon    string        `json:"icon,omitempty" yaml:"icon"`
	Driver  string        `json:"driver,omitempty" yaml:"driver"`
	GroupId string        `json:"group_id,omitempty" yaml:"group_id"`
	Front   string        `json:"front,omitempty" yaml:"front"`
	Define  *PluginDefine `json:"define,omitempty" yaml:"define"`
}

type PluginDefine struct {
	Profession string            `yaml:"profession"`
	Drivers    []*Field          `yaml:"drivers"`
	Skill      string            `yaml:"skill"`
	Fields     []*Field          `yaml:"fields"`
	Render     map[string]string `yaml:"render"`
}

type Field struct {
	Name  string   `yaml:"name"`
	Title string   `yaml:"title"`
	Attr  string   `json:"attr,omitempty"`
	Enum  []string `json:"enum,omitempty"`
}
