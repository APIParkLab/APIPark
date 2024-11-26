package strategy_filter

import "net/http"

var _ IFilter = &methodFilter{}

func init() {
	filterHandler.RegisterFilter(newMethodFilter())
}

type methodFilter struct {
	name    string
	title   string
	typ     string
	options []string
}

func newMethodFilter() *methodFilter {
	return &methodFilter{
		name:    "method",
		title:   "api method",
		typ:     TypeStatic,
		options: []string{HttpALL, http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodPatch, http.MethodHead, http.MethodOptions},
	}
}

func (m *methodFilter) Name() string {
	return m.name
}

func (m *methodFilter) Title() string {
	return m.title
}

func (m *methodFilter) Labels(values ...string) []string {
	if len(values) > 0 && values[0] != ValuesALL {
		return []string{"all method"}
	}
	if len(values) == 0 {
		return []string{"-"}
	}
	return values
}

func (m *methodFilter) Type() string {
	return m.typ
}

func (m *methodFilter) Scopes() []string {
	return []string{ScopeGlobal, ScopeService}
}

func (m *methodFilter) Option() *Option {
	return &Option{
		Name:    m.name,
		Title:   m.title,
		Type:    m.typ,
		Options: m.options,
	}
}
