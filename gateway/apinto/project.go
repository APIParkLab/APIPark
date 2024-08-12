package apinto

import (
	"context"
	"errors"
	"fmt"
	"github.com/APIParkLab/APIPark/gateway/apinto/driver"
	
	"github.com/eolinker/eosc/process-admin/cmd/proto"
	
	"github.com/eolinker/go-common/encoding"
	
	"github.com/eolinker/go-common/utils"
	
	"github.com/APIParkLab/APIPark/gateway/apinto/entity"
	
	"github.com/APIParkLab/APIPark/gateway"
	admin_client "github.com/eolinker/eosc/process-admin/client"
)

var _ gateway.IProjectClient = &ProjectClient{}

func init() {
	driver.RegisterApiPublishHandler(func(ctx context.Context, client admin_client.Client, api *entity.Router, extends map[string]any) error {
		return client.Set(ctx, api.ID, api)
		
	})
}

func NewProjectClient(client admin_client.Client) *ProjectClient {
	return &ProjectClient{client: client}
}

type ProjectClient struct {
	client admin_client.Client
}

func (p *ProjectClient) Online(ctx context.Context, projects ...*gateway.ProjectRelease) error {
	err := p.client.Begin(ctx)
	if err != nil {
		return err
	}
	for _, project := range projects {
		err = p.online(ctx, project)
		if err != nil {
			p.client.Rollback(ctx)
			return err
		}
	}
	p.client.Commit(ctx)
	return nil
}

func (p *ProjectClient) online(ctx context.Context, project *gateway.ProjectRelease) error {
	if project == nil {
		return nil
	}
	if project.Upstream == nil {
		return fmt.Errorf("upstream is nil")
	}
	matches := map[string]string{
		"project": project.Id,
	}
	
	upstreams, err := matchLabels[entity.Service](ctx, p.client, ProfessionService, matches)
	if err != nil {
		if !errors.Is(err, proto.Nil) {
			return err
		}
	}
	upstreamMap := utils.SliceToMap(upstreams, func(t *entity.Service) string {
		return t.ID
	})
	
	upstreamId := genWorkerID(project.Upstream.ID, ProfessionService)
	err = p.client.Set(ctx, upstreamId, entity.ToService(project.Upstream, project.Version, matches))
	if err != nil {
		return err
	}
	delete(upstreamMap, upstreamId)
	routers, err := matchLabels[entity.Router](ctx, p.client, ProfessionRouter, matches)
	if err != nil {
		if !errors.Is(err, proto.Nil) {
			return err
		}
	}
	routerMap := utils.SliceToMap(routers, func(t *entity.Router) string {
		return t.ID
	})
	
	for _, api := range project.Apis {
		id := genWorkerID(api.ID, ProfessionRouter)
		if api.Labels == nil {
			api.Labels = make(map[string]string)
		}
		api.Service = upstreamId
		api.Labels["provider"] = project.Id
		routerInfo := entity.ToRouter(api, project.Version, matches)
		
		err = driver.ApiPublish(ctx, p.client, routerInfo, api.Extends)
		if err != nil {
			return err
		}
		delete(routerMap, id)
	}
	// 删除多余配置
	for _, v := range routerMap {
		err := driver.ApiDelete(ctx, p.client, v)
		if err != nil {
			return err
		}
		err = p.client.Del(ctx, v.ID)
		if err != nil {
			return err
		}
		
	}
	for id := range upstreamMap {
		err = p.client.Del(ctx, id)
		if err != nil {
			return err
		}
	}
	
	return nil
}

func (p *ProjectClient) Offline(ctx context.Context, projects ...*gateway.ProjectRelease) error {
	err := p.client.Begin(ctx)
	if err != nil {
		return err
	}
	for _, project := range projects {
		err = p.delete(ctx, project.Id)
		if err != nil {
			p.client.Rollback(ctx)
			return err
		}
	}
	
	return p.client.Commit(ctx)
}

func (p *ProjectClient) delete(ctx context.Context, id string) error {
	err := p.deleteByLabels(ctx, ProfessionRouter, map[string]string{"project": id})
	if err != nil {
		return err
	}
	return p.deleteByLabels(ctx, ProfessionService, map[string]string{"project": id})
}
func matchLabels[T any](ctx context.Context, client admin_client.Client, profession string, labels map[string]string, t ...[]*T) ([]*T, error) {
	list, err := client.MatchLabels(ctx, profession, labels)
	if err != nil {
		return nil, err
	}
	var items = make([]*T, 0, len(list))
	for _, item := range list {
		var basicItem = new(T)
		err = item.Scan(encoding.Json(basicItem))
		if err != nil {
			return nil, err
		}
		items = append(items, basicItem)
	}
	return items, nil
}
func (p *ProjectClient) matchLabels(ctx context.Context, profession string, labels map[string]string) ([]*entity.BasicInfo, error) {
	return matchLabels[entity.BasicInfo](ctx, p.client, profession, labels)
}

func (p *ProjectClient) deleteByLabels(ctx context.Context, profession string, labels map[string]string) error {
	list, err := p.client.MatchLabels(ctx, profession, labels)
	if err != nil {
		return err
	}
	for _, item := range list {
		var basicItem entity.BasicInfo
		err = item.Scan(encoding.Json[entity.BasicInfo](&basicItem))
		if err != nil {
			return err
		}
		err = p.client.Del(ctx, basicItem.ID)
		if err != nil {
			return err
		}
	}
	return nil
}
