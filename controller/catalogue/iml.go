package catalogue

import (
	"github.com/APIParkLab/APIPark/module/catalogue"
	catalogue_dto "github.com/APIParkLab/APIPark/module/catalogue/dto"
	"github.com/APIParkLab/APIPark/module/service"
	"github.com/APIParkLab/APIPark/module/tag"
	tag_dto "github.com/APIParkLab/APIPark/module/tag/dto"
	"github.com/gin-gonic/gin"
)

var (
	_ ICatalogueController = (*imlCatalogueController)(nil)
)

type imlCatalogueController struct {
	catalogueModule catalogue.ICatalogueModule `autowired:""`
	appModule       service.IAppModule         `autowired:""`
	tagModule       tag.ITagModule             `autowired:""`
}

func (i *imlCatalogueController) Sort(ctx *gin.Context, sorts *[]*catalogue_dto.SortItem) error {
	return i.catalogueModule.Sort(ctx, *sorts)
}

func (i *imlCatalogueController) Subscribe(ctx *gin.Context, subscribeInfo *catalogue_dto.SubscribeService) error {
	return i.catalogueModule.Subscribe(ctx, subscribeInfo)
}

func (i *imlCatalogueController) ServiceDetail(ctx *gin.Context, sid string) (*catalogue_dto.ServiceDetail, error) {
	detail, err := i.catalogueModule.ServiceDetail(ctx, sid)
	if err != nil {
		return nil, err
	}
	_, canSubscribe, err := i.appModule.SearchCanSubscribe(ctx, sid)
	if err != nil {
		return nil, err
	}
	detail.CanSubscribe = canSubscribe
	return detail, nil

}

func (i *imlCatalogueController) Search(ctx *gin.Context, keyword string) ([]*catalogue_dto.Item, []*tag_dto.Item, error) {
	catalogues, err := i.catalogueModule.Search(ctx, keyword)
	if err != nil {
		return nil, nil, err
	}
	tags, err := i.tagModule.Search(ctx, keyword)
	if err != nil {
		return nil, nil, err
	}
	return catalogues, tags, nil
}

func (i *imlCatalogueController) Create(ctx *gin.Context, input *catalogue_dto.CreateCatalogue) error {
	return i.catalogueModule.Create(ctx, input)
}

func (i *imlCatalogueController) Edit(ctx *gin.Context, id string, input *catalogue_dto.EditCatalogue) error {
	return i.catalogueModule.Edit(ctx, id, input)
}

func (i *imlCatalogueController) Delete(ctx *gin.Context, id string) error {
	return i.catalogueModule.Delete(ctx, id)
}

func (i *imlCatalogueController) Services(ctx *gin.Context, keyword string) ([]*catalogue_dto.ServiceItem, error) {
	items, err := i.catalogueModule.Services(ctx, keyword)
	if err != nil {
		return nil, err
	}
	return items, nil
}
