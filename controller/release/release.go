package release

import (
	"reflect"
	
	service_diff "github.com/APIParkLab/APIPark/module/service-diff"
	
	"github.com/APIParkLab/APIPark/module/release/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type IReleaseController interface {
	Create(ctx *gin.Context, project string, input *dto.CreateInput) error
	Delete(ctx *gin.Context, project string, id string) error
	Detail(ctx *gin.Context, project string, id string) (*dto.Detail, error)
	List(ctx *gin.Context, project string) ([]*dto.Release, error)
	Preview(ctx *gin.Context, project string) (*dto.Release, *service_diff.DiffOut, bool, error)
}

func init() {
	autowire.Auto[IReleaseController](func() reflect.Value {
		return reflect.ValueOf(new(imlReleaseController))
	})
}
