package apinto

import (
	"context"

	"github.com/eolinker/eosc"

	"github.com/APIParkLab/APIPark/gateway"
	admin_client "github.com/eolinker/eosc/process-admin/client"
)

var _ gateway.IStrategyClient = &StrategyClient{}

type StrategyClient struct {
	client admin_client.Client
}

func (s *StrategyClient) Online(ctx context.Context, resources ...*eosc.Base[gateway.StrategyRelease]) error {
	s.client.Begin(ctx)
	for _, r := range resources {
		if r.Config.IsDelete {
			s.client.Del(ctx, genWorkerID(r.Config.Name, gateway.ProfessionStrategy))
			continue
		}
		err := s.client.Set(ctx, genWorkerID(r.Config.Name, gateway.ProfessionStrategy), r)
		if err != nil {
			s.client.Rollback(ctx)
			return err
		}
	}
	return s.client.Commit(ctx)
}

func (s *StrategyClient) Offline(ctx context.Context, resources ...*eosc.Base[gateway.StrategyRelease]) error {
	s.client.Begin(ctx)
	for _, r := range resources {
		err := s.client.Del(ctx, genWorkerID(r.Config.Name, gateway.ProfessionStrategy))
		if err != nil {
			s.client.Rollback(ctx)
			return err
		}
	}
	return s.client.Commit(ctx)
}

func NewStrategyClient(client admin_client.Client) *StrategyClient {
	return &StrategyClient{client: client}
}
