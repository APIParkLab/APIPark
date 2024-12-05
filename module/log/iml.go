package log

import (
	"context"
	"encoding/json"
	"errors"

	"gorm.io/gorm"

	"github.com/APIParkLab/APIPark/service/cluster"

	"github.com/eolinker/go-common/auto"

	log_dto "github.com/APIParkLab/APIPark/module/log/dto"
	"github.com/APIParkLab/APIPark/service/log"
)

var _ ILogModule = (*imlLogModule)(nil)

type imlLogModule struct {
	service log.ILogService `autowired:""`
}

func (i *imlLogModule) Save(ctx context.Context, driver string, input *log_dto.Save) error {
	input.Cluster = cluster.DefaultClusterID
	var cfg *string
	if input.Config != nil {
		data, _ := json.Marshal(input.Config)
		tmp := string(data)
		cfg = &tmp
	}
	return i.service.UpdateLogSource(ctx, driver, &log.Save{
		ID:      input.ID,
		Cluster: &input.Cluster,
		Config:  cfg,
	})
}

func (i *imlLogModule) Get(ctx context.Context, driver string) (*log_dto.LogSource, error) {
	info, err := i.service.GetLogSource(ctx, driver)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return nil, nil
	}
	cfg := make(map[string]interface{})
	if info.Config != "" {
		err = json.Unmarshal([]byte(info.Config), &cfg)
		if err != nil {
			return nil, err
		}
	}
	return &log_dto.LogSource{
		ID:       info.ID,
		Config:   cfg,
		Creator:  auto.UUID(info.Creator),
		Updater:  auto.UUID(info.Updater),
		CreateAt: auto.TimeLabel(info.CreateAt),
		UpdateAt: auto.TimeLabel(info.UpdateAt),
	}, nil
}
