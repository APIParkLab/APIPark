package monitor

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"sync"
	"time"

	"github.com/APIParkLab/APIPark/common"

	"github.com/APIParkLab/APIPark/gateway"
	"github.com/eolinker/eosc/log"
	"github.com/eolinker/go-common/auto"
	"github.com/eolinker/go-common/store"
	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"

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

func (i *imlMonitorStatisticModule) genOverviewWhere(ctx context.Context, serviceId string, apiKind []string) ([]monitor.MonWhereItem, error) {
	clusterId := cluster.DefaultClusterID
	_, err := i.clusterService.Get(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	if serviceId != "" {
		wheres = append(wheres, monitor.MonWhereItem{
			Key:       "provider",
			Operation: "=",
			Values:    []string{serviceId},
		})
	}
	if len(apiKind) > 0 {
		wheres = append(wheres, monitor.MonWhereItem{
			Key:       "api_kind",
			Operation: "in",
			Values:    apiKind,
		})
	}
	return wheres, nil
}

func (i *imlMonitorStatisticModule) AIChartOverview(ctx context.Context, serviceId string, start int64, end int64) (*monitor_dto.ChartAIOverview, error) {
	wheres, err := i.genOverviewWhere(ctx, serviceId, []string{"ai"})
	if err != nil {
		return nil, err
	}
	executor, err := i.getExecutor(ctx, cluster.DefaultClusterID)
	if err != nil {
		return nil, err
	}

	_, consumerMap, err := executor.ConsumerOverview(ctx, formatTimeByMinute(start), formatTimeByMinute(end), wheres)
	if err != nil {
		return nil, err
	}
	var wg sync.WaitGroup
	wg.Add(3)
	errChan := make(chan error, 3)
	result := new(monitor_dto.ChartAIOverview)
	go func() {
		defer wg.Done()
		date, summary, items, err := executor.RequestOverview(ctx, formatTimeByMinute(start), formatTimeByMinute(end), wheres)
		if err != nil {
			errChan <- err
			return
		}
		result.Date = utils.SliceToSlice(date, func(t time.Time) string {
			return t.Format("2006/01/02 15:04")
		})
		result.AvgRequestPerSubscriberOverview = make([]float64, 0, len(items))
		result.RequestOverview = make([]*monitor_dto.StatusCodeOverview, 0, len(items))
		for index, item := range items {
			consumerNum := consumerMap[date[index]]
			avgRequestPerSubscriber := 0.0
			if consumerNum != 0 {
				avgRequestPerSubscriber = float64(item.StatusTotal) / float64(consumerNum)
			}
			result.AvgRequestPerSubscriberOverview = append(result.AvgRequestPerSubscriberOverview, avgRequestPerSubscriber)
			result.RequestOverview = append(result.RequestOverview, &monitor_dto.StatusCodeOverview{
				Status2xx: item.Status2xx,
				Status4xx: item.Status4xx,
				Status5xx: item.Status5xx,
			})
		}

		result.RequestTotal = summary.StatusTotal
		result.Request2xxTotal = summary.Status2xx
		result.Request4xxTotal = summary.Status4xx
		result.Request5xxTotal = summary.Status5xx
	}()
	sumResponseTimes := make([]int64, 0)
	go func() {
		defer wg.Done()
		_, _, items, err := executor.SumResponseTimeOverview(ctx, formatTimeByMinute(start), formatTimeByMinute(end), wheres)
		if err != nil {
			errChan <- err
			return
		}
		for _, item := range items {
			sumResponseTimes = append(sumResponseTimes, item)
		}
	}()
	totalTokens := make([]int64, 0)
	go func() {
		defer wg.Done()
		startTime := formatTimeByMinute(start)
		endTime := formatTimeByMinute(end)
		date, summary, items, err := executor.TokenOverview(ctx, startTime, endTime, wheres)
		if err != nil {
			errChan <- err
			return
		}
		result.TokenOverview = make([]*monitor_dto.TokenOverview, 0, len(items))
		result.AvgTokenOverview = make([]float64, 0, len(items))
		result.AvgTokenPerSubscriberOverview = make([]*monitor_dto.TokenFloatOverview, 0, len(items))
		var maxToken, minToken int64 = 0, 0
		for index, item := range items {
			if maxToken < item.TotalToken {
				maxToken = item.TotalToken
			}
			if minToken == 0 || minToken > item.TotalToken {
				minToken = item.TotalToken
			}
			result.TokenOverview = append(result.TokenOverview, &monitor_dto.TokenOverview{
				TotalToken:  item.TotalToken,
				OutputToken: item.OutputToken,
				InputToken:  item.InputToken,
			})
			totalTokens = append(totalTokens, item.TotalToken)
			consumerNum := consumerMap[date[index]]
			avgTotalPerSubscriber := 0.0
			avgOutputPerSubscriber := 0.0
			avgInputPerSubscriber := 0.0
			if consumerNum != 0 {
				avgTotalPerSubscriber = float64(item.TotalToken) / float64(consumerNum)
				avgOutputPerSubscriber = float64(item.OutputToken) / float64(consumerNum)
				avgInputPerSubscriber = float64(item.InputToken) / float64(consumerNum)
			}

			result.AvgTokenPerSubscriberOverview = append(result.AvgTokenPerSubscriberOverview, &monitor_dto.TokenFloatOverview{
				TotalToken:  avgTotalPerSubscriber,
				OutputToken: avgOutputPerSubscriber,
				InputToken:  avgInputPerSubscriber,
			})

		}
		//avgTokenPerSubscriber := 0.0
		//if totalConsumerCount != 0 {
		//	avgTokenPerSubscriber = float64(summary.TotalToken) / float64(totalConsumerCount)
		//}
		//result.AvgToken = avgTokenPerSubscriber
		//result.MaxToken = maxToken
		//result.MinToken = minToken
		result.TokenTotal = summary.TotalToken
		result.InputTokenTotal = summary.InputToken
		result.OutputTokenTotal = summary.OutputToken
	}()
	go func() {
		wg.Wait()
		close(errChan)
	}()
	errs := make([]error, 0, 3)
	// 收集错误
	for err := range errChan {
		errs = append(errs, err)
	}

	if len(errs) > 0 {
		return nil, fmt.Errorf("errors occurred: %v", errs)
	}
	var maxTokenPerSecond, minTokenPerSecond, avgTokenPerSecond float64 = 0, 0, 0
	for index, token := range totalTokens {
		var p float64 = 0
		if len(sumResponseTimes) > index && sumResponseTimes[index] > 0 {
			// 由于时间单位是ms，因此需要✖️1000
			p = float64(token) * 1000 / float64(sumResponseTimes[index])
		}
		result.AvgTokenOverview = append(result.AvgTokenOverview, p)
		if maxTokenPerSecond < p {
			maxTokenPerSecond = p
		}
		if minTokenPerSecond == 0 || minTokenPerSecond > p {
			minTokenPerSecond = p
		}
		avgTokenPerSecond += p
	}
	if len(sumResponseTimes) > 0 {
		result.AvgToken = avgTokenPerSecond / float64(len(sumResponseTimes))
	}
	result.MaxToken = maxTokenPerSecond
	result.MinToken = minTokenPerSecond
	return result, nil
}

func (i *imlMonitorStatisticModule) RestChartOverview(ctx context.Context, serviceId string, start int64, end int64) (*monitor_dto.ChartRestOverview, error) {
	wheres, err := i.genOverviewWhere(ctx, serviceId, []string{"rest"})
	if err != nil {
		return nil, err
	}
	executor, err := i.getExecutor(ctx, cluster.DefaultClusterID)
	if err != nil {
		return nil, err
	}

	_, consumerMap, err := executor.ConsumerOverview(ctx, formatTimeByMinute(start), formatTimeByMinute(end), wheres)
	if err != nil {
		return nil, err
	}

	var wg sync.WaitGroup
	wg.Add(3)
	errChan := make(chan error, 2)
	result := new(monitor_dto.ChartRestOverview)
	go func() {
		defer wg.Done()
		date, summary, items, err := executor.RequestOverview(ctx, formatTimeByMinute(start), formatTimeByMinute(end), wheres)
		if err != nil {
			errChan <- err
			return
		}
		result.Date = utils.SliceToSlice(date, func(t time.Time) string {
			return t.Format("2006/01/02 15:04")
		})
		result.AvgRequestPerSubscriberOverview = make([]float64, 0, len(items))
		result.RequestOverview = make([]*monitor_dto.StatusCodeOverview, 0, len(items))
		for index, item := range items {
			t := date[index]
			log.Infof("date: %v, item: %v", t, item)
			consumerNum := consumerMap[date[index]]
			avgRequestPerSubscriber := 0.0
			if consumerNum != 0 {
				avgRequestPerSubscriber = float64(summary.StatusTotal) / float64(consumerNum)
			}
			result.AvgRequestPerSubscriberOverview = append(result.AvgRequestPerSubscriberOverview, avgRequestPerSubscriber)
			result.RequestOverview = append(result.RequestOverview, &monitor_dto.StatusCodeOverview{
				Status2xx: item.Status2xx,
				Status4xx: item.Status4xx,
				Status5xx: item.Status5xx,
			})
		}
		//avgRequestPerSubscriber := 0.0
		//if totalConsumerCount != 0 {
		//	avgRequestPerSubscriber = float64(summary.StatusTotal) / float64(totalConsumerCount)
		//}
		result.RequestTotal = summary.StatusTotal
		result.Request2xxTotal = summary.Status2xx
		result.Request4xxTotal = summary.Status4xx
		result.Request5xxTotal = summary.Status5xx
	}()

	go func() {
		defer wg.Done()
		startTime := formatTimeByMinute(start)
		endTime := formatTimeByMinute(end)
		_, summary, items, err := executor.AvgResponseTimeOverview(ctx, startTime, endTime, wheres)
		if err != nil {
			errChan <- err
			return
		}
		result.AvgResponseTimeOverview = items
		result.AvgResponseTime = summary.Avg
		result.MaxResponseTime = summary.Max
		result.MinResponseTime = summary.Min
	}()

	go func() {
		defer wg.Done()
		startTime := formatTimeByMinute(start)
		endTime := formatTimeByMinute(end)
		date, summary, items, err := executor.TrafficOverviewByStatusCode(ctx, startTime, endTime, wheres)
		if err != nil {
			errChan <- err
			return
		}
		result.TrafficOverview = make([]*monitor_dto.StatusCodeOverview, 0, len(items))
		result.AvgTrafficPerSubscriberOverview = make([]float64, 0, len(items))
		for index, item := range items {
			result.TrafficOverview = append(result.TrafficOverview, &monitor_dto.StatusCodeOverview{
				Status2xx: item.Status2xx,
				Status4xx: item.Status4xx,
				Status5xx: item.Status5xx,
			})
			consumerNum := consumerMap[date[index]]
			avgTrafficPerSubscriber := 0.0
			if consumerNum != 0 {
				avgTrafficPerSubscriber = float64(item.StatusTotal) / float64(consumerNum)
			}
			result.AvgTrafficPerSubscriberOverview = append(result.AvgTrafficPerSubscriberOverview, avgTrafficPerSubscriber)
		}
		result.TrafficTotal = summary.StatusTotal
		result.Traffic2xxTotal = summary.Status2xx
		result.Traffic4xxTotal = summary.Status4xx
		result.Traffic5xxTotal = summary.Status5xx

	}()
	go func() {
		wg.Wait()
		close(errChan)
	}()
	errs := make([]error, 0, 3)
	// 收集错误
	for err := range errChan {
		errs = append(errs, err)
	}

	if len(errs) > 0 {
		return nil, fmt.Errorf("errors occurred: %v", errs)
	}
	return result, nil
}

func generateTopN(id string, name string, item *monitor.TopN, apiKind string) *monitor_dto.TopN {
	n := &monitor_dto.TopN{
		Id:      id,
		Name:    name,
		Request: common.FormatCountInt64(item.Request),
	}
	switch apiKind {
	case "rest":
		n.Traffic = common.FormatByte(item.Traffic)
	case "ai":
		n.Token = common.FormatCountInt64(item.Token)
	}
	return n
}

func (i *imlMonitorStatisticModule) Top(ctx context.Context, serviceId string, start int64, end int64, limit int, apiKind string) ([]*monitor_dto.TopN, []*monitor_dto.TopN, error) {
	wheres, err := i.genOverviewWhere(ctx, serviceId, []string{apiKind})
	if err != nil {
		return nil, nil, err
	}

	executor, err := i.getExecutor(ctx, cluster.DefaultClusterID)
	if err != nil {
		return nil, nil, err
	}

	errChan := make(chan error, 2)
	var wg sync.WaitGroup
	apisResult, consumersResult := make([]*monitor_dto.TopN, 0), make([]*monitor_dto.TopN, 0)
	var errs []error

	wg.Add(2)

	go func() {
		defer wg.Done()
		result, err := executor.TopN(ctx, formatTimeByMinute(start), formatTimeByMinute(end), limit, "api", wheres)
		if err != nil {
			errChan <- err
			return
		}
		if len(result) < 1 {
			return
		}
		apiIds := utils.SliceToSlice(result, func(t *monitor.TopN) string {
			return t.Key
		})
		apis, err := i.apiService.ListInfo(ctx, apiIds...)
		if err != nil {
			errChan <- err
			return
		}
		apiMap := utils.SliceToMap(apis, func(t *api.Info) string {
			return t.UUID
		})
		for _, item := range result {
			if v, ok := apiMap[item.Key]; ok {
				apisResult = append(apisResult, generateTopN(v.UUID, v.Name, item, apiKind))
			}
		}
	}()

	go func() {
		defer wg.Done()
		result, err := executor.TopN(ctx, formatTimeByMinute(start), formatTimeByMinute(end), limit, "app", wheres)
		if err != nil {
			errChan <- err
			return
		}
		if len(result) < 1 {
			return
		}
		appIds := utils.SliceToSlice(result, func(t *monitor.TopN) string {
			return t.Key
		})
		apps, err := i.serviceService.AppList(ctx, appIds...)
		if err != nil {
			errChan <- err
			return
		}
		appMap := utils.SliceToMap(apps, func(t *service.Service) string {
			return t.Id
		})
		for _, item := range result {
			if v, ok := appMap[item.Key]; ok {
				consumersResult = append(consumersResult, generateTopN(v.Id, v.Name, item, apiKind))
			}
		}
	}()

	// 收集所有错误
	go func() {
		wg.Wait()
		close(errChan)
	}()

	// 收集错误
	for err := range errChan {
		errs = append(errs, err)
	}

	if len(errs) > 0 {
		return nil, nil, fmt.Errorf("errors occurred: %v", errs)
	}
	return apisResult, consumersResult, nil
}

func (i *imlMonitorStatisticModule) ApiStatistics(ctx context.Context, input *monitor_dto.StatisticInput) ([]*monitor_dto.ApiStatisticBasicItem, error) {
	clusterId := cluster.DefaultClusterID
	_, err := i.clusterService.Get(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, err
	}

	wm := make(map[string]interface{})
	if len(input.Apis) > 0 {
		wm["uuid"] = input.Apis
		wheres = append(wheres, monitor.MonWhereItem{
			Key:       "api",
			Operation: "in",
			Values:    input.Apis,
		})
	}
	if len(input.Services) > 0 {
		wm["service"] = input.Services
		wheres = append(wheres, monitor.MonWhereItem{
			Key:       "project",
			Operation: "in",
			Values:    input.Services,
		})
	}
	// 查询符合条件的API
	apis, err := i.apiService.Search(ctx, input.Path, wm)
	if err != nil {
		return nil, err
	}
	if len(apis) < 1 {
		// 没有符合条件的API
		return make([]*monitor_dto.ApiStatisticBasicItem, 0), nil
	}
	apiIds := utils.SliceToSlice(apis, func(t *api.API) string {
		return t.UUID
	})

	apiInfos, err := i.apiService.ListInfo(ctx, apiIds...)
	if err != nil {
		return nil, err
	}
	return i.apiStatistics(ctx, clusterId, apiInfos, formatTimeByMinute(input.Start), formatTimeByMinute(input.End), wheres, 0)
}

func (i *imlMonitorStatisticModule) apiStatistics(ctx context.Context, clusterId string, apiInfos []*api.Info, start time.Time, end time.Time, wheres []monitor.MonWhereItem, limit int) ([]*monitor_dto.ApiStatisticBasicItem, error) {
	statisticMap, err := i.statistics(ctx, clusterId, "api", start, end, wheres, limit)
	if err != nil {
		return nil, err
	}

	result := make([]*monitor_dto.ApiStatisticBasicItem, 0, len(statisticMap))
	for _, item := range apiInfos {

		statisticItem := &monitor_dto.ApiStatisticBasicItem{
			Id:            item.UUID,
			Name:          item.Name,
			Path:          item.Path,
			Service:       auto.UUID(item.Service),
			MonCommonData: new(monitor_dto.MonCommonData),
		}
		if val, ok := statisticMap[item.UUID]; ok {
			statisticItem.MonCommonData = monitor_dto.ToMonCommonData(val)
			delete(statisticMap, item.UUID)
		}
		result = append(result, statisticItem)
	}
	for key, item := range statisticMap {
		statisticItem := &monitor_dto.ApiStatisticBasicItem{
			Id:            key,
			Name:          "未知API-" + key,
			MonCommonData: monitor_dto.ToMonCommonData(item),
		}

		if key == "-" {
			statisticItem.Name = "无API"
		}
		result = append(result, statisticItem)
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].RequestTotal > result[j].RequestTotal
	})
	return result, nil
}

func (i *imlMonitorStatisticModule) SubscriberStatistics(ctx context.Context, input *monitor_dto.StatisticInput) ([]*monitor_dto.ServiceStatisticBasicItem, error) {
	clusterId := cluster.DefaultClusterID
	_, err := i.clusterService.Get(ctx, clusterId)
	if err != nil {
		return nil, err
	}

	apps, err := i.serviceService.AppList(ctx, input.Services...)
	if err != nil {
		return nil, err
	}
	appIds := utils.SliceToSlice(apps, func(p *service.Service) string {
		return p.Id
	})

	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, err
	}

	if len(appIds) > 0 {
		wheres = append(wheres, monitor.MonWhereItem{
			Key:       "app",
			Operation: "in",
			Values:    appIds,
		})
	}

	return i.serviceStatistics(ctx, clusterId, apps, "app", formatTimeByMinute(input.Start), formatTimeByMinute(input.End), wheres, 0)
}

func (i *imlMonitorStatisticModule) serviceStatistics(ctx context.Context, clusterId string, services []*service.Service, groupBy string, start time.Time, end time.Time, wheres []monitor.MonWhereItem, limit int) ([]*monitor_dto.ServiceStatisticBasicItem, error) {
	statisticMap, err := i.statistics(ctx, clusterId, groupBy, start, end, wheres, limit)
	if err != nil {
		return nil, err
	}

	result := make([]*monitor_dto.ServiceStatisticBasicItem, 0, len(statisticMap))
	for _, item := range services {
		statisticItem := &monitor_dto.ServiceStatisticBasicItem{
			Id:            item.Id,
			Name:          item.Name,
			MonCommonData: new(monitor_dto.MonCommonData),
		}
		if val, ok := statisticMap[item.Id]; ok {
			statisticItem.MonCommonData = monitor_dto.ToMonCommonData(val)
			delete(statisticMap, item.Id)
		}
		result = append(result, statisticItem)
	}
	for key, item := range statisticMap {
		statisticItem := &monitor_dto.ServiceStatisticBasicItem{
			Id:            key,
			Name:          "未知-" + key,
			MonCommonData: monitor_dto.ToMonCommonData(item),
		}

		if key == "-" {
			statisticItem.Name = "-"
		}
		result = append(result, statisticItem)
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].RequestTotal > result[j].RequestTotal
	})
	return result, nil
}

func (i *imlMonitorStatisticModule) ProviderStatistics(ctx context.Context, input *monitor_dto.StatisticInput) ([]*monitor_dto.ServiceStatisticBasicItem, error) {
	clusterId := cluster.DefaultClusterID
	_, err := i.clusterService.Get(ctx, clusterId)
	if err != nil {
		return nil, err
	}

	services, err := i.serviceService.ServiceList(ctx, input.Services...)
	if err != nil {
		return nil, err
	}

	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, err
	}

	if len(input.Services) > 0 {
		wheres = append(wheres, monitor.MonWhereItem{
			Key:       "provider",
			Operation: "in",
			Values:    input.Services,
		})
	}

	return i.serviceStatistics(ctx, clusterId, services, "provider", formatTimeByMinute(input.Start), formatTimeByMinute(input.End), wheres, 0)
}

func (i *imlMonitorStatisticModule) APITrend(ctx context.Context, apiId string, input *monitor_dto.CommonInput) (*monitor_dto.MonInvokeCountTrend, string, error) {
	clusterId := cluster.DefaultClusterID
	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, "", err
	}
	wheres = append(wheres, monitor.MonWhereItem{
		Key:       "api",
		Operation: "=",
		Values:    []string{apiId},
	})
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

func (i *imlMonitorStatisticModule) ProviderTrend(ctx context.Context, providerId string, input *monitor_dto.CommonInput) (*monitor_dto.MonInvokeCountTrend, string, error) {
	clusterId := cluster.DefaultClusterID
	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, "", err
	}
	wheres = append(wheres, monitor.MonWhereItem{
		Key:       "provider",
		Operation: "=",
		Values:    []string{providerId},
	})
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

func (i *imlMonitorStatisticModule) SubscriberTrend(ctx context.Context, subscriberId string, input *monitor_dto.CommonInput) (*monitor_dto.MonInvokeCountTrend, string, error) {
	clusterId := cluster.DefaultClusterID
	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, "", err
	}
	wheres = append(wheres, monitor.MonWhereItem{
		Key:       "app",
		Operation: "=",
		Values:    []string{subscriberId},
	})
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

func (i *imlMonitorStatisticModule) InvokeTrendWithSubscriberAndApi(ctx context.Context, apiId string, subscriberId string, input *monitor_dto.CommonInput) (*monitor_dto.MonInvokeCountTrend, string, error) {
	clusterId := cluster.DefaultClusterID
	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, "", err
	}
	wheres = append(wheres, monitor.MonWhereItem{
		Key:       "api",
		Operation: "=",
		Values:    []string{apiId},
	}, monitor.MonWhereItem{
		Key:       "app",
		Operation: "=",
		Values:    []string{subscriberId},
	})
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

func (i *imlMonitorStatisticModule) InvokeTrendWithProviderAndApi(ctx context.Context, providerId string, apiId string, input *monitor_dto.CommonInput) (*monitor_dto.MonInvokeCountTrend, string, error) {
	clusterId := cluster.DefaultClusterID
	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, "", err
	}
	wheres = append(wheres, monitor.MonWhereItem{
		Key:       "api",
		Operation: "=",
		Values:    []string{apiId},
	}, monitor.MonWhereItem{
		Key:       "provider",
		Operation: "=",
		Values:    []string{providerId},
	})
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

func (i *imlMonitorStatisticModule) statisticOnApi(ctx context.Context, clusterId string, apiId string, groupBy string, input *monitor_dto.StatisticInput) ([]*monitor_dto.ServiceStatisticBasicItem, error) {
	_, err := i.clusterService.Get(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	var service []*service.Service
	switch groupBy {
	case "app":
		service, err = i.serviceService.AppList(ctx)
	case "provider":
		service, err = i.serviceService.ServiceList(ctx)
	default:
		return nil, errors.New("invalid group by")
	}
	if err != nil {
		return nil, err
	}

	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	wheres = append(wheres, monitor.MonWhereItem{
		Key:       "api",
		Operation: "=",
		Values:    []string{apiId},
	})

	statisticMap, err := i.statistics(ctx, clusterId, groupBy, formatTimeByMinute(input.Start), formatTimeByMinute(input.End), wheres, 0)
	if err != nil {
		return nil, err
	}

	result := make([]*monitor_dto.ServiceStatisticBasicItem, 0, len(statisticMap))
	for _, item := range service {

		statisticItem := &monitor_dto.ServiceStatisticBasicItem{
			Id:            item.Id,
			Name:          item.Name,
			MonCommonData: new(monitor_dto.MonCommonData),
		}
		if val, ok := statisticMap[item.Id]; ok {
			statisticItem.MonCommonData = monitor_dto.ToMonCommonData(val)
			delete(statisticMap, item.Id)
		}
		result = append(result, statisticItem)
	}
	for key, item := range statisticMap {
		statisticItem := &monitor_dto.ServiceStatisticBasicItem{
			Id:            key,
			Name:          "未知-" + key,
			MonCommonData: monitor_dto.ToMonCommonData(item),
		}

		if key == "-" {
			statisticItem.Name = "-"
		}
		result = append(result, statisticItem)
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].RequestTotal > result[j].RequestTotal
	})
	return result, nil
}

func (i *imlMonitorStatisticModule) ProviderStatisticsOnApi(ctx context.Context, apiId string, input *monitor_dto.StatisticInput) ([]*monitor_dto.ServiceStatisticBasicItem, error) {
	clusterId := cluster.DefaultClusterID
	return i.statisticOnApi(ctx, clusterId, apiId, "provider", input)
}

func (i *imlMonitorStatisticModule) ApiStatisticsOnProvider(ctx context.Context, providerId string, input *monitor_dto.StatisticInput) ([]*monitor_dto.ApiStatisticBasicItem, error) {
	clusterId := cluster.DefaultClusterID
	_, err := i.clusterService.Get(ctx, clusterId)
	if err != nil {
		return nil, err
	}

	apiInfos, err := i.apiService.ListInfoForService(ctx, providerId)
	if err != nil {
		return nil, err
	}
	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	wheres = append(wheres, monitor.MonWhereItem{
		Key:       "provider",
		Operation: "=",
		Values:    []string{providerId},
	})

	return i.apiStatistics(ctx, clusterId, apiInfos, formatTimeByMinute(input.Start), formatTimeByMinute(input.End), wheres, 0)
}

func (i *imlMonitorStatisticModule) ApiStatisticsOnSubscriber(ctx context.Context, subscriberId string, input *monitor_dto.StatisticInput) ([]*monitor_dto.ApiStatisticBasicItem, error) {
	clusterId := cluster.DefaultClusterID
	_, err := i.clusterService.Get(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	// 根据订阅ID查询订阅的服务列表
	subscriptions, err := i.subscribeService.MySubscribeServices(ctx, subscriberId, nil)
	if err != nil {
		return nil, err
	}
	serviceIds := utils.SliceToSlice(subscriptions, func(t *subscribe.Subscribe) string {
		return t.Service
	})
	if len(serviceIds) < 1 {
		return nil, nil
	}
	apiInfos, err := i.apiService.ListInfoForServices(ctx, serviceIds...)
	if err != nil {
		return nil, err
	}

	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	wheres = append(wheres, monitor.MonWhereItem{
		Key:       "app",
		Operation: "=",
		Values:    []string{subscriberId},
	})

	return i.apiStatistics(ctx, clusterId, apiInfos, formatTimeByMinute(input.Start), formatTimeByMinute(input.End), wheres, 0)
}

func (i *imlMonitorStatisticModule) SubscriberStatisticsOnApi(ctx context.Context, apiId string, input *monitor_dto.StatisticInput) ([]*monitor_dto.ServiceStatisticBasicItem, error) {
	clusterId := cluster.DefaultClusterID
	return i.statisticOnApi(ctx, clusterId, apiId, "app", input)
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
	nodes, err := i.clusterService.Nodes(ctx, clusterIds...)
	if err != nil {
		return nil, err
	}
	nodeIds := utils.SliceToSlice(nodes, func(s *cluster.Node) string {
		return s.Name
	})
	wheres = append(wheres, monitor.MonWhereItem{
		Key:       "node",
		Operation: "in",
		Values:    nodeIds,
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
				statisticItem.Name = "Unknown API"
			} else {
				statisticItem.Name = fmt.Sprintf("Unknow-%s", key)
			}
		}
		result = append(result, statisticItem)
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].RequestTotal > result[j].RequestTotal
	})
	return result, nil

}

func (i *imlMonitorStatisticModule) TopSubscriberStatistics(ctx context.Context, limit int, input *monitor_dto.CommonInput) ([]*monitor_dto.ServiceStatisticItem, error) {
	clusterId := cluster.DefaultClusterID
	_, err := i.clusterService.Get(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	return i.topProjectStatistics(ctx, clusterId, "app", input, limit)
}

func (i *imlMonitorStatisticModule) TopProviderStatistics(ctx context.Context, limit int, input *monitor_dto.CommonInput) ([]*monitor_dto.ServiceStatisticItem, error) {
	clusterId := cluster.DefaultClusterID
	_, err := i.clusterService.Get(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	return i.topProjectStatistics(ctx, clusterId, "provider", input, limit)
}

func (i *imlMonitorStatisticModule) topProjectStatistics(ctx context.Context, clusterId string, groupBy string, input *monitor_dto.CommonInput, limit int) ([]*monitor_dto.ServiceStatisticItem, error) {
	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	statisticMap, err := i.statistics(ctx, clusterId, groupBy, formatTimeByMinute(input.Start), formatTimeByMinute(input.End), wheres, limit)
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

	result := make([]*monitor_dto.ServiceStatisticItem, 0, len(statisticMap))
	for key, item := range statisticMap {
		statisticItem := &monitor_dto.ServiceStatisticItem{
			ServiceStatisticBasicItem: &monitor_dto.ServiceStatisticBasicItem{
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
}

func (m *imlMonitorConfig) GetMonitorCluster(ctx context.Context) ([]*monitor_dto.MonitorCluster, error) {
	clusters, err := m.clusterService.ListByClusters(ctx)
	if err != nil {
		return nil, err
	}
	clusterIds := utils.SliceToSlice(clusters, func(i *cluster.Cluster) string {
		return i.Uuid
	})
	monitorMap, err := m.monitorService.MapByCluster(ctx, clusterIds...)
	if err != nil {
		return nil, err
	}

	monitorClusters := make([]*monitor_dto.MonitorCluster, 0, len(clusters))
	for _, c := range clusters {
		mc := &monitor_dto.MonitorCluster{
			Id:   c.Uuid,
			Name: c.Name,
		}
		_, ok := monitorMap[c.Uuid]
		if ok {
			mc.Enable = true
		}
		monitorClusters = append(monitorClusters, mc)
	}
	return monitorClusters, nil
}
