package permit

import (
	_ "embed"

	"github.com/eolinker/go-common/permit"
	"gopkg.in/yaml.v3"
)

var (

	//go:embed permit.yml
	data []byte
)

func init() {

	//reset()

}
func reset() {
	pConfig := make(map[string]map[string][]string)
	err := yaml.Unmarshal(data, &pConfig)
	if err != nil {
		panic(err)
	}
	for group, rules := range pConfig {
		for access, paths := range rules {
			av := permit.FormatAccess(group, access)
			permit.AddPermitRule(av, paths...)
		}
	}

}
