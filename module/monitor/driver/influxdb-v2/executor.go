package influxdb_v2

import (
	"context"
	"encoding/json"
	"fmt"
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

var _ driver.IAIOverview = (*executor)(nil)
var _ driver.IRestOverview = (*executor)(nil)

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

	dates, groupValues, err := e.fluxQuery.CommonTendency(ctx, e.openApi, newStartTime, end, bucket, "request", filters, fieldsConditions, every, windowOffset, flux.SumFn)
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

	proxyConditions := []string{"p_total", "p_success", "p_s2xx", "p_s4xx", "p_s5xx"}

	dates, proxyValues, err := e.fluxQuery.CommonTendency(ctx, e.openApi, newStartTime, end, bucket, "proxy", filters, proxyConditions, every, windowOffset, flux.SumFn)
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

	requestConditions := []string{"total", "success", "2xx", "s4xx", "s5xx"}

	dates, requestValues, err := e.fluxQuery.CommonTendency(ctx, e.openApi, newStartTime, end, bucket, "request", filters, requestConditions, every, windowOffset, flux.SumFn)
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

	_, proxyValues, err := e.fluxQuery.CommonTendency(ctx, e.openApi, newStartTime, end, bucket, "proxy", filters, proxyConditions, every, windowOffset, flux.SumFn)
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

func (e *executor) overviewByStatusCode(ctx context.Context, start, end time.Time, table string, wheres []monitor.MonWhereItem, statusCode []string, dataFields []string, fn flux.AggregateFn) ([]time.Time, map[string][]int64, error) {
	newStartTime, every, windowOffset, bucket := getTimeIntervalAndBucket(start, end)
	var returnDates []time.Time
	var returnResult = make(map[string][]int64)
	for _, s := range statusCode {
		newWheres := make([]monitor.MonWhereItem, 0, len(wheres)+1)
		newWheres = append(newWheres, wheres...)
		newWheres = append(newWheres, monitor.MonWhereItem{
			Key:       "status_code",
			Operation: "=",
			Values:    []string{s},
		})
		dates, result, err := e.fluxQuery.CommonTendency(ctx, e.openApi, newStartTime, end, bucket, table, formatFilter(newWheres), dataFields, every, windowOffset, fn)
		if err != nil {
			return nil, nil, err
		}
		if len(dates) > 0 {
			returnDates = dates
		}

		for _, v := range dataFields {
			key := fmt.Sprintf("%s_%s", s, v)
			if _, ok := returnResult[key]; !ok {
				returnResult[key] = make([]int64, 0, len(returnDates))
			}
			returnResult[key] = append(returnResult[key], result[v]...)
		}
	}

	return returnDates, returnResult, nil
}

func (e *executor) TrafficOverviewByStatusCode(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) ([]time.Time, *monitor.StatusCodeOverview, []*monitor.StatusCodeOverview, error) {

	fieldsConditions := []string{"request", "response"}
	statusFilters := []string{"2xx", "4xx", "5xx"}
	dates, overview, err := e.overviewByStatusCode(ctx, start, end, "request", wheres, statusFilters, fieldsConditions, flux.SumFn)
	if err != nil {
		return nil, nil, nil, err
	}
	s2xxRequest := overview["2xx_request"]
	s2xxRequestLen := len(s2xxRequest)
	s4xxRequest := overview["4xx_request"]
	s4xxRequestLen := len(s4xxRequest)
	s5xxRequest := overview["5xx_request"]
	s5xxRequestLen := len(s5xxRequest)

	s2xxResponse := overview["2xx_response"]
	s2xxResponseLen := len(s2xxResponse)
	s4xxResponse := overview["4xx_response"]
	s4xxResponseLen := len(s4xxResponse)
	s5xxResponse := overview["5xx_response"]
	s5xxResponseLen := len(s5xxResponse)

	totalOverview := new(monitor.StatusCodeOverview)
	result := make([]*monitor.StatusCodeOverview, 0, len(dates))
	for i := range dates {
		r := new(monitor.StatusCodeOverview)
		if s2xxRequestLen > i {
			r.Status2xx = s2xxRequest[i]
		}
		if s4xxRequestLen > i {
			r.Status4xx = s4xxRequest[i]
		}
		if s5xxRequestLen > i {
			r.Status5xx = s5xxRequest[i]
		}
		if s2xxResponseLen > i {
			r.Status2xx += s2xxResponse[i]
		}
		if s4xxResponseLen > i {
			r.Status4xx += s4xxResponse[i]
		}
		if s5xxResponseLen > i {
			r.Status5xx += s5xxResponse[i]
		}
		r.StatusTotal += r.Status2xx + r.Status4xx + r.Status5xx
		totalOverview.Status2xx += r.Status2xx
		totalOverview.Status4xx += r.Status4xx
		totalOverview.Status5xx += r.Status5xx
		totalOverview.StatusTotal += r.StatusTotal

		result = append(result, r)

	}

	return dates, totalOverview, result, nil
}

func (e *executor) aggregateSummary(ctx context.Context, start time.Time, end time.Time, measurement string, bucket string, filters string, fields []string) (map[string]*monitor.Aggregate, error) {
	if len(fields) == 0 {
		return nil, fmt.Errorf("fields is empty")
	}
	maxFields := make([]string, 0, len(fields))
	minFields := make([]string, 0, len(fields))
	avgFields := make([]string, 0, len(fields))
	for _, field := range fields {
		maxFields = append(maxFields, field+"_max")
		minFields = append(minFields, field+"_min")
		avgFields = append(avgFields, field+"_avg")
	}
	maxRes, err := e.fluxQuery.CommonQueryOnce(ctx, e.openApi, start, end, bucket, filters, &flux.StatisticsFilterConf{
		Measurement: measurement,
		AggregateFn: "max()",
		Fields:      maxFields,
	})
	if err != nil {
		return nil, err
	}
	minRes, err := e.fluxQuery.CommonQueryOnce(ctx, e.openApi, start, end, bucket, filters, &flux.StatisticsFilterConf{
		Measurement: measurement,
		AggregateFn: "min()",
		Fields:      minFields,
	})
	if err != nil {
		return nil, err
	}
	avgRes, err := e.fluxQuery.CommonQueryOnce(ctx, e.openApi, start, end, bucket, filters, &flux.StatisticsFilterConf{
		Measurement: measurement,
		AggregateFn: "mean()",
		Fields:      avgFields,
	})
	if err != nil {
		return nil, err
	}
	result := make(map[string]*monitor.Aggregate)
	for _, field := range fields {
		a := new(monitor.Aggregate)
		if v, ok := avgRes[field+"_avg"]; ok {
			a.Avg = int64(v.(float64))
		}
		if v, ok := maxRes[field+"_max"]; ok {
			a.Max = v.(int64)
		}
		if v, ok := minRes[field+"_min"]; ok {
			a.Min = v.(int64)
		}

		result[field] = a
	}

	return result, nil

}

func (e *executor) SumResponseTimeOverview(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) ([]time.Time, *monitor.Aggregate, []int64, error) {
	newStartTime, every, windowOffset, bucket := getTimeIntervalAndBucket(start, end)
	filters := formatFilter(wheres)

	fieldsConditions := []string{"timing"}

	agg, err := e.aggregateSummary(ctx, newStartTime, end, "request", bucket, filters, []string{"timing"})
	if err != nil {
		return nil, nil, nil, err
	}

	dates, groupValues, err := e.fluxQuery.CommonTendency(ctx, e.openApi, newStartTime, end, bucket, "request", filters, fieldsConditions, every, windowOffset, flux.SumFn)
	if err != nil {
		return nil, nil, nil, err
	}

	timing := groupValues["timing"]
	timingLen := len(timing)
	result := make([]int64, 0, len(dates))
	for i := range dates {
		if timingLen > i {
			result = append(result, timing[i])
		}
	}

	return dates, agg["timing"], result, nil
}

func (e *executor) AvgResponseTimeOverview(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) ([]time.Time, *monitor.Aggregate, []int64, error) {
	newStartTime, every, windowOffset, bucket := getTimeIntervalAndBucket(start, end)
	filters := formatFilter(wheres)

	fieldsConditions := []string{"timing_avg"}

	agg, err := e.aggregateSummary(ctx, newStartTime, end, "request", bucket, filters, []string{"timing"})
	if err != nil {
		return nil, nil, nil, err
	}

	dates, groupValues, err := e.fluxQuery.CommonTendency(ctx, e.openApi, newStartTime, end, bucket, "request", filters, fieldsConditions, every, windowOffset, flux.AvgFn)
	if err != nil {
		return nil, nil, nil, err
	}

	timingAvg := groupValues["timing_avg"]
	timingAvgLen := len(timingAvg)
	result := make([]int64, 0, len(dates))
	for i := range dates {
		if timingAvgLen > i {
			result = append(result, timingAvg[i])
		}
	}

	return dates, agg["timing"], result, nil

}

func (e *executor) RequestOverview(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) ([]time.Time, *monitor.StatusCodeOverview, []*monitor.StatusCodeOverview, error) {
	newStartTime, every, windowOffset, bucket := getTimeIntervalAndBucket(start, end)
	filters := formatFilter(wheres)

	requestConditions := []string{"total", "s2xx", "s4xx", "s5xx"}

	dates, requestValues, err := e.fluxQuery.CommonTendency(ctx, e.openApi, newStartTime, end, bucket, "request", filters, requestConditions, every, windowOffset, flux.SumFn)
	if err != nil {
		return nil, nil, nil, err
	}
	total := requestValues["total"]
	totalLen := len(total)
	s2xx := requestValues["s2xx"]
	s2xxLen := len(s2xx)
	s4xx := requestValues["s4xx"]
	s4xxLen := len(s4xx)
	s5xx := requestValues["s5xx"]
	s5xxLen := len(s5xx)
	totalOverview := new(monitor.StatusCodeOverview)
	result := make([]*monitor.StatusCodeOverview, 0, len(dates))
	for i := range dates {
		r := new(monitor.StatusCodeOverview)
		if totalLen > i {
			r.StatusTotal = total[i]
			totalOverview.StatusTotal += r.StatusTotal
		}
		if s2xxLen > i {
			r.Status2xx = s2xx[i]
			totalOverview.Status2xx += r.Status2xx
		}
		if s4xxLen > i {
			r.Status4xx = s4xx[i]
			totalOverview.Status4xx += r.Status4xx
		}
		if s5xxLen > i {
			r.Status5xx = s5xx[i]
			totalOverview.Status5xx += r.Status5xx
		}
		result = append(result, r)
	}
	return dates, totalOverview, result, nil
}

func (e *executor) TopN(ctx context.Context, start time.Time, end time.Time, limit int, groupBy string, wheres []monitor.MonWhereItem) ([]*monitor.TopN, error) {
	filters := formatFilter(wheres)
	newStartTime, _, _, bucket := getTimeIntervalAndBucket(start, end)

	statisticsConf := []*flux.StatisticsFilterConf{
		{
			Measurement: "request",
			AggregateFn: "sum()",
			Fields:      []string{"total", "request", "response", "input_token", "output_token"},
		},
		{
			Measurement: "proxy",
			AggregateFn: "sum()",
			Fields:      []string{"p_total"},
		},
	}

	results, err := e.fluxQuery.CommonStatistics(ctx, e.openApi, newStartTime, end, bucket, groupBy, filters, statisticsConf, limit)
	if err != nil {
		return nil, err
	}
	topN := make([]*monitor.TopN, 0, len(results))
	for key, result := range results {
		n := new(monitor.TopN)
		n.Key = key
		n.Request = result.Total
		n.Token = result.TotalToken
		n.Traffic = result.TotalRequest + result.TotalResponse
		topN = append(topN, n)
	}

	return topN, nil
}

func (e *executor) TokenOverview(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) ([]time.Time, *monitor.TokenOverview, []*monitor.TokenOverview, error) {
	newStartTime, every, windowOffset, bucket := getTimeIntervalAndBucket(start, end)
	filters := formatFilter(wheres)

	requestConditions := []string{"total_token", "input_token", "output_token"}

	dates, requestValues, err := e.fluxQuery.CommonTendency(ctx, e.openApi, newStartTime, end, bucket, "request", filters, requestConditions, every, windowOffset, flux.SumFn)
	if err != nil {
		return nil, nil, nil, err
	}
	//total := requestValues["total_token"]
	//totalLen := len(total)
	input := requestValues["input_token"]
	inputLen := len(input)
	output := requestValues["output_token"]
	outputLen := len(output)
	totalOverview := new(monitor.TokenOverview)
	result := make([]*monitor.TokenOverview, 0, len(dates))
	for i := range dates {
		r := new(monitor.TokenOverview)
		if inputLen > i {
			r.InputToken = input[i]
		}
		if outputLen > i {
			r.OutputToken = output[i]
		}
		r.TotalToken = r.InputToken + r.OutputToken
		totalOverview.InputToken += r.InputToken
		totalOverview.OutputToken += r.OutputToken
		totalOverview.TotalToken += r.TotalToken
		result = append(result, r)
	}
	return dates, totalOverview, result, nil
}

func (e *executor) ConsumerOverview(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) (int64, map[time.Time]int64, error) {
	newStartTime, every, offset, bucket := getTimeIntervalAndBucket(start, end)
	filters := formatFilter(wheres)

	return e.fluxQuery.CommonTendencyTag(ctx, e.openApi, newStartTime, end, bucket, "request", filters, every, offset, "app")

}
