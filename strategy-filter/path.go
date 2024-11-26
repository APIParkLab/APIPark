package strategy_filter

import "regexp"

var _ IFilter = &pathFilter{}

var (
	ApiPathRegexp = `^\*?[\w-/]+\*?$`
)

type pathFilter struct {
	name    string
	title   string
	typ     string
	pattern *regexp.Regexp
}

func init() {
	filterHandler.RegisterFilter(newPathFilter())
}

func newPathFilter() *pathFilter {
	return &pathFilter{
		name:    "path",
		title:   "api path",
		typ:     TypePattern,
		pattern: regexp.MustCompile(ApiPathRegexp),
	}
}

func (p *pathFilter) Name() string {
	return p.name
}

func (p *pathFilter) Title() string {
	return p.title
}

func (p *pathFilter) Labels(values ...string) []string {
	return values
}

func (p *pathFilter) Type() string {
	return p.typ
}

func (p *pathFilter) Scopes() []string {
	return []string{ScopeGlobal, ScopeService}
}

func (p *pathFilter) Option() *Option {
	return &Option{
		Name:    p.name,
		Title:   p.title,
		Type:    p.typ,
		Pattern: p.pattern,
	}
}
