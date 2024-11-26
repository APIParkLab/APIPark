package strategy_filter

import "regexp"

var (
	CIDRIpv4Exp = `^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([1-9]|[1-2]\d|3[0-2]))?$`
)

var _ IFilter = &ipFilter{}

func init() {
	filterHandler.RegisterFilter(newIpFilter())
}

type ipFilter struct {
	name    string
	title   string
	typ     string
	pattern *regexp.Regexp
}

func newIpFilter() *ipFilter {
	return &ipFilter{
		name:    "ip",
		title:   "IP",
		typ:     TypePattern,
		pattern: regexp.MustCompile(CIDRIpv4Exp),
	}
}

func (i *ipFilter) Name() string {
	return i.name
}

func (i *ipFilter) Title() string {
	return i.title
}

func (i *ipFilter) Labels(values ...string) []string {
	return values
}

func (i *ipFilter) Type() string {
	return i.typ
}

func (i *ipFilter) Scopes() []string {
	return []string{ScopeGlobal, ScopeService}
}

func (i *ipFilter) Option() *Option {
	return &Option{
		Name:    i.name,
		Title:   i.title,
		Type:    i.typ,
		Pattern: i.pattern,
	}
}
