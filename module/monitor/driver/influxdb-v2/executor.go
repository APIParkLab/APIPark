package influxdb_v2

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/eolinker/eosc/log"

	"github.com/eolinker/go-common/utils"
	"github.com/influxdata/influxdb-client-go/v2/domain"

	"github.com/APIParkLab/APIPark/common"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"

	"github.com/APIParkLab/APIPark/module/monitor/driver"
	"github.com/APIParkLab/APIPark/module/monitor/driver/influxdb-v2/flux"

	"github.com/influxdata/influxdb-client-go/v2/api"

	"github.com/APIParkLab/APIPark/service/monitor"
)

func newExecutor(cfg string, fluxQuery flux.IFluxQuery) (driver.IExecutor, error) {
	var data InfluxdbV2Config
	err := json.Unmarshal([]byte(cfg), &data)
	if err != nil {
		return nil, err
	}
	client := influxdb2.NewClient(data.Addr, data.Token)

	return &executor{cfg: data, openApi: client.QueryAPI(data.Org), client: client, fluxQuery: fluxQuery}, nil
}

type executor struct {
	fluxQuery flux.IFluxQuery
	cfg       InfluxdbV2Config
	openApi   api.QueryAPI
	client    influxdb2.Client
}

func (e *executor) Init(ctx context.Context) error {
	orgInfo, err := e.client.OrganizationsAPI().FindOrganizationByName(ctx, e.cfg.Org)
	if err != nil {
		return err
	}
	orgID := *orgInfo.Id
	//初始化bucket
	bucketsAPI := e.client.BucketsAPI()
	buckets, err := bucketsAPI.FindBucketsByOrgName(ctx, e.cfg.Org)
	if err != nil {
		return err
	}

	bucketsConf := flux.GetBucketConfigList()
	//要创建的bucket
	toCreateBuckets := utils.SliceToMap(bucketsConf, func(t *flux.BucketConf) string {
		return t.BucketName
	})
	if buckets != nil {
		for _, bucket := range *buckets {
			if _, has := toCreateBuckets[bucket.Name]; has {
				delete(toCreateBuckets, bucket.Name)
			}
		}
	}
	expire := domain.RetentionRuleTypeExpire
	rule := domain.RetentionRule{
		ShardGroupDurationSeconds: nil,
		Type:                      &expire,
	}
	//创建bucket
	for _, bucketConf := range toCreateBuckets {
		rule.EverySeconds = bucketConf.Retention
		_, err := e.client.BucketsAPI().CreateBucketWithNameWithID(ctx, orgID, bucketConf.BucketName, rule)
		if err != nil {
			return err
		}
		log.Infof("Save bucket %s success. organization: %s", bucketConf.BucketName, e.cfg.Org)
	}

	//创建定时脚本
	tasksApi := e.client.TasksAPI()
	taskFilter := &api.TaskFilter{
		OrgID: orgID,
	}
	existedTasks, err := tasksApi.FindTasks(ctx, taskFilter)
	if err != nil {
		return err
	}
	tasksConf := flux.GetTaskConfigList()
	//要创建的bucket
	toCreateTasks := utils.SliceToMap(tasksConf, func(t *flux.TaskConf) string {
		return t.TaskName
	})
	toDeleteTaskIDs := make([]string, 0, len(toCreateTasks))

	/*
		将influxDB已存在的定时脚本 与 定时脚本配置的进行对比
		1. 配置和influxDB均有则不创建
		2. 配置有，influxDB没有，则创建
		3. 配置没有，influxDB有,且是apinto开头， 则删除
	*/
	for _, task := range existedTasks {
		if _, has := toCreateTasks[task.Name]; has {
			delete(toCreateTasks, task.Name)
		} else {
			if strings.HasPrefix(task.Name, "apinto") {
				toDeleteTaskIDs = append(toDeleteTaskIDs, task.Id)
			}
		}
	}
	//删除旧的apinto定时脚本
	for _, delId := range toDeleteTaskIDs {
		err = tasksApi.DeleteTaskWithID(ctx, delId)
		if err != nil {
			return err
		}
	}

	//创建influxDB中没有的定时脚本
	for _, taskConf := range toCreateTasks {
		newTask := &domain.Task{
			Cron:   &taskConf.Cron,
			Flux:   taskConf.Flux,
			Name:   taskConf.TaskName,
			Offset: &taskConf.Offset,
			OrgID:  orgID,
			//Status:          nil,
		}
		_, err := tasksApi.CreateTask(ctx, newTask)
		if err != nil {
			return err
		}
		log.Infof("Save task %s success. organization: %s", taskConf.TaskName, e.cfg.Org)
	}

	return nil
}

func (e *executor) MessageTrend(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) (*monitor.MonMessageTrend, string, error) {
	newStartTime, every, windowOffset, bucket := getTimeIntervalAndBucket(start, end)

	filters := formatFilter(wheres)

	fieldsConditions := []string{"request", "response"}

	dates, groupValues, err := e.fluxQuery.CommonTendency(ctx, e.openApi, newStartTime, end, bucket, "request", filters, fieldsConditions, every, windowOffset)
	if err != nil {
		return nil, "", err
	}

	resultVal := &monitor.MonMessageTrend{
		Dates:       dates,
		ReqMessage:  formatMessageTrendData(groupValues["request"]),
		RespMessage: formatMessageTrendData(groupValues["response"]),
	}

	return resultVal, every, nil
}

func (e *executor) ProxyTrend(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) (*monitor.MonInvokeCountTrend, string, error) {
	newStartTime, every, windowOffset, bucket := getTimeIntervalAndBucket(start, end)

	filters := formatFilter(wheres)

	proxyConditions := []string{"p_total", "p_success", "p_s4xx", "p_s5xx"}

	dates, proxyValues, err := e.fluxQuery.CommonTendency(ctx, e.openApi, newStartTime, end, bucket, "proxy", filters, proxyConditions, every, windowOffset)
	if err != nil {
		return nil, "", err
	}
	proxyRate := make([]float64, 0, len(dates))
	//计算请求成功率
	proxyTotal := proxyValues["p_total"]
	proxySuccess := proxyValues["p_success"]
	for i, total := range proxyTotal {
		if total == 0 {
			proxyRate = append(proxyRate, 0)
			continue
		}
		rate := FormatFloat64(float64(proxySuccess[i])/float64(total), 4)
		proxyRate = append(proxyRate, rate)
	}

	resultVal := &monitor.MonInvokeCountTrend{
		Date:       dates,
		Status5XX:  proxyValues["p_s5xx"],
		Status4XX:  proxyValues["p_s4xx"],
		ProxyRate:  proxyRate,
		ProxyTotal: proxyValues["p_total"],
	}

	return resultVal, every, nil
}

func (e *executor) InvokeTrend(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) (*monitor.MonInvokeCountTrend, string, error) {
	newStartTime, every, windowOffset, bucket := getTimeIntervalAndBucket(start, end)
	filters := formatFilter(wheres)

	requestConditions := []string{"total", "success", "s4xx", "s5xx"}

	dates, requestValues, err := e.fluxQuery.CommonTendency(ctx, e.openApi, newStartTime, end, bucket, "request", filters, requestConditions, every, windowOffset)
	if err != nil {
		return nil, "", err
	}
	requestRate := make([]float64, 0, len(dates))
	//计算请求成功率
	requestTotal := requestValues["total"]
	requestSuccess := requestValues["success"]
	for i, total := range requestTotal {
		if total == 0 {
			requestRate = append(requestRate, 0)
			continue
		}
		rate := FormatFloat64(float64(requestSuccess[i])/float64(total), 4)
		requestRate = append(requestRate, rate)
	}

	proxyConditions := []string{"p_total", "p_success"}

	_, proxyValues, err := e.fluxQuery.CommonTendency(ctx, e.openApi, newStartTime, end, bucket, "proxy", filters, proxyConditions, every, windowOffset)
	if err != nil {
		return nil, "", err
	}
	//计算转发成功率
	proxyTotal := proxyValues["p_total"]
	proxySuccess := proxyValues["p_success"] //proxySuccess和proxyTotal必定等长
	proxyRate := make([]float64, 0, len(proxyTotal))
	for i, total := range proxyTotal {
		if total == 0 {
			proxyRate = append(proxyRate, 0)
			continue
		}
		rate := FormatFloat64(float64(proxySuccess[i])/float64(total), 4)
		proxyRate = append(proxyRate, rate)
	}
	resultVal := &monitor.MonInvokeCountTrend{
		Date:         dates,
		Status5XX:    requestValues["s5xx"],
		Status4XX:    requestValues["s4xx"],
		ProxyRate:    proxyRate,
		ProxyTotal:   proxyValues["p_total"],
		RequestRate:  requestRate,
		RequestTotal: requestValues["total"],
	}

	return resultVal, every, nil
}

func (e *executor) summary(ctx context.Context, start, end time.Time, bucket string, filters string, filterCfg *flux.StatisticsFilterConf, prefix string) (*monitor.Summary, error) {
	//获取请求表的饼状图
	queryOnce, err := e.fluxQuery.CommonQueryOnce(ctx, e.openApi, start, end, bucket, filters, filterCfg)
	if err != nil {
		return nil, err
	}
	summary := new(monitor.Summary)
	if v, ok := queryOnce[prefix+"s4xx"]; ok {
		summary.Status4Xx = common.FmtIntFromInterface(v)
	}
	if v, ok := queryOnce[prefix+"s5xx"]; ok {
		summary.Status5Xx = common.FmtIntFromInterface(v)
	}
	if v, ok := queryOnce[prefix+"success"]; ok {
		summary.Success = common.FmtIntFromInterface(v)
	}
	if v, ok := queryOnce[prefix+"total"]; ok {
		summary.Total = common.FmtIntFromInterface(v)
	}
	summary.Fail = summary.Total - summary.Success
	return summary, nil
}

func (e *executor) RequestSummary(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) (*monitor.Summary, error) {
	newStartTime, _, _, bucket := getTimeIntervalAndBucket(start, end)
	return e.summary(ctx, newStartTime, end, bucket, formatFilter(wheres), &flux.StatisticsFilterConf{
		Measurement: "request",
		AggregateFn: "sum()",
		Fields:      []string{"total", "success", "s4xx", "s5xx"},
	}, "")
}

func (e *executor) ProxySummary(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) (*monitor.Summary, error) {
	newStartTime, _, _, bucket := getTimeIntervalAndBucket(start, end)
	return e.summary(ctx, newStartTime, end, bucket, formatFilter(wheres), &flux.StatisticsFilterConf{
		Measurement: "proxy",
		AggregateFn: "sum()",
		Fields:      []string{"p_total", "p_success", "p_s4xx", "p_s5xx"},
	}, "p_")
}

func (e *executor) CommonStatistics(ctx context.Context, start, end time.Time, groupBy string, limit int, wheres []monitor.MonWhereItem) (map[string]monitor.MonCommonData, error) {
	filters := formatFilter(wheres)
	newStartTime, _, _, bucket := getTimeIntervalAndBucket(start, end)

	statisticsConf := []*flux.StatisticsFilterConf{
		{
			Measurement: "request",
			AggregateFn: "sum()",
			Fields:      []string{"total", "success", "timing", "request"},
		},
		{
			Measurement: "proxy",
			AggregateFn: "sum()",
			Fields:      []string{"p_total", "p_success"},
		},
		{
			Measurement: "request",
			AggregateFn: "max()",
			Fields:      []string{"timing_max", "request_max"},
		}, {
			Measurement: "request",
			AggregateFn: "min()",
			Fields:      []string{"timing_min", "request_min"},
		},
	}

	results, err := e.fluxQuery.CommonStatistics(ctx, e.openApi, newStartTime, end, bucket, groupBy, filters, statisticsConf, limit)
	if err != nil {
		return nil, err
	}
	resultMap := make(map[string]monitor.MonCommonData)
	for key, result := range results {

		requestRate := 0.0
		if result.Total == 0 {
			requestRate = 0.0
		} else {
			requestRate = FormatFloat64(float64(result.Success)/float64(result.Total), 4)
		}

		proxyRate := 0.0
		if result.ProxyTotal == 0 {
			proxyRate = 0.0
		} else {
			proxyRate = FormatFloat64(float64(result.ProxySuccess)/float64(result.ProxyTotal), 4)
		}

		monCommonData := monitor.MonCommonData{
			ID:             key,
			RequestTotal:   result.Total,
			RequestSuccess: result.Success,
			RequestRate:    requestRate,
			ProxyTotal:     result.ProxyTotal,
			ProxySuccess:   result.ProxySuccess,
			ProxyRate:      proxyRate,
			StatusFail:     result.Total - result.Success,
			AvgResp:        float64(result.TotalTiming) / float64(result.Total),
			MaxResp:        result.MaxTiming,
			MinResp:        result.MinTiming,
			AvgTraffic:     float64(result.TotalRequest) / float64(result.Total),
			MaxTraffic:     result.RequestMax,
			MinTraffic:     result.RequestMin,
		}

		resultMap[key] = monCommonData
	}

	return resultMap, nil

}
