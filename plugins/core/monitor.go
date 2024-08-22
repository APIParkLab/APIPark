package core

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) monitorStatisticApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/monitor/overview/top10", []string{"context", "body"}, []string{"top10"}, p.monitorStatisticController.Top10),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/monitor/overview/summary", []string{"context", "body"}, []string{"request_summary", "proxy_summary"}, p.monitorStatisticController.Summary),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/monitor/overview/invoke", []string{"context", "body"}, []string{"date", "request_total", "proxy_total", "status_4xx", "status_5xx", "request_rate", "proxy_rate", "time_interval"}, p.monitorStatisticController.OverviewInvokeTrend),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/monitor/overview/message", []string{"context", "body"}, []string{"date", "request_message", "response_message", "time_interval"}, p.monitorStatisticController.OverviewMessageTrend),

		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/monitor/config", []string{"context", "body"}, []string{"info"}, p.monitorConfigController.SaveMonitorConfig),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/monitor/config", []string{"context"}, []string{"info"}, p.monitorConfigController.GetMonitorConfig),
	}
}
