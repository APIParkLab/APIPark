package apinto

import (
	"context"
	"errors"

	"github.com/eolinker/go-common/encoding"

	"github.com/eolinker/eosc/process-admin/cmd/proto"

	"github.com/APIParkLab/APIPark/gateway/apinto/entity"

	"github.com/APIParkLab/APIPark/gateway"
	admin_client "github.com/eolinker/eosc/process-admin/client"
)

var _ gateway.IDynamicClient = &DynamicClient{}

func NewDynamicClient(client admin_client.Client, resource string) (*DynamicClient, error) {
	cfg, has := gateway.GetDynamicResourceDriver(resource)
	if !has {
		return nil, errors.New("resource not found")
	}

	return &DynamicClient{client: client, profession: cfg.Profession, driver: cfg.Driver}, nil
}

type DynamicClient struct {
	profession string
	driver     string
	client     admin_client.Client
}

func (d *DynamicClient) Version(ctx context.Context, resourceId string) (string, error) {
	worker, err := d.client.Get(ctx, genWorkerID(resourceId, d.profession))
	if err != nil {
		return "", err
	}
	if len(worker) == 0 {
		return "", nil
	}
	var item entity.BasicInfo
	err = worker.Scan(encoding.Json[entity.BasicInfo](&item))
	if err != nil {
		return "", err
	}
	return item.Version, nil
}

func (d *DynamicClient) Versions(ctx context.Context, matchLabels map[string]string) (map[string]string, error) {
	workers, err := d.client.MatchLabels(ctx, d.profession, matchLabels)
	if err != nil {
		if errors.Is(err, proto.Nil) {
			return nil, nil
		}
		return nil, err
	}
	versions := make(map[string]string)
	for _, worker := range workers {
		var item entity.BasicInfo
		err = worker.Scan(encoding.Json[entity.BasicInfo](&item))
		if err != nil {
			return nil, err
		}
		versions[item.Name] = item.Version
	}
	return versions, nil
}

func (d *DynamicClient) Online(ctx context.Context, resources ...*gateway.DynamicRelease) error {
	err := d.client.Begin(ctx)
	if err != nil {
		return err
	}
	for _, r := range resources {
		id := genWorkerID(r.ID, d.profession)
		worker := entity.NewWorkerItem[map[string]interface{}](&entity.BasicInfo{
			ID:          id,
			Name:        r.ID,
			Description: r.Description,
			Driver:      d.driver,
			Version:     r.Version,
			Matches:     r.MatchLabels,
		}, &r.Attr)
		err = d.client.Set(ctx, id, worker)
		if err != nil {
			d.client.Rollback(ctx)
			return err
		}
	}
	return d.client.Commit(ctx)
}

func (d *DynamicClient) Offline(ctx context.Context, resources ...*gateway.DynamicRelease) error {
	err := d.client.Begin(ctx)
	if err != nil {
		return err
	}
	for _, r := range resources {
		err = d.client.Del(ctx, genWorkerID(r.ID, d.profession))
		if err != nil {
			d.client.Rollback(ctx)
			return err
		}
	}
	return d.client.Commit(ctx)
}
