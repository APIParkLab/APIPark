package apinto

import (
	"context"
	"strings"

	"github.com/APIParkLab/APIPark/gateway/apinto/auth"

	"github.com/APIParkLab/APIPark/gateway/apinto/entity"

	"github.com/APIParkLab/APIPark/gateway"
	admin_client "github.com/eolinker/eosc/process-admin/client"
)

var _ gateway.IApplicationClient = &ApplicationClient{}

func NewApplicationClient(client admin_client.Client) *ApplicationClient {
	return &ApplicationClient{client: client}
}

type ApplicationClient struct {
	client admin_client.Client
}

func (a *ApplicationClient) Online(ctx context.Context, applications ...*gateway.ApplicationRelease) error {
	err := a.client.Begin(ctx)
	if err != nil {
		return err
	}
	for _, app := range applications {
		err = a.client.Set(ctx, genWorkerID(app.ID, gateway.ProfessionApplication), a.toApinto(app))
		if err != nil {
			a.client.Rollback(ctx)
			return err
		}
	}
	return a.client.Commit(ctx)
}

func (a *ApplicationClient) Offline(ctx context.Context, applications ...*gateway.ApplicationRelease) error {
	err := a.client.Begin(ctx)
	if err != nil {
		return err
	}
	for _, app := range applications {
		err = a.client.Del(ctx, genWorkerID(app.ID, gateway.ProfessionApplication))
		if err != nil {
			a.client.Rollback(ctx)
			return err
		}
	}
	return a.client.Commit(ctx)
}

func (a *ApplicationClient) toApinto(app *gateway.ApplicationRelease) interface{} {
	auths := make([]*entity.Authorization, 0, len(app.Authorizations))
	for _, info := range app.Authorizations {
		driver, has := auth.Get(info.Type)
		if !has {
			continue
		}
		auths = append(auths, &entity.Authorization{
			Type:      info.Type,
			Position:  strings.ToLower(info.Position),
			TokenName: info.TokenName,
			Config:    driver.ToConfig(info.Config),
			Users: []*entity.AuthUser{
				{
					Expire:         info.Expire,
					Pattern:        driver.ToPattern(info.Config),
					HideCredential: info.HideCredential,
					Labels:         info.Label,
				},
			},
			Labels: info.Label,
		})
	}
	labels := make(map[string]string)
	if app.Labels != nil {
		labels = app.Labels
	}
	return &entity.Application{
		BasicInfo: &entity.BasicInfo{
			ID:          genWorkerID(app.ID, gateway.ProfessionApplication),
			Name:        app.ID,
			Description: app.Description,
			Driver:      "app",
			Version:     app.Version,
			Matches:     nil,
		},
		Labels:         labels,
		Authorizations: auths,
	}
}
