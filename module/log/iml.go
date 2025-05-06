package log

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/eolinker/go-common/server"

	log_driver "github.com/APIParkLab/APIPark/log-driver"
	"github.com/eolinker/go-common/register"
	"github.com/eolinker/go-common/utils"

	"github.com/APIParkLab/APIPark/gateway"

	"github.com/eolinker/go-common/store"

	"gorm.io/gorm"

	"github.com/APIParkLab/APIPark/service/cluster"

	log_dto "github.com/APIParkLab/APIPark/module/log/dto"
	"github.com/APIParkLab/APIPark/service/log"
	eosc_log "github.com/eolinker/eosc/log"
	log_print "github.com/eolinker/eosc/log"
	"github.com/eolinker/go-common/auto"
)

var _ ILogModule = (*imlLogModule)(nil)

type imlLogModule struct {
	service        log.ILogService         `autowired:""`
	clusterService cluster.IClusterService `autowired:""`

	transaction store.ITransaction `autowired:""`
	//scheduleCtx    context.Context
	scheduleCancel context.CancelFunc
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
		"$response_header",
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
		"$ai_provider",
		"$ai_model",
		"$ai_model_input_token",
		"$ai_model_output_token",
		"$ai_model_total_token",
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
		err := i.service.UpdateLogSource(txCtx, driver, &log.Save{
			ID:      input.ID,
			Cluster: &input.Cluster,
			Config:  cfg,
		})
		if err != nil {
			return err
		}
		info, err := i.service.GetLogSource(txCtx, driver)
		if err != nil {
			return err
		}
		d, c, err := factory.Create(info.Config)
		if err != nil {
			return err
		}

		client, err := i.clusterService.GatewayClient(txCtx, input.Cluster)
		if err != nil {
			return err
		}
		defer client.Close(txCtx)
		dynamicClient, err := client.Dynamic(driver)
		if err != nil {
			return err
		}
		attr := make(map[string]interface{})
		attr["driver"] = driver
		attr["formatter"] = logFormatter
		attr["labels"] = labels
		attr["method"] = "POST"
		attr["scopes"] = []string{"access_log"}
		attr["type"] = "json"
		for k, v := range c {
			attr[k] = v
		}
		err = dynamicClient.Online(txCtx, &gateway.DynamicRelease{
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
		newCtx, cancel := context.WithCancel(context.Background())
		newCtx = utils.SetUserId(newCtx, "admin")
		i.scheduleCancel()
		i.scheduleCancel = cancel
		i.scheduleUpdateLogRecord(newCtx)
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

func (i *imlLogModule) OnInit() {
	register.Handle(func(v server.Server) {
		ctx, cancel := context.WithCancel(context.Background())
		ctx = utils.SetUserId(ctx, "admin")
		//i.scheduleCtx = ctx
		i.scheduleCancel = cancel
		i.scheduleUpdateLogRecord(ctx)

	})
}

func (i *imlLogModule) initGateway(ctx context.Context, clusterId string, clientDriver gateway.IClientDriver) error {
	drivers := log_driver.Drivers()
	if len(drivers) < 1 {
		return nil
	}

	for _, driver := range drivers {
		factory, has := log_driver.GetFactory(driver)
		if !has {
			log_print.Errorf("driver %s not found", driver)
			continue
		}
		info, err := i.service.GetLogSource(ctx, driver)
		if err != nil {
			log_print.Errorf("get log source %s error: %s", driver, err)
			continue
		}
		d, c, err := factory.Create(info.Config)
		if err != nil {
			log_print.Errorf("create driver %s error: %s,config: %s", driver, err, info.Config)
			continue
		}
		log_driver.SetDriver(driver, d)
		dynamicClient, err := clientDriver.Dynamic(driver)
		if err != nil {
			log_print.Errorf("get dynamic client %s error: %s", driver, err)
			continue
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
			log_print.Errorf("online driver %s error: %s", driver, err)
			continue
		}

	}

	return nil
}

const (
	oneSecond = 1
	oneMinute = 60
	oneHour   = 60 * oneMinute
	oneDay    = 24 * oneHour
)

// 定时更新历史记录
func (i *imlLogModule) scheduleUpdateLogRecord(ctx context.Context) {
	driver, has := log_driver.GetDriver("loki")
	if !has {
		eosc_log.Error("driver loki not found")
		return
	}
	info, err := i.service.GetLogSource(ctx, "loki")
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			eosc_log.Errorf("get log source loki error: %s", err)
			return
		}
		return
	}
	now := time.Now()
	before90Days := now.Add(-7 * 24 * time.Hour)
	beginTime := before90Days
	if info.LastPullTime.After(before90Days) {
		before90Days = info.LastPullTime
	}
	pauseTime := now
	historyFinish := false
	go func() {
		eosc_log.Infof("start update history log record,start time: %s", beginTime.Format("2006-01-02 15:04:05"))
		ticket := time.NewTicker(1 * time.Minute)
		defer ticket.Stop()
		for {
			now = time.Now()
			select {
			case <-ctx.Done():
				return
			case <-ticket.C:
				switch {
				case now.Sub(beginTime) > oneDay:
					endTime := beginTime.Add(oneDay)
					err = i.updateLogRecord(ctx, driver, beginTime, endTime)
					if err != nil {
						eosc_log.Errorf("update log record error: %s", err)
						continue
					}
					err = i.service.UpdateLogSource(ctx, "loki", &log.Save{
						LastPullTime: &endTime,
					})
					if err != nil {
						eosc_log.Errorf("update log source error: %s", err)
						continue
					}
					beginTime = endTime
				case now.Sub(pauseTime) <= oneDay:
					endTime := pauseTime
					err = i.updateLogRecord(ctx, driver, beginTime, endTime)
					if err != nil {
						eosc_log.Errorf("update log record error: %s", err)
						historyFinish = true
						return
					}
					historyFinish = true
					err = i.service.UpdateLogSource(ctx, "loki", &log.Save{
						LastPullTime: &endTime,
					})
					if err != nil {
						eosc_log.Errorf("update log source error: %s", err)
						return
					}
					eosc_log.Infof("update log record finish")
					return
				}
			}
		}
	}()
	go func() {
		eosc_log.Infof("start update running log record,start time: %s", pauseTime.Format("2006-01-02 15:04:05"))
		ticket := time.NewTicker(10 * time.Second)
		defer ticket.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticket.C:
				end := time.Now()
				start := end.Add(-1 * time.Minute)
				err = i.updateLogRecord(ctx, driver, start, end)
				if err != nil {
					eosc_log.Errorf("update log record error: %s", err)
					continue
				}
				if historyFinish {
					err = i.service.UpdateLogSource(ctx, "loki", &log.Save{
						LastPullTime: &end,
					})
					if err != nil {
						eosc_log.Errorf("update log source error: %s", err)
						continue
					}
				}
			}
		}
	}()

}

func (i *imlLogModule) updateLogRecord(ctx context.Context, driver log_driver.ILogDriver, start, end time.Time) error {
	c, err := i.clusterService.Get(ctx, cluster.DefaultClusterID)
	if err != nil {
		return fmt.Errorf("cluster %s not found", cluster.DefaultClusterID)
	}
	logs, err := driver.LogRecords(c.Cluster, start, end)
	if err != nil {

		return fmt.Errorf("get log records error: %s", err)
	}
	for _, l := range logs {
		err = i.service.InsertLog(ctx, "loki", &log.InsertLog{
			ID:            l.ID,
			Driver:        "loki",
			Strategy:      l.Strategy,
			API:           l.API,
			Service:       l.Service,
			Method:        l.Method,
			Url:           l.Url,
			RemoteIP:      l.RemoteIP,
			Consumer:      l.Consumer,
			Authorization: l.Authorization,
			InputToken:    l.InputToken,
			OutputToken:   l.OutputToken,
			TotalToken:    l.TotalToken,
			AIProvider:    l.AIProvider,
			AIModel:       l.AIModel,
			StatusCode:    l.StatusCode,
			ResponseTime:  l.ResponseTime,
			Traffic:       l.Traffic,
			RecordTime:    l.RecordTime,
		})
		if err != nil {
			eosc_log.Errorf("insert log record error: %s,log id: %s", err, l.ID)
			continue
		}
	}
	return nil
}
