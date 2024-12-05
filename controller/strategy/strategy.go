package strategy

import (
	"reflect"

	strategy_dto "github.com/APIParkLab/APIPark/module/strategy/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type IStrategyController interface {
	GlobalStrategyList(ctx *gin.Context, keyword string, driver string, page string, pageSize string, order string, sort string, filters string) ([]*strategy_dto.StrategyItem, int64, error)
	CreateGlobalStrategy(ctx *gin.Context, driver string, input *strategy_dto.Create) error
	PublishGlobalStrategy(ctx *gin.Context, driver string) error

	ServiceStrategyList(ctx *gin.Context, keyword string, serviceId string, driver string, page string, pageSize string, order string, sort string, filters string) ([]*strategy_dto.StrategyItem, int64, error)
	CreateServiceStrategy(ctx *gin.Context, serviceId string, driver string, input *strategy_dto.Create) error

	EditStrategy(ctx *gin.Context, id string, input *strategy_dto.Edit) error
	GetStrategy(ctx *gin.Context, id string) (*strategy_dto.Strategy, error)
	EnableStrategy(ctx *gin.Context, id string) error
	DisableStrategy(ctx *gin.Context, id string) error

	DeleteStrategy(ctx *gin.Context, id string) error
	DeleteServiceStrategy(ctx *gin.Context, serviceId string, id string) error

	Restore(ctx *gin.Context, id string) error

	FilterGlobalOptions(ctx *gin.Context) ([]*strategy_dto.FilterOption, error)
	FilterServiceOptions(ctx *gin.Context) ([]*strategy_dto.FilterOption, error)

	FilterGlobalRemote(ctx *gin.Context, name string) ([]*strategy_dto.Title, []any, int64, string, string, error)
	FilterServiceRemote(ctx *gin.Context, serviceId string, name string) ([]*strategy_dto.Title, []any, int64, string, string, error)

	ToPublish(ctx *gin.Context, driver string) ([]*strategy_dto.ToPublishItem, string, string, bool, error)

	GetStrategyLogs(ctx *gin.Context, keyword string, strategyId string, start string, end string, limit string, offset string) ([]*strategy_dto.LogItem, int64, error)
	LogInfo(ctx *gin.Context, id string) (*strategy_dto.LogInfo, error)
}

type IStrategyCommonController interface {
}

func init() {
	autowire.Auto[IStrategyController](func() reflect.Value {
		return reflect.ValueOf(&imlStrategyController{})
	})
}
