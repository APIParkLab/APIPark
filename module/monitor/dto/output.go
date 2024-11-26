package monitor_dto

import (
	"time"

	"github.com/APIParkLab/APIPark/service/monitor"

	"github.com/eolinker/go-common/auto"
)

type ApiStatisticItem struct {
	*ApiStatisticBasicItem
	IsRed bool `json:"is_red"` //是否标红
}

type ApiStatisticBasicItem struct {
	Id      string     `json:"id"`   //apiID
	Name    string     `json:"name"` //api名称
	Path    string     `json:"path"`
	Service auto.Label `json:"service" aolabel:"service"`
	*MonCommonData
}

type ServiceStatisticItem struct {
	*ServiceStatisticBasicItem
	IsRed bool `json:"is_red"` //是否标红
}

type ServiceStatisticBasicItem struct {
	Id   string `json:"id"`   //订阅方ID
	Name string `json:"name"` //订阅方名称
	*MonCommonData
}

// MonSummaryOutput 请求/转发统计
type MonSummaryOutput struct {
	Total     int64 `json:"total"`      // 请求总数
	Success   int64 `json:"success"`    //请求成功数
	Fail      int64 `json:"fail"`       //请求失败数
	Status4Xx int64 `json:"status_4xx"` //状态码4xx数
	Status5Xx int64 `json:"status_5xx"` //状态码5xx数
}

func ToMonSummaryOutput(output *monitor.Summary) *MonSummaryOutput {
	return &MonSummaryOutput{
		Total:     output.Total,
		Success:   output.Success,
		Fail:      output.Fail,
		Status4Xx: output.Status4Xx,
		Status5Xx: output.Status5Xx,
	}
}

type MonMessageTrend struct {
	Dates       []time.Time `json:"dates"`
	ReqMessage  []float64   `json:"req_message"`
	RespMessage []float64   `json:"resp_message"`
}

func ToMonMessageTrend(item *monitor.MonMessageTrend) *MonMessageTrend {
	return &MonMessageTrend{
		Dates:       item.Dates,
		ReqMessage:  item.ReqMessage,
		RespMessage: item.RespMessage,
	}
}

// MonCommonData 通用字段
type MonCommonData struct {
	RequestTotal   int64   `json:"request_total"`   //请求总数
	RequestSuccess int64   `json:"request_success"` //请求成功数
	RequestRate    float64 `json:"request_rate"`    //请求成功率
	ProxyTotal     int64   `json:"proxy_total"`     //转发总数
	ProxySuccess   int64   `json:"proxy_success"`   //转发成功数
	ProxyRate      float64 `json:"proxy_rate"`      //转发成功率
	StatusFail     int64   `json:"status_fail"`     //失败状态数
	AvgResp        float64 `json:"avg_resp"`        //平均响应时间
	MaxResp        int64   `json:"max_resp"`        //最大响应时间
	MinResp        int64   `json:"min_resp"`        //最小响应时间
	AvgTraffic     float64 `json:"avg_traffic"`     //平均流量
	MaxTraffic     int64   `json:"max_traffic"`     //最大流量
	MinTraffic     int64   `json:"min_traffic"`     //最小流量
}

func ToMonCommonData(item monitor.MonCommonData) *MonCommonData {
	return &MonCommonData{
		RequestTotal:   item.RequestTotal,
		RequestSuccess: item.RequestSuccess,
		RequestRate:    item.RequestRate,
		ProxyTotal:     item.ProxyTotal,
		ProxySuccess:   item.ProxySuccess,
		ProxyRate:      item.ProxyRate,
		StatusFail:     item.StatusFail,
		AvgResp:        item.AvgResp,
		MaxResp:        item.MaxResp,
		MinResp:        item.MinResp,
		AvgTraffic:     item.AvgTraffic,
		MaxTraffic:     item.MaxTraffic,
		MinTraffic:     item.MinTraffic,
	}
}

type MonInvokeCountTrend struct {
	Date         []time.Time `json:"date"`
	Status5XX    []int64     `json:"status_5xx"`
	Status4XX    []int64     `json:"status_4xx"`
	ProxyRate    []float64   `json:"proxy_rate"`
	ProxyTotal   []int64     `json:"proxy_total"`
	RequestRate  []float64   `json:"request_rate"`
	RequestTotal []int64     `json:"request_total"`
}

func ToMonInvokeCountTrend(item *monitor.MonInvokeCountTrend) *MonInvokeCountTrend {
	return &MonInvokeCountTrend{
		Date:         item.Date,
		Status5XX:    item.Status5XX,
		Status4XX:    item.Status4XX,
		ProxyRate:    item.ProxyRate,
		ProxyTotal:   item.ProxyTotal,
		RequestRate:  item.RequestRate,
		RequestTotal: item.RequestTotal,
	}
}

type MonMessageChart struct {
	Date     []time.Time `json:"date"`
	Request  []float64   `json:"request"`
	Response []float64   `json:"response"`
}

type MonitorConfig struct {
	Driver string                 `json:"driver"`
	Config map[string]interface{} `json:"config"`
}

type MonitorCluster struct {
	Id     string `json:"id"`
	Name   string `json:"name"`
	Enable bool   `json:"enable"`
}
