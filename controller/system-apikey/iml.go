package system_apikey

import (
	system_apikey "github.com/APIParkLab/APIPark/module/system-apikey"
	system_apikey_dto "github.com/APIParkLab/APIPark/module/system-apikey/dto"
	"github.com/gin-gonic/gin"
)

var _ IAPIKeyController = new(imlAPIKeyController)

type imlAPIKeyController struct {
	apikeyModule system_apikey.IAPIKeyModule `autowired:""`
}

func (i *imlAPIKeyController) MyAPIKeysByService(ctx *gin.Context, serviceId string) ([]*system_apikey_dto.SimpleItem, error) {
	return i.apikeyModule.MyAPIKeysByService(ctx, serviceId)
}

func (i *imlAPIKeyController) MyAPIKeys(ctx *gin.Context) ([]*system_apikey_dto.SimpleItem, error) {
	return i.apikeyModule.MyAPIKeys(ctx)
}

func (i *imlAPIKeyController) Create(ctx *gin.Context, input *system_apikey_dto.Create) error {
	return i.apikeyModule.Create(ctx, input)
}

func (i *imlAPIKeyController) Update(ctx *gin.Context, id string, input *system_apikey_dto.Update) error {
	return i.apikeyModule.Update(ctx, id, input)
}

func (i *imlAPIKeyController) Delete(ctx *gin.Context, id string) error {
	return i.apikeyModule.Delete(ctx, id)
}

func (i *imlAPIKeyController) Get(ctx *gin.Context, id string) (*system_apikey_dto.APIKey, error) {
	return i.apikeyModule.Get(ctx, id)
}

func (i *imlAPIKeyController) Search(ctx *gin.Context, keyword string) ([]*system_apikey_dto.Item, error) {
	return i.apikeyModule.Search(ctx, keyword)
}

func (i *imlAPIKeyController) SimpleList(ctx *gin.Context) ([]*system_apikey_dto.SimpleItem, error) {
	return i.apikeyModule.SimpleList(ctx)
}
