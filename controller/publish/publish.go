package publish

import (
	"reflect"
	
	"github.com/APIParkLab/APIPark/module/publish/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

var (
	_ IPublishController = (*imlPublishController)(nil)
)

type IPublishController interface {
	CheckPublish(ctx *gin.Context, serviceId string, releaseId string) (*dto.DiffOut, error)
	ReleaseDo(ctx *gin.Context, serviceId string, input *dto.ApplyOnReleaseInput) (*dto.Publish, error)
	ApplyOnRelease(ctx *gin.Context, serviceId string, input *dto.ApplyOnReleaseInput) (*dto.Publish, error)
	Apply(ctx *gin.Context, serviceId string, input *dto.ApplyInput) (*dto.Publish, error)
	Close(ctx *gin.Context, serviceId string, id string) error
	Stop(ctx *gin.Context, serviceId string, id string) error
	Refuse(ctx *gin.Context, serviceId string, id string, input *dto.Comments) error
	Accept(ctx *gin.Context, serviceId string, id string, input *dto.Comments) error
	Publish(ctx *gin.Context, serviceId string, id string) error
	ListPage(ctx *gin.Context, serviceId string, page, pageSize string) ([]*dto.Publish, int, int, int64, error)
	Detail(ctx *gin.Context, serviceId string, id string) (*dto.PublishDetail, error)
	PublishStatuses(ctx *gin.Context, serviceId string, id string) ([]*dto.PublishStatus, error)
}

func init() {
	autowire.Auto[IPublishController](func() reflect.Value {
		return reflect.ValueOf(new(imlPublishController))
	})
}
