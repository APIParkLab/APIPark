package apinto

import (
	"context"
	"fmt"
	
	"github.com/APIParkLab/APIPark/gateway"
	admin_client "github.com/eolinker/eosc/process-admin/client"
)

var _ gateway.IServiceClient = &ServiceClient{}

type ServiceClient struct {
	client admin_client.Client
}

const KeyServiceOfApi = "service_of_api"

func (s *ServiceClient) Online(ctx context.Context, resources ...*gateway.ServiceRelease) error {
	s.client.Begin(ctx)
	for _, r := range resources {
		for _, api := range r.Apis {
			err := s.client.HSet(ctx, fmt.Sprintf("%s:%s", KeyServiceOfApi, api), r.ID, "0")
			if err != nil {
				s.client.Rollback(ctx)
				return err
			}
		}
	}
	return s.client.Commit(ctx)
}

func (s *ServiceClient) Offline(ctx context.Context, resources ...*gateway.ServiceRelease) error {
	s.client.Begin(ctx)
	for _, r := range resources {
		for _, api := range r.Apis {
			err := s.client.HDel(ctx, fmt.Sprintf("%s:%s", KeyServiceOfApi, api), r.ID)
			if err != nil {
				s.client.Rollback(ctx)
				return err
			}
		}
	}
	return s.client.Commit(ctx)
}

func NewServiceClient(client admin_client.Client) *ServiceClient {
	return &ServiceClient{client: client}
}
