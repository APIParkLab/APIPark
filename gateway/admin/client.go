package admin

import "context"
 
type IApintoAdmin interface {
	Ping(ctx context.Context) error
	Info(ctx context.Context) (*Info, error)
	Version(ctx context.Context) (*Version, error)
}
