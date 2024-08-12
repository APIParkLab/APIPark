package tag

import (
	"reflect"
	
	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
)

type ITagService interface {
	universally.IServiceGet[Tag]
	universally.IServiceDelete
	universally.IServiceCreate[CreateTag]
}

func init() {
	autowire.Auto[ITagService](func() reflect.Value {
		return reflect.ValueOf(new(imlTagService))
	})
}
