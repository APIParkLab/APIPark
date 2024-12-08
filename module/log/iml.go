package log

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	log_driver "github.com/APIParkLab/APIPark/log-driver"

	"github.com/APIParkLab/APIPark/gateway"

	"github.com/eolinker/go-common/store"

	"gorm.io/gorm"

	"github.com/APIParkLab/APIPark/service/cluster"

	"github.com/eolinker/go-common/auto"

	log_dto "github.com/APIParkLab/APIPark/module/log/dto"
	"github.com/APIParkLab/APIPark/service/log"
)

var _ ILogModule = (*imlLogModule)(nil)

type imlLogModule struct {
	service        log.ILogService         `autowired:""`
	clusterService cluster.IClusterService `autowired:""`
	transaction    store.ITransaction      `autowired:""`
}

var labels = map[string]string{
	"cluster": "$cluster",
	"node":    "$node",
}
var logFormatter = map[string]interface{}{
	"fields": []string{
		"$msec",
		"$service",
		"$provider",
		"$scheme as request_scheme",
		"$url as request_uri",
		"$host as request_host",
		"$header as request_header",
		"$remote_addr",
		"$request_body",
		"$proxy_body",
		"$proxy_method",
		"$proxy_scheme",
		"$proxy_uri",
		"$api",
		"$proxy_host",
		"$proxy_header",
		"$proxy_addr",
		"$response_headers",
		"$status",
		"$content_type",
		"$proxy_status",
		"$request_time",
		"$response_time",
		"$node",
		"$cluster",
		"$application",
		"$src_ip",
		"$block_name as strategy",
		"$request_id",
		"$request_method",
		"$authorization",
		"$response_body",
		"$proxy_response_body",
	},
}

func (i *imlLogModule) Save(ctx context.Context, driver string, input *log_dto.Save) error {
	factory, has := log_driver.GetFactory(driver)
	if !has {
		return errors.New("driver not found")
	}
	input.Cluster = cluster.DefaultClusterID
	var cfg *string
	if input.Config != nil {
		data, _ := json.Marshal(input.Config)
		tmp := string(data)
		cfg = &tmp
	}
	return i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		err := i.service.UpdateLogSource(ctx, driver, &log.Save{
			ID:      input.ID,
			Cluster: &input.Cluster,
			Config:  cfg,
		})
		if err != nil {
			return err
		}
		info, err := i.service.GetLogSource(ctx, driver)
		if err != nil {
			return err
		}
		d, c, err := factory.Create(info.Config)
		if err != nil {
			return err
		}

		client, err := i.clusterService.GatewayClient(ctx, input.Cluster)
		if err != nil {
			return err
		}
		dynamicClient, err := client.Dynamic(driver)
		if err != nil {
			return err
		}
		attr := make(map[string]interface{})
		attr["driver"] = driver
		attr["formatter"] = logFormatter
		attr["labels"] = labels
		attr["method"] = "POST"
		for k, v := range c {
			attr[k] = v
		}
		err = dynamicClient.Online(ctx, &gateway.DynamicRelease{
			BasicItem: &gateway.BasicItem{
				ID:          driver,
				Description: "collect access log",
				Version:     time.Now().Format("20060102150405"),
				Resource:    gateway.ProfessionOutput,
			},
			Attr: attr,
		})
		if err != nil {
			return err
		}
		log_driver.SetDriver(driver, d)
		return nil
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
