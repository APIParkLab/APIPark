package apinto

import (
	"context"
	"fmt"
	
	"github.com/APIParkLab/APIPark/gateway"
	
	admin_client "github.com/eolinker/eosc/process-admin/client"
)

var _ gateway.ISubscribeClient = &SubscribeClient{}

type SubscribeClient struct {
	client admin_client.Client
}

const KeySubscribeService = "subscription_service"

func (s *SubscribeClient) Online(ctx context.Context, resources ...*gateway.SubscribeRelease) error {
	s.client.Begin(ctx)
	var err error
	for _, r := range resources {
		err = s.client.HSet(ctx, fmt.Sprintf("%s:%s", KeySubscribeService, r.Application), r.Service, r.Expired)
		if err != nil {
			s.client.Rollback(ctx)
			return err
		}
	}
	return s.client.Commit(ctx)
}

func (s *SubscribeClient) Offline(ctx context.Context, resources ...*gateway.SubscribeRelease) error {
	s.client.Begin(ctx)
	var err error
	for _, r := range resources {
		err = s.client.HDel(ctx, fmt.Sprintf("%s:%s", KeySubscribeService, r.Application), r.Service)
		if err != nil {
			s.client.Rollback(ctx)
			return err
		}
	}
	return s.client.Commit(ctx)
}

func NewSubscribeClient(client admin_client.Client) *SubscribeClient {
	return &SubscribeClient{client: client}
}
