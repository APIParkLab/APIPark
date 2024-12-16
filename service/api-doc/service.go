package api_doc

import (
	"context"
	"fmt"
	"reflect"
	"strings"

	yaml "gopkg.in/yaml.v3"

	"github.com/APIParkLab/APIPark/service/universally/commit"
	"github.com/eolinker/go-common/autowire"
	"github.com/getkin/kin-openapi/openapi3"
)

type IAPIDocService interface {
	// UpdateDoc 更新文档
	UpdateDoc(ctx context.Context, serviceId string, input *UpdateDoc) error
	// GetDoc 获取文档
	GetDoc(ctx context.Context, serviceId string) (*Doc, error)

	CommitDoc(ctx context.Context, serviceId string, data *Doc) error

	APICountByServices(ctx context.Context, serviceIds ...string) (map[string]int64, error)

	GetDocCommit(ctx context.Context, commitId string) (*commit.Commit[DocCommit], error)
	// LatestDocCommit 获取最新文档
	LatestDocCommit(ctx context.Context, serviceId string) (*commit.Commit[DocCommit], error)
	ListLatestDocCommit(ctx context.Context, serviceIds ...string) ([]*commit.Commit[DocCommit], error)
	ListDocCommit(ctx context.Context, commitIds ...string) ([]*commit.Commit[DocCommit], error)
	LatestAPICountByServices(ctx context.Context, serviceIds ...string) (map[string]int64, error)
	LatestAPICountByCommits(ctx context.Context, commitIds ...string) (map[string]int64, error)
}

func init() {
	autowire.Auto[IAPIDocService](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIDocService))
	})
	commit.InitCommitWithKeyService[DocCommit]("service", "api_doc")
}

const (
	openAPIv3 = "v3"
	openAPIv2 = "v2"
)

var (
	openapi3Loader = openapi3.NewLoader()
)

type DocLoader struct {
	openAPI3Doc *openapi3.T
	version     string
}

func NewDocLoader(content string) (*DocLoader, error) {
	doc, err := openapi3Loader.LoadFromData([]byte(content))
	if err != nil {
		return nil, fmt.Errorf("load openAPI3Doc error:%v", err)
	}
	return &DocLoader{openAPI3Doc: doc}, nil
}

func (d *DocLoader) Valid() error {
	if d.openAPI3Doc == nil {
		return fmt.Errorf("openAPI3Doc is nil")
	}

	if d.openAPI3Doc.Paths == nil {
		return fmt.Errorf("openAPI3Doc.Paths is nil")
	}
	return nil
}

func (d *DocLoader) APICount() int64 {
	if d.openAPI3Doc == nil || d.openAPI3Doc.Paths == nil {
		return 0
	}
	var count int64
	for _, item := range d.openAPI3Doc.Paths.Map() {
		if item.Get != nil {
			count++
		}
		if item.Post != nil {
			count++
		}
		if item.Put != nil {
			count++
		}
		if item.Patch != nil {
			count++
		}
		if item.Delete != nil {
			count++
		}
		if item.Head != nil {
			count++
		}
		if item.Options != nil {
			count++
		}
		if item.Trace != nil {
			count++
		}
	}
	return count
}

func (d *DocLoader) AddPrefixInAll(prefix string) error {
	prefix = strings.TrimSpace(prefix)
	if prefix == "" || d.openAPI3Doc == nil || d.openAPI3Doc.Paths == nil {
		return nil
	}

	prefix = fmt.Sprintf("/%s/", strings.Trim(prefix, "/"))
	for path, item := range d.openAPI3Doc.Paths.Map() {
		path = strings.TrimSpace(path)
		if strings.HasPrefix(path, prefix) {
			continue
		}
		newPath := fmt.Sprintf("%s%s", prefix, strings.TrimPrefix(path, "/"))
		d.openAPI3Doc.Paths.Delete(path)
		d.openAPI3Doc.Paths.Set(newPath, item)
	}
	return nil
}

func (d *DocLoader) Marshal() ([]byte, error) {
	result, err := d.openAPI3Doc.MarshalYAML()
	if err != nil {
		return nil, err
	}
	return yaml.Marshal(result)
}
