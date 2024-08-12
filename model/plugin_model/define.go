package plugin_model

type Define struct {
	Extend string
	Name   string
	Cname  string
	Desc   string
	Kind   Kind
	Status Status
	Config ConfigType
	Render Render
}
