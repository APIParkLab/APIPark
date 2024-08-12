package access

import (
	_ "embed"

	"github.com/eolinker/go-common/access"
	"gopkg.in/yaml.v3"
)

type Access = access.Access

var (
	//go:embed access.yaml
	data []byte
)

func init() {
	ts := make(map[string][]Access)
	err := yaml.Unmarshal(data, &ts)
	if err != nil {
		panic(err)
	}
	for group, asl := range ts {
		access.Add(group, asl)

	}
	//defaultRoles := access.Roles()
	//for group, rs := range defaultRoles {
	//	p, has := access.GetPermit(group)
	//	if !has {
	//		continue
	//	}
	//
	//	for _, r := range rs {
	//		for _, pm := range r.Permits {
	//			apis, err := p.GetPermits(pm)
	//			if err != nil {
	//				continue
	//			}
	//			permit.AddPermitRule(pm, apis...)
	//		}
	//	}
	//
	//}
}
