package log

import (
	"reflect"

	log_dto "github.com/APIParkLab/APIPark/module/log/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type ILogController interface {
	Save(ctx *gin.Context, driver string, input *log_dto.Save) error
	Get(ctx *gin.Context, driver string) (*log_dto.LogSource, error)
}

func init() {
	logController := &imlLogController{}
	autowire.Auto[ILogController](func() reflect.Value {
		return reflect.ValueOf(logController)
	})
}
