package log_driver

import (
	"time"
)

type Log struct {
	ID            string
	Service       string
	Method        string
	Url           string
	RemoteIP      string
	Consumer      string
	Authorization string
	RecordTime    time.Time
}

type LogInfo struct {
	ID                string
	ContentType       string
	RequestBody       string
	ProxyBody         string
	ProxyResponseBody string
	ResponseBody      string
}
