package ai_local

import (
	"context"
	"reflect"

	"github.com/APIParkLab/APIPark/gateway"

	"github.com/eolinker/go-common/autowire"

	ai_provider_local "github.com/APIParkLab/APIPark/ai-provider/local"

	ai_local_dto "github.com/APIParkLab/APIPark/module/ai-local/dto"
)

type ILocalModelModule interface {
	Search(ctx context.Context, keyword string) ([]*ai_local_dto.LocalModelItem, error)
	ListCanInstall(ctx context.Context, keyword string) ([]*ai_local_dto.LocalModelPackageItem, error)
	Deploy(ctx context.Context, model string, session string, fn ...func() error) (*ai_provider_local.Pipeline, error)
	CancelDeploy(ctx context.Context, model string) error
	RemoveModel(ctx context.Context, model string) error
	Enable(ctx context.Context, model string) error
	Disable(ctx context.Context, model string) error
	ModelState(ctx context.Context, model string) (*ai_local_dto.DeployState, *ai_local_dto.ModelInfo, error)
	SimpleList(ctx context.Context) ([]*ai_local_dto.SimpleItem, error)
	SaveCache(ctx context.Context, model string, target string) error

	SyncLocalModels(ctx context.Context, address string) error
}

func init() {
	localModel := new(imlLocalModel)
	autowire.Auto[ILocalModelModule](func() reflect.Value {
		gateway.RegisterInitHandleFunc(localModel.initGateway)
		return reflect.ValueOf(localModel)
	})
}
