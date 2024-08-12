package publish

import (
	"context"
	"reflect"
	
	"github.com/APIParkLab/APIPark/service/service_diff"
	"github.com/eolinker/go-common/autowire"
)

type IPublishService interface {
	SetLatest(ctx context.Context, release string, id string) error
	RemoveLatest(ctx context.Context, release string) error
	Latest(ctx context.Context, release ...string) ([]*Publish, error)
	GetLatest(ctx context.Context, id string) (*Publish, error)
	Get(ctx context.Context, id string) (*Publish, error)
	GetDiff(ctx context.Context, id string) (*service_diff.Diff, error)
	ListProject(ctx context.Context, project string) ([]*Publish, error)
	ListProjectPage(ctx context.Context, project string, page int, pageSize int) ([]*Publish, int64, error)
	ListForStatus(ctx context.Context, project string, status ...StatusType) ([]*Publish, error)
	ListForStatusPage(ctx context.Context, page int, pageSize int, status ...StatusType) ([]*Publish, int64, error)
	
	Create(ctx context.Context, uuid, project, release, previous, version, remark string, diff *service_diff.Diff) error
	
	SetStatus(ctx context.Context, project, id string, status StatusType) error
	Refuse(ctx context.Context, project, id string, comments string) error
	Accept(ctx context.Context, project, id string, comments string) error
	
	SetPublishStatus(ctx context.Context, status *Status) error
	GetPublishStatus(ctx context.Context, id string) ([]*Status, error)
}

func init() {
	autowire.Auto[IPublishService](func() reflect.Value {
		return reflect.ValueOf(new(imlPublishService))
	})
}
