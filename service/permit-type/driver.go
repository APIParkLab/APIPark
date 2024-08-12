package permit_type

import (
	"context"
	"strings"

	"github.com/eolinker/go-common/auto"
	"github.com/eolinker/go-common/utils"
)

type Target struct {
	Key   string     `json:"key"`
	Type  PermitType `json:"type"`
	Name  string     `json:"name"`
	Label string     `json:"label"`
	Tag   string     `json:"tag"`
}

func TargetsOf(ks ...string) []*Target {
	vs := make([]*Target, 0, len(ks))
	for _, k := range ks {
		vs = append(vs, TargetOf(k))
	}
	return vs
}
func TargetOf(key string) *Target {
	index := strings.Index(key, ":")
	if index > 0 {

		tp := Parse(key[0:index])
		if tp != Invalid {
			name := key[index+1:]

			if tp == Special {
				if v, has := specialRoles[name]; has {
					return v
				}
			}
			return tp.Target(name, "unknown")
		}
	}
	return &Target{
		Type:  Invalid,
		Name:  key,
		Label: key,
	}

}

func CompleteLabels(ctx context.Context, vs ...*Target) {
	ml := turn(vs)
	for n, vm := range ml {
		if n == Special {
			continue
		} else if service, has := auto.GetService(n.Name()); has {
			nl := utils.MapKeys(vm)
			labels := service.GetLabels(ctx, nl...)
			if labels == nil {
				continue
			}
			for _, v := range vs {
				if lv, h := labels[v.Name]; h {
					v.Label = lv
				}
			}
		}
	}
}

func turn(vs []*Target) map[PermitType]map[string]*Target {
	rs := make(map[PermitType]map[string]*Target)
	for _, v := range vs {
		if _, has := rs[v.Type]; !has {
			rs[v.Type] = make(map[string]*Target)
		}
		rs[v.Type][v.Name] = v
	}
	return rs
}
