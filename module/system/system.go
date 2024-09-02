package system

import "context"

type IExportModule[T any] interface {
	ExportAll(ctx context.Context) ([]*T, error)
}
