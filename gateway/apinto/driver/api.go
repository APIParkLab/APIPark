package driver

import (
	"context"
	"github.com/APIParkLab/APIPark/gateway/apinto/entity"
	admin_client "github.com/eolinker/eosc/process-admin/client"
)

var (
	apiPublishHandlers []ApiPublishHandler
	apiDeleteHandlers  []ApiDeleteHandler
)

func RegisterApiPublishHandler(handler ApiPublishHandler) {
	apiPublishHandlers = append(apiPublishHandlers, handler)
}
func RegisterApiDeleteHandler(handler ApiDeleteHandler) {
	apiDeleteHandlers = append(apiDeleteHandlers, handler)
}

type ApiPublishHandler func(ctx context.Context, client admin_client.Client, api *entity.Router, extends map[string]any) error

type ApiDeleteHandler func(ctx context.Context, client admin_client.Client, api *entity.Router) error

func ApiPublish(ctx context.Context, client admin_client.Client, api *entity.Router, extends map[string]any) error {
	for _, handler := range apiPublishHandlers {
		if err := handler(ctx, client, api, extends); err != nil {
			return err
		}
	}
	return nil
}

func ApiDelete(ctx context.Context, client admin_client.Client, api *entity.Router) error {
	for _, handler := range apiDeleteHandlers {
		if err := handler(ctx, client, api); err != nil {
			return err
		}
	}
	return nil
}
