package ai_balance

import (
	ai_balance "github.com/APIParkLab/APIPark/module/ai-balance"
	ai_balance_dto "github.com/APIParkLab/APIPark/module/ai-balance/dto"
	"github.com/gin-gonic/gin"
)

var _ IBalanceController = (*imlBalanceController)(nil)

type imlBalanceController struct {
	module ai_balance.IBalanceModule `autowired:""`
}

func (i *imlBalanceController) List(ctx *gin.Context, keyword string) ([]*ai_balance_dto.Item, error) {
	return i.module.List(ctx, keyword)
}

func (i *imlBalanceController) Sort(ctx *gin.Context, input *ai_balance_dto.Sort) error {
	return i.module.Sort(ctx, input)
}

func (i *imlBalanceController) Create(ctx *gin.Context, input *ai_balance_dto.Create) error {
	return i.module.Create(ctx, input)
}

func (i *imlBalanceController) Delete(ctx *gin.Context, id string) error {
	return i.module.Delete(ctx, id)
}
