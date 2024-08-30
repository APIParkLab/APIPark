package api_doc

import (
	"context"
	"fmt"
	"github.com/APIParkLab/APIPark/service/universally/commit"
	"github.com/eolinker/go-common/autowire"
	"github.com/getkin/kin-openapi/openapi3"
	"reflect"
)

type IAPIDocService interface {
	// UpdateDoc 更新文档
	UpdateDoc(ctx context.Context, serviceId string, input *UpdateDoc) error
	// GetDoc 获取文档
	GetDoc(ctx context.Context, serviceId string) (*Doc, error)
	// LatestDocCommit 获取最新文档
	LatestDocCommit(ctx context.Context, serviceId string) (*commit.Commit[DocCommit], error)
	CommitDoc(ctx context.Context, serviceId string, data *DocCommit) error
}

func init() {
	autowire.Auto[IAPIDocService](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIDocService))
	})
	commit.InitCommitWithKeyService[DocCommit]("service", "api_doc")
}

var (
	loader = openapi3.NewLoader()
)

func ValidDoc(content string) error {
	doc, err := loader.LoadFromData([]byte(content))
	if err != nil {
		return fmt.Errorf("failed to load OpenAPI document: %v", err)
	}
	err = doc.Validate(loader.Context)
	if err != nil {
		return fmt.Errorf("OpenAPI document is not valid: %v", err)
	}

	return nil
}

func DocAPICount(content string) (int64, error) {
	doc, err := loader.LoadFromData([]byte(content))
	if err != nil {
		return 0, err
	}
	if doc.Paths == nil {
		return 0, nil
	}
	var count int64
	for _, item := range doc.Paths.Map() {
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
	return count, nil
}
