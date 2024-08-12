package gateway

import (
	"context"
)

var (
	initHandlers []InitHandler
)

func RegisterInitHandler(handle InitHandler) {
	initHandlers = append(initHandlers, handle)
}
func RegisterInitHandleFunc(handleFunc InitHandleFunc) {
	initHandlers = append(initHandlers, handleFunc)
}

type InitHandleFunc func(ctx context.Context, clusterId string, client IClientDriver) error

func (f InitHandleFunc) Init(ctx context.Context, clusterId string, client IClientDriver) error {
	return f(ctx, clusterId, client)
}

type InitHandler interface {
	Init(ctx context.Context, clusterId string, client IClientDriver) error
}

func InitGateway(ctx context.Context, clusterId string, client IClientDriver) (err error) {
	for _, h := range initHandlers {
		err = h.Init(ctx, clusterId, client)
		if err != nil {
			return
		}
	}
	return
}
