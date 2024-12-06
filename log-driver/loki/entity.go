package loki

import (
	"fmt"
	"net/url"
)

type DriverConfig struct {
	URL    string   `json:"url"`
	Header []*Param `json:"headers"`
}

type Param struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

func (d *DriverConfig) Check() error {
	if d.URL == "" {
		return fmt.Errorf("url is empty")
	}
	u, err := url.Parse(d.URL)
	if err != nil {
		return err
	}
	if u.Host == "" {
		return fmt.Errorf("host is empty")
	}
	if u.Scheme == "" {
		u.Scheme = "http"
	}
	d.URL = fmt.Sprintf("%s://%s", u.Scheme, u.Host)
	return nil
}

type Response[T any] struct {
	Data   *Data[T] `json:"data"`
	Status string   `json:"status"`
}

type Data[T any] struct {
	ResultType string `json:"resultType"`
	Result     []*T   `json:"result"`
}

type LogCount struct {
	Metric map[string]string `json:"metric"`
	Value  []interface{}     `json:"value"`
}

type LogInfo struct {
	Stream *LogDetail `json:"stream"`
}

type LogDetail struct {
	Api               string `json:"api"`
	Application       string `json:"application"`
	Strategy          string `json:"strategy"`
	ContentType       string `json:"content_type"`
	Cluster           string `json:"cluster"`
	Msec              string `json:"msec"`
	Node              string `json:"node"`
	RequestId         string `json:"request_id"`
	RequestMethod     string `json:"request_method"`
	RequestScheme     string `json:"request_scheme"`
	RequestTime       string `json:"request_time"`
	RequestUri        string `json:"request_uri"`
	RequestBody       string `json:"request_body"`
	ProxyBody         string `json:"proxy_body"`
	ResponseBody      string `json:"response_body"`
	ProxyResponseBody string `json:"proxy_response_body"`
	Service           string `json:"service"`
	Provider          string `json:"provider"`
	Authorization     string `json:"authorization"`
	SrcIp             string `json:"src_ip"`
	Status            string `json:"status"`
}
