package catalogue

import (
	"context"
	"time"
	
	"github.com/eolinker/go-common/auto"
	
	"github.com/eolinker/go-common/utils"
	
	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/APIParkLab/APIPark/stores/catalogue"
)

var (
	_ ICatalogueService = (*imlCatalogueService)(nil)
)

type imlCatalogueService struct {
	store catalogue.ICatalogueStore `autowired:""`
	universally.IServiceGet[Catalogue]
	universally.IServiceDelete
	universally.IServiceCreate[CreateCatalogue]
	universally.IServiceEdit[EditCatalogue]
}

func (i *imlCatalogueService) OnComplete() {
	i.IServiceGet = universally.NewGet[Catalogue, catalogue.Catalogue](i.store, FromEntity)
	i.IServiceCreate = universally.NewCreator[CreateCatalogue, catalogue.Catalogue](i.store, "catalogue", createEntityHandler, uniquestHandler, labelHandler)
	i.IServiceEdit = universally.NewEdit[EditCatalogue, catalogue.Catalogue](i.store, updateHandler, labelHandler)
	i.IServiceDelete = universally.NewDelete[catalogue.Catalogue](i.store)
	auto.RegisterService("catalogue", i)
}

func (i *imlCatalogueService) GetLabels(ctx context.Context, ids ...string) map[string]string {
	catalogues, err := i.store.ListQuery(ctx, "uuid in(?)", []interface{}{ids}, "id")
	if err != nil {
		return map[string]string{}
	}
	return utils.SliceToMapO(catalogues, func(t *catalogue.Catalogue) (string, string) {
		return t.UUID, t.Name
	})
}

func labelHandler(e *catalogue.Catalogue) []string {
	return []string{e.Name, e.UUID}
}
func uniquestHandler(i *CreateCatalogue) []map[string]interface{} {
	return []map[string]interface{}{{"uuid": i.Id}}
}
func createEntityHandler(i *CreateCatalogue) *catalogue.Catalogue {
	return &catalogue.Catalogue{
		UUID:     i.Id,
		Name:     i.Name,
		Parent:   i.Parent,
		CreateAt: time.Now(),
		UpdateAt: time.Now(),
	}
}
func updateHandler(e *catalogue.Catalogue, i *EditCatalogue) {
	if i.Name != nil {
		e.Name = *i.Name
	}
	if i.Parent != nil {
		e.Parent = *i.Parent
	}
	if i.Sort != nil {
		e.Sort = *i.Sort
	}
	e.UpdateAt = time.Now()
}
