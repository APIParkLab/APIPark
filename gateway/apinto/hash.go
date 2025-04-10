package apinto

import (
	"context"

	"github.com/APIParkLab/APIPark/gateway"
	admin_client "github.com/eolinker/eosc/process-admin/client"
)

var _ gateway.IHashClient = &HashClient{}

type HashClient struct {
	client admin_client.Client
}

func (s *HashClient) Online(ctx context.Context, resources ...*gateway.HashRelease) error {
	s.client.Begin(ctx)
	for _, r := range resources {
		// 先删除所有，再set
		err := s.client.HDelAll(ctx, r.HashKey)
		if err != nil {
			s.client.Rollback(ctx)
			return err
		}
		for key, value := range r.HashMap {
			err := s.client.HSet(ctx, r.HashKey, key, value)
			if err != nil {
				s.client.Rollback(ctx)
				return err
			}
		}
	}
	return s.client.Commit(ctx)
}

func (s *HashClient) Offline(ctx context.Context, resources ...*gateway.HashRelease) error {
	s.client.Begin(ctx)
	for _, r := range resources {
		if len(r.HashMap) == 0 {
			err := s.client.HDelAll(ctx, r.HashKey)
			if err != nil {
				s.client.Rollback(ctx)
				return err
			}
		}
		for key, _ := range r.HashMap {
			err := s.client.HDel(ctx, r.HashKey, key)
			if err != nil {
				s.client.Rollback(ctx)
				return err
			}
		}
	}
	return s.client.Commit(ctx)
}

func NewHashClient(client admin_client.Client) *HashClient {
	return &HashClient{client: client}
}
