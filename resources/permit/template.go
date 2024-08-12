package permit

import (
	_ "embed"
	"fmt"
	permit_type "github.com/APIParkLab/APIPark/service/permit-type"
	"github.com/eolinker/eosc/log"
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/permit"
	"github.com/eolinker/go-common/utils"
	"gopkg.in/yaml.v3"
	"reflect"
)

var (
	//go:embed template.yml
	templateData []byte
)
var (
	_ permit.IPermitInitialize = (*imlPermitData)(nil)
)

type imlPermitData struct {
	data map[string]map[string][]string
}

func (i *imlPermitData) Grants() map[string]map[string][]string {
	return i.data
}

func init() {
	autowire.Auto[permit.IPermitInitialize](func() reflect.Value {
		v := new(imlPermitData)
		permitData := make(map[string]map[string][]string)
		err := yaml.Unmarshal(templateData, permitData)
		if err != nil {
			log.Fatal("read permit initialize data :", err)
		}
		v.data = make(map[string]map[string][]string)
		for group, grants := range permitData {
			domain, has := domainForGroup[group]
			if !has {
				continue
			}
			
			if _, h := v.data[domain]; !h {
				v.data[domain] = make(map[string][]string)
			}
			
			for access, ts := range grants {
				v.data[domain][fmt.Sprintf("%s.%s", group, access)] = utils.SliceToSlice(ts, func(s string) string {
					return permit_type.Special.KeyOf(s)
				})
			}
		}
		
		return reflect.ValueOf(v)
	})
}

var (
	domainForGroup = map[string]string{
		"system":  "/",
		"team":    "/template/team",
		"project": "/template/project",
	}
)
