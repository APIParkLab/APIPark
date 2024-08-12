package permit_dto

import (
	"github.com/APIParkLab/APIPark/service/permit-type"
	"strings"
)

type Permission struct {
	Access      string   `json:"access"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Grant       []*Grant `json:"grant"`
}
type Grant = permit_type.Target

type Option = Grant

func SearchOptions(ops []*Option, keyword string) []*Option {
	if keyword == "" {
		return ops
	}
	rs := make([]*Option, 0, len(ops))
	
	for _, op := range ops {
		if op.Name == keyword || strings.Index(op.Name, keyword) > -1 || op.Label == keyword || strings.Index(op.Label, keyword) > -1 {
			rs = append(rs, op)
		}
	}
	return rs
}
