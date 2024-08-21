package monitor

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/APIParkLab/APIPark/gateway"
	"github.com/eolinker/eosc/log"
	"github.com/eolinker/go-common/auto"
	"github.com/eolinker/go-common/store"
	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"
	"sort"
	"time"

	"github.com/APIParkLab/APIPark/service/service"

	"github.com/APIParkLab/APIPark/service/subscribe"

	"github.com/APIParkLab/APIPark/service/cluster"

	"github.com/APIParkLab/APIPark/module/monitor/driver"

	"github.com/APIParkLab/APIPark/service/api"

	"github.com/APIParkLab/APIPark/service/monitor"

	monitor_dto "github.com/APIParkLab/APIPark/module/monitor/dto"
)

var (
	_ IMonitorStatisticModule = (*imlMonitorStatisticModule)(nil)
)

type imlMonitorStatisticModule struct {
	monitorStatisticCacheService monitor.IMonitorStatisticsCache `autowired:""`
	subscribeService             subscribe.ISubscribeService     `autowired:""`
	serviceService               service.IServiceService         `autowired:""`
	clusterService               cluster.IClusterService         `autowired:""`
	monitorService               monitor.IMonitorService         `autowired:""`
	apiService                   api.IAPIService                 `autowired:""`
}

func (i *imlMonitorStatisticModule) MessageTrend(ctx context.Context, input *monitor_dto.CommonInput) (*monitor_dto.MonMessageTrend, string, error) {
	clusterId := cluster.DefaultClusterID
	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, "", err
	}
	executor, err := i.getExecutor(ctx, clusterId)
	if err != nil {
		return nil, "", err
	}
	result, timeInterval, err := executor.MessageTrend(ctx, formatTimeByMinute(input.Start), formatTimeByMinute(input.End), wheres)
	if err != nil {
		return nil, "", err
	}
	return monitor_dto.ToMonMessageTrend(result), timeInterval, nil
}

func (i *imlMonitorStatisticModule) InvokeTrend(ctx context.Context, input *monitor_dto.CommonInput) (*monitor_dto.MonInvokeCountTrend, string, error) {
	clusterId := cluster.DefaultClusterID
	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, "", err
	}
	executor, err := i.getExecutor(ctx, clusterId)
	if err != nil {
		return nil, "", err
	}
	result, timeInterval, err := executor.InvokeTrend(ctx, formatTimeByMinute(input.Start), formatTimeByMinute(input.End), wheres)
	if err != nil {
		return nil, "", err
	}
	return monitor_dto.ToMonInvokeCountTrend(result), timeInterval, nil
}

func (i *imlMonitorStatisticModule) genCommonWheres(ctx context.Context, clusterIds ...string) ([]monitor.MonWhereItem, error) {

	clusters, err := i.clusterService.List(ctx, clusterIds...)
	if err != nil {
		return nil, err
	}
	clusterIds = utils.SliceToSlice(clusters, func(item *cluster.Cluster) string {
		return item.Uuid
	})

	wheres := make([]monitor.MonWhereItem, 0, 1)

	wheres = append(wheres, monitor.MonWhereItem{
		Key:       "cluster",
		Operation: "=",
		Values:    clusterIds,
	})

	return wheres, nil
}

func (i *imlMonitorStatisticModule) statistics(ctx context.Context, clusterId string, groupBy string, start, end time.Time, wheres []monitor.MonWhereItem, limit int) (map[string]monitor.MonCommonData, error) {
	statisticMap, _ := i.monitorStatisticCacheService.GetStatisticsCache(ctx, clusterId, start, end, groupBy, wheres, limit)
	if len(statisticMap) > 0 {
		return statisticMap, nil
	}

	executor, err := i.getExecutor(ctx, clusterId)
	if err != nil {
		return nil, err
	}

	result, err := executor.CommonStatistics(ctx, start, end, groupBy, limit, wheres)
	if err != nil {
		return nil, err
	}
	i.monitorStatisticCacheService.SetStatisticsCache(ctx, clusterId, start, end, groupBy, wheres, limit, result)
	return result, nil
}

func (i *imlMonitorStatisticModule) TopAPIStatistics(ctx context.Context, limit int, input *monitor_dto.CommonInput) ([]*monitor_dto.ApiStatisticItem, error) {
	clusterId := cluster.DefaultClusterID
	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, err
	}

	statisticMap, err := i.statistics(ctx, clusterId, "api", formatTimeByMinute(input.Start), formatTimeByMinute(input.End), wheres, limit)
	if err != nil {
		return nil, err
	}

	uuids := utils.MapToSlice(statisticMap, func(key string, value monitor.MonCommonData) string {
		return value.ID
	})
	apis, err := i.apiService.ListInfo(ctx, uuids...)
	if err != nil {
		return nil, err
	}
	apiMap := utils.SliceToMap(apis, func(t *api.Info) string {
		return t.UUID
	})
	result := make([]*monitor_dto.ApiStatisticItem, 0, len(statisticMap))
	for key, item := range statisticMap {
		statisticItem := &monitor_dto.ApiStatisticItem{
			ApiStatisticBasicItem: &monitor_dto.ApiStatisticBasicItem{
				Id:            key,
				MonCommonData: monitor_dto.ToMonCommonData(item),
			},
		}
		if a, ok := apiMap[item.ID]; ok {
			statisticItem.Name = a.Name
			statisticItem.Path = a.Path
			statisticItem.Service = auto.UUID(a.Service)
		} else {
			statisticItem.IsRed = true
			if key == "-" {
				statisticItem.Name = "无API"
			} else {
				statisticItem.Name = fmt.Sprintf("未知API-%s", key)
			}
		}
		result = append(result, statisticItem)
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].RequestTotal > result[j].RequestTotal
	})
	return result, nil

}

func (i *imlMonitorStatisticModule) TopSubscriberStatistics(ctx context.Context, limit int, input *monitor_dto.CommonInput) ([]*monitor_dto.ProjectStatisticItem, error) {
	clusterId := cluster.DefaultClusterID
	_, err := i.clusterService.Get(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	return i.topProjectStatistics(ctx, clusterId, "app", input, limit)
}

func (i *imlMonitorStatisticModule) TopProviderStatistics(ctx context.Context, limit int, input *monitor_dto.CommonInput) ([]*monitor_dto.ProjectStatisticItem, error) {
	clusterId := cluster.DefaultClusterID
	_, err := i.clusterService.Get(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	return i.topProjectStatistics(ctx, clusterId, "provider", input, limit)
}

func (i *imlMonitorStatisticModule) topProjectStatistics(ctx context.Context, partitionId string, groupBy string, input *monitor_dto.CommonInput, limit int) ([]*monitor_dto.ProjectStatisticItem, error) {
	wheres, err := i.genCommonWheres(ctx, partitionId)
	if err != nil {
		return nil, err
	}
	statisticMap, err := i.statistics(ctx, partitionId, groupBy, formatTimeByMinute(input.Start), formatTimeByMinute(input.End), wheres, limit)
	if err != nil {
		return nil, err
	}
	var projects []*service.Service
	switch groupBy {
	case "app":
		projects, err = i.serviceService.AppList(ctx)
	case "provider":
		projects, err = i.serviceService.ServiceList(ctx)
	default:
		return nil, errors.New("invalid group by")
	}
	if err != nil {
		return nil, err
	}
	projectMap := utils.SliceToMap(projects, func(t *service.Service) string {
		return t.Id
	})

	result := make([]*monitor_dto.ProjectStatisticItem, 0, len(statisticMap))
	for key, item := range statisticMap {
		statisticItem := &monitor_dto.ProjectStatisticItem{
			ProjectStatisticBasicItem: &monitor_dto.ProjectStatisticBasicItem{
				Id:            key,
				MonCommonData: monitor_dto.ToMonCommonData(item),
			},
		}
		if a, ok := projectMap[item.ID]; ok {
			statisticItem.Name = a.Name
		} else {
			statisticItem.IsRed = true
			if key == "-" {
				statisticItem.Name = "无系统"
			} else {
				statisticItem.Name = fmt.Sprintf("未知系统-%s", key)
			}
		}
		result = append(result, statisticItem)
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].RequestTotal > result[j].RequestTotal
	})
	return result, nil
}
func (i *imlMonitorStatisticModule) getExecutor(ctx context.Context, clusterId string) (driver.IExecutor, error) {
	info, err := i.monitorService.GetByCluster(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	return driver.CreateExecutor(info.Driver, info.Config)
}

func (i *imlMonitorStatisticModule) RequestSummary(ctx context.Context, input *monitor_dto.CommonInput) (*monitor_dto.MonSummaryOutput, error) {
	clusterId := cluster.DefaultClusterID
	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	executor, err := i.getExecutor(ctx, clusterId)
	if err != nil {
		return nil, err

	}
	summary, err := executor.RequestSummary(ctx, formatTimeByMinute(input.Start), formatTimeByMinute(input.End), wheres)
	if err != nil {
		return nil, err
	}

	return monitor_dto.ToMonSummaryOutput(summary), nil
}

func (i *imlMonitorStatisticModule) ProxySummary(ctx context.Context, input *monitor_dto.CommonInput) (*monitor_dto.MonSummaryOutput, error) {
	clusterId := cluster.DefaultClusterID
	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	executor, err := i.getExecutor(ctx, clusterId)
	if err != nil {
		return nil, err

	}
	summary, err := executor.ProxySummary(ctx, formatTimeByMinute(input.Start), formatTimeByMinute(input.End), wheres)
	if err != nil {
		return nil, err
	}

	return monitor_dto.ToMonSummaryOutput(summary), nil
}

var (
	_ IMonitorConfigModule = (*imlMonitorConfig)(nil)
)

type imlMonitorConfig struct {
	clusterService cluster.IClusterService `autowired:""`
	monitorService monitor.IMonitorService `autowired:""`
	transaction    store.ITransaction      `autowired:""`
}

func (m *imlMonitorConfig) dynamicClient(ctx context.Context, clusterId string, resource string, f func(gateway.IDynamicClient) error) error {
	client, err := m.clusterService.GatewayClient(ctx, clusterId)
	if err != nil {
		return err
	}
	defer func() {
		err := client.Close(ctx)
		if err != nil {
			log.Warn("close apinto client:", err)
		}
	}()
	dynamic, err := client.Dynamic(resource)
	if err != nil {
		return err
	}
	return f(dynamic)
}

func (m *imlMonitorConfig) SaveMonitorConfig(ctx context.Context, cfg *monitor_dto.SaveMonitorConfig) (*monitor_dto.MonitorConfig, error) {
	clusterId := cluster.DefaultClusterID
	_, err := m.clusterService.Get(ctx, clusterId)
	if err != nil {
		return nil, err
	}

	data, _ := json.Marshal(cfg.Config)
	err = driver.Check(cfg.Driver, string(data))
	if err != nil {
		return nil, err
	}

	executor, err := driver.CreateExecutor(cfg.Driver, string(data))
	if err != nil {
		return nil, err
	}
	err = executor.Init(ctx)
	if err != nil {
		return nil, err
	}
	clusters, err := m.clusterService.ListByClusters(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	version := time.Now().Format("20060102150405")
	id := fmt.Sprintf("%s_influxdb", clusterId)
	for _, c := range clusters {
		err := m.dynamicClient(ctx, c.Uuid, "influxdbv2", func(client gateway.IDynamicClient) error {
			pubCfg := &gateway.DynamicRelease{
				BasicItem: &gateway.BasicItem{
					ID:          id,
					Description: "",
					Version:     version,
					MatchLabels: map[string]string{
						"module": "monitor",
					},
				},
				Attr: map[string]interface{}{
					"org":    cfg.Config["org"],
					"token":  cfg.Config["token"],
					"url":    cfg.Config["addr"],
					"bucket": "apinto",
					"scopes": []string{"monitor"},
				},
			}
			return client.Online(ctx, pubCfg)
		})
		if err != nil {
			return nil, err
		}

	}

	err = m.monitorService.Save(ctx, &monitor.SaveMonitor{
		Cluster: clusterId,
		Driver:  cfg.Driver,
		Config:  string(data),
	})
	if err != nil {
		return nil, err
	}

	return m.GetMonitorConfig(ctx)
}

func (m *imlMonitorConfig) GetMonitorConfig(ctx context.Context) (*monitor_dto.MonitorConfig, error) {
	clusterId := cluster.DefaultClusterID
	_, err := m.clusterService.Get(ctx, clusterId)
	if err != nil {
		return nil, err

	}
	info, err := m.monitorService.GetByCluster(ctx, clusterId)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return &monitor_dto.MonitorConfig{
			Driver: "influxdb-v2",
			Config: map[string]interface{}{},
		}, nil
	}
	cfg := make(map[string]interface{})
	err = json.Unmarshal([]byte(info.Config), &cfg)
	if err != nil {
		return nil, err
	}
	return &monitor_dto.MonitorConfig{
		Driver: info.Driver,
		Config: cfg,
	}, nil
	return nil, nil
}
