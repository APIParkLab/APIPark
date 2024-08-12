package driver

import "encoding/json"

type IDriver interface {
	ID() string
	Name() string
	Title() string
	Group() string
	Front() string
	Define() IDefine
}

type IDefine interface {
	Profession() string
	Skill() string
	Drivers() []*Field
	Fields(fields ...*Field) []*Field
	Render() map[string]interface{}
	Columns() []string
}

type Driver struct {
	id     string
	name   string
	title  string
	group  string
	front  string
	define IDefine
}

func (d *Driver) ID() string {
	return d.id
}

func (d *Driver) Name() string {
	return d.name
}

func (d *Driver) Title() string {
	return d.title
}

func (d *Driver) Group() string {
	return d.group
}

func (d *Driver) Front() string {
	return d.front
}

func (d *Driver) Define() IDefine {
	return d.define
}

func NewDriver(cfg *PluginCfg) IDriver {
	return &Driver{
		id:     cfg.Id,
		name:   cfg.Name,
		title:  cfg.Cname,
		group:  cfg.GroupId,
		front:  cfg.Front,
		define: NewDefine(cfg.Define),
	}
}

var defaultFields = []*Field{
	{
		Name:  "updater",
		Title: "更新者",
	},
	{
		Name:  "update_time",
		Title: "更新时间",
	},
}

type Define struct {
	profession string
	skill      string
	drivers    []*Field
	fields     []*Field
	columns    []string
	render     map[string]interface{}
}

func (d *Define) Columns() []string {
	return d.columns
}

func NewDefine(d *PluginDefine) *Define {
	columns := make([]string, 0, len(d.Fields))
	for _, field := range d.Fields {
		columns = append(columns, field.Name)
	}
	render := make(map[string]interface{})
	for k, v := range d.Render {
		r := make(map[string]interface{})
		err := json.Unmarshal([]byte(v), &r)
		if err != nil {
			continue
		}
		render[k] = r
	}
	return &Define{
		profession: d.Profession,
		skill:      d.Skill,
		drivers:    d.Drivers,
		fields:     d.Fields,
		render:     render,
		columns:    columns,
	}
}

func (d *Define) Profession() string {
	return d.profession
}

func (d *Define) Skill() string {
	return d.skill
}

func (d *Define) Drivers() []*Field {
	return d.drivers
}

func (d *Define) Fields(fields ...*Field) []*Field {
	fs := make([]*Field, 0, len(d.fields)+len(fields)+len(defaultFields))
	fs = append(fs, d.fields...)
	fs = append(fs, fields...)
	fs = append(fs, defaultFields...)
	return fs
}

func (d *Define) Render() map[string]interface{} {
	return d.render
}
