package catalogue

import (
	"reflect"
	
	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
)

type ICatalogueService interface {
	universally.IServiceGet[Catalogue]
	universally.IServiceDelete
	universally.IServiceCreate[CreateCatalogue]
	universally.IServiceEdit[EditCatalogue]
}

func init() {
	autowire.Auto[ICatalogueService](func() reflect.Value {
		return reflect.ValueOf(new(imlCatalogueService))
	})
}
