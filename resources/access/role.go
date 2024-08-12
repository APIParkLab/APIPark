package access

import (
	_ "embed"

	"github.com/eolinker/go-common/access"
	"gopkg.in/yaml.v3"
)

type Role = access.Role

var (
	//go:embed role.yaml
	roleData []byte
)

func init() {
	ts := make(map[string][]Role)
	err := yaml.Unmarshal(roleData, &ts)
	if err != nil {
		panic(err)
	}
	access.RoleAdd(ts)
}
