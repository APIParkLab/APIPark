package ai_key

import (
	"strconv"

	ai_key "github.com/APIParkLab/APIPark/module/ai-key"
	ai_key_dto "github.com/APIParkLab/APIPark/module/ai-key/dto"
	"github.com/gin-gonic/gin"
)

var _ IKeyController = &imlAIKeyController{}

type imlAIKeyController struct {
	module ai_key.IKeyModule `autowired:""`
}

func (i *imlAIKeyController) Enable(ctx *gin.Context, providerId string, id string) error {
	return i.module.UpdateKeyStatus(ctx, providerId, id, true)
}

func (i *imlAIKeyController) Disable(ctx *gin.Context, providerId string, id string) error {
	return i.module.UpdateKeyStatus(ctx, providerId, id, false)
}

func (i *imlAIKeyController) Create(ctx *gin.Context, providerId string, input *ai_key_dto.Create) error {
	return i.module.Create(ctx, providerId, input)
}

func (i *imlAIKeyController) Edit(ctx *gin.Context, providerId string, id string, input *ai_key_dto.Edit) error {
	return i.module.Edit(ctx, providerId, id, input)
}

func (i *imlAIKeyController) Delete(ctx *gin.Context, providerId string, id string) error {
	return i.module.Delete(ctx, providerId, id)
}

func (i *imlAIKeyController) Get(ctx *gin.Context, providerId string, id string) (*ai_key_dto.Key, error) {
	return i.module.Get(ctx, providerId, id)
}

func (i *imlAIKeyController) List(ctx *gin.Context, providerId string, keyword string, page string, pageSize string) ([]*ai_key_dto.Item, int64, error) {
	p, err := strconv.Atoi(page)
	if err != nil {
		if page != "" {
			return nil, 0, err
		}
		p = 1
	}
	ps, err := strconv.Atoi(pageSize)
	if err != nil {
		if pageSize != "" {
			return nil, 0, err
		}
		ps = 15
	}
	return i.module.List(ctx, providerId, keyword, p, ps)
}

func (i *imlAIKeyController) Sort(ctx *gin.Context, providerId string, input *ai_key_dto.Sort) error {
	return i.module.Sort(ctx, providerId, input)
}
