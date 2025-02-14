package ai_local

import (
	"reflect"

	ai_local_dto "github.com/APIParkLab/APIPark/module/ai-local/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type ILocalModelController interface {
	Search(ctx *gin.Context, keyword string) ([]*ai_local_dto.LocalModelItem, error)
	ListCanInstall(ctx *gin.Context, keyword string) ([]*ai_local_dto.LocalModelPackageItem, error)
	Deploy(ctx *gin.Context)
	DeployStart(ctx *gin.Context, input *ai_local_dto.DeployInput) error
	CancelDeploy(ctx *gin.Context, input *ai_local_dto.CancelDeploy) error
	RemoveModel(ctx *gin.Context, model string) error
	Update(ctx *gin.Context, model string, input *ai_local_dto.Update) error
	State(ctx *gin.Context, model string) (*ai_local_dto.DeployState, *ai_local_dto.ModelInfo, error)
}

func init() {
	autowire.Auto[ILocalModelController](func() reflect.Value {
		return reflect.ValueOf(new(imlLocalModelController))
	})
}
