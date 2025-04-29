package flux

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/APIParkLab/APIPark/common"
	"github.com/eolinker/eosc/log"
	"github.com/influxdata/influxdb-client-go/v2/api"
)

type IFluxQuery interface {
	CommonStatistics(ctx context.Context, queryApi api.QueryAPI, start, end time.Time, bucket, groupBy, filters string, statisticsConf []*StatisticsFilterConf, limit int) (map[string]*FluxStatistics, error)
	CommonProxyStatistics(ctx context.Context, queryApi api.QueryAPI, start, end time.Time, bucket, groupBy, filters string, statisticsConf []*StatisticsFilterConf, limit int) (map[string]*FluxStatistics, error)
	CommonTendency(ctx context.Context, queryApi api.QueryAPI, start, end time.Time, bucket, table, filters string, dataFields []string, every, windowOffset string, fn AggregateFn) ([]time.Time, map[string][]int64, error)
	// CommonQueryOnce 查询只返回一条结果
	CommonQueryOnce(ctx context.Context, queryApi api.QueryAPI, start, end time.Time, bucket, filters string, fieldsConf *StatisticsFilterConf) (map[string]interface{}, error)
	CommonWarnStatistics(ctx context.Context, queryApi api.QueryAPI, start, end time.Time, bucket, groupBy, filters string, statisticsConf *StatisticsFilterConf) (map[string]*FluxWarnStatistics, error)
}

type fluxQuery struct {
}

// CommonStatistics flux查询统计
func (f *fluxQuery) CommonStatistics(ctx context.Context, queryApi api.QueryAPI, start, end time.Time, bucket, groupBy, filters string, statisticsConf []*StatisticsFilterConf, limit int) (map[string]*FluxStatistics, error) {
	//拼装请求
	query := f.assembleStatisticsFlux(start, end, bucket, groupBy, filters, statisticsConf, "total", limit)

	log.Info("flux sql=", query)
	result, err := queryApi.Query(ctx, query)
	if err != nil {
		log.Error("flux err=", err)
		return nil, err
	}

	tempMap := make(map[string]map[string]interface{})
	for result.Next() {
		key := ""
		if v, ok := result.Record().Values()[groupBy]; ok {
			if v == nil {
				continue
			}
			key = v.(string)
		}
		tempMap[key] = result.Record().Values()
	}
	result.Close()

	resultMap := make(map[string]*FluxStatistics)
	//拼装返回参数
	for key, maps := range tempMap {
		total := common.FmtIntFromInterface(maps["total"])
		success := common.FmtIntFromInterface(maps["success"])
		pTotal := common.FmtIntFromInterface(maps["p_total"])
		pSuccess := common.FmtIntFromInterface(maps["p_success"])
		totalTiming := common.FmtIntFromInterface(maps["timing"])
		maxMinTiming := common.FmtIntFromInterface(maps["timing_max"])
		minTiming := common.FmtIntFromInterface(maps["timing_min"])
		totalRequest := common.FmtIntFromInterface(maps["request"])
		maxRequest := common.FmtIntFromInterface(maps["request_max"])
		minRequest := common.FmtIntFromInterface(maps["request_min"])
		totalToken := common.FmtIntFromInterface(maps["total_token"])
		maxToken := common.FmtIntFromInterface(maps["total_token_max"])
		minToken := common.FmtIntFromInterface(maps["total_token_min"])

		resultMap[key] = &FluxStatistics{
			Total:        total,
			Success:      success,
			ProxyTotal:   pTotal,
			ProxySuccess: pSuccess,
			TotalTiming:  totalTiming,
			MaxTiming:    maxMinTiming,
			MinTiming:    minTiming,
			TotalRequest: totalRequest,
			RequestMax:   maxRequest,
			RequestMin:   minRequest,
			TotalToken:   totalToken,
			TokenMax:     maxToken,
			TokenMin:     minToken,
		}
	}

	return resultMap, nil
}

// CommonProxyStatistics flux查询统计(只查转发表)
func (f *fluxQuery) CommonProxyStatistics(ctx context.Context, queryApi api.QueryAPI, start, end time.Time, bucket, groupBy, filters string, statisticsConf []*StatisticsFilterConf, limit int) (map[string]*FluxStatistics, error) {
	//拼装请求
	query := f.assembleStatisticsFlux(start, end, bucket, groupBy, filters, statisticsConf, "p_total", limit)

	log.Info("flux sql=", query)
	result, err := queryApi.Query(ctx, query)
	if err != nil {
		log.Error("flux err=", err)
		return nil, err
	}

	tempMap := make(map[string]map[string]interface{})
	for result.Next() {
		key := ""
		if v, ok := result.Record().Values()[groupBy]; ok {
			key = v.(string)
		}
		tempMap[key] = result.Record().Values()
	}
	result.Close()

	resultMap := make(map[string]*FluxStatistics)
	//拼装返回参数
	for key, maps := range tempMap {
		pTotal := common.FmtIntFromInterface(maps["p_total"])
		pSuccess := common.FmtIntFromInterface(maps["p_success"])
		totalTiming := common.FmtIntFromInterface(maps["p_timing"])
		maxMinTiming := common.FmtIntFromInterface(maps["p_timing_max"])
		minTiming := common.FmtIntFromInterface(maps["p_timing_min"])
		totalRequest := common.FmtIntFromInterface(maps["p_request"])
		maxRequest := common.FmtIntFromInterface(maps["p_request_max"])
		minRequest := common.FmtIntFromInterface(maps["p_request_min"])

		resultMap[key] = &FluxStatistics{
			ProxyTotal:   pTotal,
			ProxySuccess: pSuccess,
			TotalTiming:  totalTiming,
			MaxTiming:    maxMinTiming,
			MinTiming:    minTiming,
			TotalRequest: totalRequest,
			RequestMax:   maxRequest,
			RequestMin:   minRequest,
		}
	}

	return resultMap, nil
}

func (f *fluxQuery) CommonTendency(ctx context.Context, queryApi api.QueryAPI, start, end time.Time, bucket, table, filters string, dataFields []string, every, windowOffset string, fn AggregateFn) ([]time.Time, map[string][]int64, error) {
	fieldConditions := f.assembleTendencyFieldCondition(dataFields)
	//拼装请求
	query := f.assembleTendencyFlux(start, end, bucket, table, filters, fieldConditions, every, windowOffset, fn)

	log.Info("flux sql=", query)
	result, err := queryApi.Query(ctx, query)
	if err != nil {
		log.Error("flux err=", err)
		return nil, nil, err
	}
	defer result.Close()

	resultList := make([]map[string]interface{}, 0, 10)
	for result.Next() {
		resultList = append(resultList, result.Record().Values())
	}
	//初始返回内容
	dates := make([]time.Time, 0, len(resultList))
	resultMap := make(map[string][]int64, len(dataFields))
	for _, res := range resultList {
		for _, field := range dataFields {
			resultMap[field] = append(resultMap[field], common.FmtIntFromInterface(res[field]))
		}
		t, _ := res["_time"].(time.Time)
		dates = append(dates, t.In(time.Local))
	}

	return dates, resultMap, nil
}

func (f *fluxQuery) CommonQueryOnce(ctx context.Context, queryApi api.QueryAPI, start, end time.Time, bucket, filters string, fieldsConf *StatisticsFilterConf) (map[string]interface{}, error) {
	query := f.getCircularMapFlux(start, end, bucket, filters, fieldsConf)

	log.Info("flux sql=", query)
	result, err := queryApi.Query(ctx, query)
	if err != nil {
		log.Error("flux err=", err)
		return nil, err
	}

	for result.Next() {
		return result.Record().Values(), nil
	}
	//当某个时间段没有记录时，会返回空
	return map[string]interface{}{}, nil
}

// CommonWarnStatistics flux查询统计(告警数据用)
func (f *fluxQuery) CommonWarnStatistics(ctx context.Context, queryApi api.QueryAPI, start, end time.Time, bucket, groupBy, filters string, statisticsConf *StatisticsFilterConf) (map[string]*FluxWarnStatistics, error) {
	//拼装请求
	query := f.assembleWarnStatisticsFlux(start, end, bucket, groupBy, filters, statisticsConf)

	log.Info("flux sql=", query)
	result, err := queryApi.Query(ctx, query)
	if err != nil {
		log.Error("flux err=", err)
		return nil, err
	}

	tempMap := make(map[string]map[string]interface{})
	for result.Next() {
		key := ""
		if v, ok := result.Record().Values()[groupBy]; ok {
			key = v.(string)
		}
		tempMap[key] = result.Record().Values()
	}
	result.Close()

	resultMap := make(map[string]*FluxWarnStatistics)

	//拼装返回参数
	for key, maps := range tempMap {
		resultMap[key] = f.warnFormatFluxResults(maps, statisticsConf.Fields)
	}

	return resultMap, nil
}

// warnFormatFluxResults 格式化告警查询统计的返回数据
func (f *fluxQuery) warnFormatFluxResults(results map[string]interface{}, fields []string) *FluxWarnStatistics {
	result := &FluxWarnStatistics{}
	for _, field := range fields {
		switch field {
		case "total":
			result.Total = common.FmtIntFromInterface(results[field])
		case "success":
			result.Success = common.FmtIntFromInterface(results[field])
		case "s4xx":
			result.S4xx = common.FmtIntFromInterface(results[field])
		case "s5xx":
			result.S5xx = common.FmtIntFromInterface(results[field])
		case "p_total":
			result.ProxyTotal = common.FmtIntFromInterface(results[field])
		case "p_success":
			result.ProxySuccess = common.FmtIntFromInterface(results[field])
		case "p_s4xx":
			result.ProxyS4xx = common.FmtIntFromInterface(results[field])
		case "p_s5xx":
			result.ProxyS5xx = common.FmtIntFromInterface(results[field])
		case "request":
			result.TotalRequest = common.FmtIntFromInterface(results[field])
		case "response":
			result.TotalResponse = common.FmtIntFromInterface(results[field])
		case "timing":
			result.TotalTiming = common.FmtIntFromInterface(results[field])
		}
	}
	return result
}

func (f *fluxQuery) assembleStatisticsFlux(start, end time.Time, bucket, groupBy, filters string, statisticsConf []*StatisticsFilterConf, sortBy string, limit int) string {
	limitStr := ""
	if limit > 0 {
		//按请求量降序
		limitStr = fmt.Sprintf(`|> group() |> sort(columns: ["%s"], desc: true) |> limit(n: %d) `, sortBy, limit)
	}

	streams := make([]string, 0, len(statisticsConf))
	for _, conf := range statisticsConf {
		//拼装过滤的_field
		fields := make([]string, 0, len(conf.Fields))
		for _, field := range conf.Fields {
			fields = append(fields, fmt.Sprintf(` r["_field"] == "%s" `, field))
		}
		//拼装union所需的数据流
		streams = append(streams, fmt.Sprintf(`
from(bucket: "%s")
  	|> range(start: %d, stop: %d)
  	|> filter(fn: (r) => r["_measurement"] == "%s")
	%s
	|> filter(fn: (r) =>%s)
    |> group(columns:["%s","_field"])|> %s
`, bucket, start.Unix(), end.Unix(), conf.Measurement, filters, strings.Join(fields, "or"), groupBy, conf.AggregateFn))
	}

	return fmt.Sprintf(`
union(tables: [
%s
])
|> pivot(rowKey: ["%s"], columnKey: ["_field"], valueColumn: "_value")
%s
`, strings.Join(streams, ",\n"), groupBy, limitStr)
}

type AggregateFn string

const (
	SumFn AggregateFn = "sum"
	MaxFn AggregateFn = "max"
	MinFn AggregateFn = "min"
	AvgFn AggregateFn = "mean"
)

var (
	fns = map[AggregateFn]struct{}{
		SumFn: {},
		MaxFn: {},
		MinFn: {},
	}
)

func (f *fluxQuery) assembleTendencyFlux(start, end time.Time, bucket, table, filters, fieldConditions, every, windowOffset string, fn AggregateFn) string {
	windowOffsetFlux := ""
	if windowOffset != "" {
		windowOffsetFlux = fmt.Sprintf(", offset: %s", windowOffset)
	}
	if _, ok := fns[fn]; !ok {
		fn = SumFn
	}

	return fmt.Sprintf(`from(bucket: "%s")
  |> range(start: %d, stop: %d)
  |> filter(fn: (r) => r["_measurement"] == "%s")
  %s
  %s
  |> group(columns: ["_field"])
  |> aggregateWindow(every: %s, fn: %s, location: {offset: 0ns, zone: "Asia/Shanghai"}, timeSrc: "_start"%s)
  |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")`, bucket, start.Unix(), end.Unix(), table,
		filters, fieldConditions, every, string(fn), windowOffsetFlux)

}

// assembleTendencyFieldCondition 封装趋势图需要的Field数据
func (f *fluxQuery) assembleTendencyFieldCondition(fieldConditions []string) string {
	/*
		比如输入 {"total","success","s4xx","s5xx"}
		返回  |> filter(fn: (r) => r["_field"] == "total" or r["_field"] == "success" or r["_field"] == "s4xx" or r["_field"] == "s5xx")
	*/
	fields := make([]string, 0, len(fieldConditions))
	for _, field := range fieldConditions {
		fields = append(fields, fmt.Sprintf(` r["_field"] == "%s" `, field))
	}
	return fmt.Sprintf(`|> filter(fn: (r) => %s )`, strings.Join(fields, "or"))
}

// 饼状图flux
func (f *fluxQuery) getCircularMapFlux(start, end time.Time, bucket, filters string, fieldsConf *StatisticsFilterConf) string {
	fields := make([]string, 0, len(fieldsConf.Fields))
	for _, field := range fieldsConf.Fields {
		fields = append(fields, fmt.Sprintf(` r["_field"] == "%s" `, field))
	}

	return fmt.Sprintf(`
from(bucket: "%s")
  |> range(start: %d, stop: %d)
  |> filter(fn: (r) => r["_measurement"] == "%s")
  %s
  |> filter(fn: (r) =>%s)
  |> group(columns:["_field"])
  |> %s
  |> pivot(rowKey: ["_start"], columnKey: ["_field"], valueColumn: "_value")`, bucket, start.Unix(), end.Unix(), fieldsConf.Measurement, filters, strings.Join(fields, "or"), fieldsConf.AggregateFn)
}

// assembleWarnStatisticsFlux 组装告警用的统计flux
func (f *fluxQuery) assembleWarnStatisticsFlux(start, end time.Time, bucket, groupBy, filters string, statisticsConf *StatisticsFilterConf) string {

	//拼装过滤的_field
	fields := make([]string, 0, len(statisticsConf.Fields))
	for _, field := range statisticsConf.Fields {
		fields = append(fields, fmt.Sprintf(` r["_field"] == "%s" `, field))
	}
	//拼装union所需的数据流
	return fmt.Sprintf(`
from(bucket: "%s")
  	|> range(start: %d, stop: %d)
  	|> filter(fn: (r) => r["_measurement"] == "%s")
	%s
	|> filter(fn: (r) =>%s)
    |> group(columns:["%s","_field"])
	|> %s
	|> pivot(rowKey: ["%s"], columnKey: ["_field"], valueColumn: "_value")
`, bucket, start.Unix(), end.Unix(), statisticsConf.Measurement, filters, strings.Join(fields, "or"), groupBy, statisticsConf.AggregateFn, groupBy)

}
