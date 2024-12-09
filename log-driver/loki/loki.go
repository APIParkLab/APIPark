package loki

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/eolinker/eosc/log"

	log_driver "github.com/APIParkLab/APIPark/log-driver"
)

func init() {
	log_driver.RegisterFactory("loki", &factory{})
}

type factory struct {
}

func (f *factory) Create(config string) (log_driver.ILogDriver, map[string]interface{}, error) {

	return NewDriver(config)
}

var (
	client = http.Client{}
)

type Driver struct {
	url     string
	headers map[string]string
}

func NewDriver(config string) (*Driver, map[string]interface{}, error) {
	cfg := new(DriverConfig)
	err := json.Unmarshal([]byte(config), cfg)
	if err != nil {
		return nil, nil, err
	}
	err = cfg.Check()
	if err != nil {
		return nil, nil, err
	}
	headers := map[string]string{}
	for _, h := range cfg.Header {
		headers[h.Key] = h.Value
	}
	return &Driver{
			url:     cfg.URL,
			headers: headers,
		}, map[string]interface{}{
			"url":     cfg.URL,
			"headers": headers,
		}, nil
}

func (d *Driver) LogInfo(clusterId string, id string) (*log_driver.LogInfo, error) {
	if id == "" {
		return nil, fmt.Errorf("id is empty")
	}
	queries := url.Values{}
	queries.Set("query", fmt.Sprintf("{cluster=\"%s\"} | json | request_id = `%s`", clusterId, id))
	now := time.Now()
	start := now.Add(-time.Hour * 24 * 30)
	queries.Set("start", strconv.FormatInt(start.UnixNano(), 10))
	queries.Set("end", strconv.FormatInt(now.UnixNano(), 10))
	queries.Set("limit", "1")
	log.Debug("query is ", queries.Get("query"))

	list, err := send[LogInfo](http.MethodGet, fmt.Sprintf("%s/loki/api/v1/query_range", d.url), d.headers, queries, "")
	if err != nil {
		return nil, err
	}
	if len(list) < 1 || list[0].Stream == nil {
		return nil, fmt.Errorf("no log found")
	}
	stream := list[0].Stream
	return &log_driver.LogInfo{
		ID:                stream.RequestId,
		ContentType:       stream.ContentType,
		RequestBody:       stream.RequestBody,
		ProxyBody:         stream.ProxyBody,
		ProxyResponseBody: stream.ProxyResponseBody,
		ResponseBody:      stream.ResponseBody,
	}, nil
}

func (d *Driver) LogCount(clusterId string, conditions map[string]string, spendHour int64, group string) (map[string]int64, error) {

	cs := make([]string, 0, len(conditions))
	for k, v := range conditions {
		if strings.HasPrefix(k, "#") {
			cs = append(cs, v)
			continue
		}
		cs = append(cs, fmt.Sprintf("%s=\"%s\"", k, v))
	}
	tmpCondition := ""
	if len(conditions) > 0 {
		tmpCondition = "|" + strings.Join(cs, "|")
	}
	queries := url.Values{}
	queries.Set("query", fmt.Sprintf("sum(count_over_time({cluster=\"%s\"} | json %s [%dh])) by (%s)", clusterId, tmpCondition, spendHour, group))
	sendRequestTime := time.Now()
	list, err := send[LogCount](http.MethodGet, fmt.Sprintf("%s/loki/api/v1/query", d.url), d.headers, queries, "")
	if err != nil {
		return nil, err
	}
	log.DebugF("send request spend time: %v", time.Now().Sub(sendRequestTime))
	log.Debug("query is ", queries.Get("query"))
	result := make(map[string]int64)
	for _, l := range list {
		if len(l.Value) != 2 {
			continue
		}
		value, ok := l.Value[1].(string)
		if !ok {
			continue
		}
		v, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			continue
		}
		result[l.Metric[group]] = v
	}
	return result, nil
}

func (d *Driver) Logs(clusterId string, conditions map[string]string, start time.Time, end time.Time, limit int64, offset int64) ([]*log_driver.Log, int64, error) {
	if start.After(end) {
		return nil, 0, fmt.Errorf("start time is greater than end time")
	}
	if len(conditions) < 1 {
		return nil, 0, fmt.Errorf("conditions is empty")
	}
	if offset < 1 {
		offset = 1
	}
	if limit < 1 {
		limit = 15
	}
	count, err := d.logCount(clusterId, conditions, start, end)
	if err != nil {
		return nil, 0, err
	}
	if count == 0 {
		return nil, 0, nil
	}
	if count < (offset-1)*limit {
		return nil, 0, fmt.Errorf("offset is greater than count")
	}
	cs := make([]string, 0, len(conditions))
	for k, v := range conditions {
		if strings.HasPrefix(k, "#") {
			cs = append(cs, v)
			continue
		}
		cs = append(cs, fmt.Sprintf("%s=~\"%s\"", k, v))
	}
	queries := url.Values{}
	queries.Set("query", fmt.Sprintf("{cluster=\"%s\"} | json | %s", clusterId, strings.Join(cs, " | ")))
	queries.Set("limit", strconv.FormatInt(limit, 10))
	queries.Set("direction", "backward")
	queries.Set("start", strconv.FormatInt(start.UnixNano(), 10))
	log.Debug("query is ", queries.Get("query"))
	logs, err := d.recuseLogs(queries, end, offset)
	if err != nil {
		return nil, 0, err
	}

	return logs, count, nil
}

func (d *Driver) recuseLogs(queries url.Values, end time.Time, offset int64) ([]*log_driver.Log, error) {
	queries.Set("end", strconv.FormatInt(end.UnixNano(), 10))
	list, err := send[LogInfo](http.MethodGet, fmt.Sprintf("%s/loki/api/v1/query_range", d.url), d.headers, queries, "")
	if err != nil {
		return nil, err
	}
	if len(list) < 1 {
		return nil, nil
	}
	if offset > 1 {
		// 获取list最后一个元素的时间戳
		last := list[len(list)-1].Stream
		if last == nil {
			return nil, fmt.Errorf("last log is empty")
		}
		msec, err := strconv.ParseInt(last.Msec, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("parse last log time error: %v", err)
		}
		return d.recuseLogs(queries, time.UnixMilli(msec), offset-1)
	}
	logs := make([]*log_driver.Log, 0, len(list))
	for _, l := range list {
		if l.Stream == nil {
			continue
		}
		detail := l.Stream
		msec, _ := strconv.ParseInt(detail.Msec, 10, 64)

		logs = append(logs, &log_driver.Log{
			ID:            detail.RequestId,
			Service:       detail.Provider,
			Method:        detail.RequestMethod,
			Url:           detail.RequestUri,
			RemoteIP:      detail.SrcIp,
			Consumer:      detail.Application,
			Authorization: detail.Authorization,
			RecordTime:    time.UnixMilli(msec),
		})
	}
	sort.Slice(logs, func(i, j int) bool {
		return logs[i].RecordTime.After(logs[j].RecordTime)
	})
	return logs, nil
}

func (d *Driver) logCount(clusterId string, conditions map[string]string, start time.Time, end time.Time) (int64, error) {
	// 先查在这段时间内符合条件的日志数量
	queries := url.Values{}
	queries.Add("start", strconv.FormatInt(start.UnixNano(), 10))
	queries.Add("end", strconv.FormatInt(end.UnixNano(), 10))
	cs := make([]string, 0, len(conditions))
	for k, v := range conditions {
		if strings.HasPrefix(k, "#") {
			cs = append(cs, v)
			continue
		}
		cs = append(cs, fmt.Sprintf("%s=\"%s\"", k, v))
	}
	tmpCondition := ""
	if len(conditions) > 0 {
		tmpCondition = "|" + strings.Join(cs, "|")
	}
	queries.Set("query", fmt.Sprintf("sum(count_over_time({cluster=\"%s\"} | json %s [720h]))", clusterId, tmpCondition))
	list, err := send[LogCount](http.MethodGet, fmt.Sprintf("%s/loki/api/v1/query", d.url), d.headers, queries, "")
	if err != nil {
		return 0, err
	}
	if len(list) < 1 || len(list[0].Value) < 2 {
		return 0, nil
	}
	value, ok := list[0].Value[1].(string)
	if !ok {
		return 0, nil
	}
	v, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		return 0, err
	}
	return v, nil
}

func send[T any](method string, uri string, headers map[string]string, queries url.Values, body string) ([]*T, error) {
	if queries != nil && len(queries) > 0 {
		uri = fmt.Sprintf("%s?%s", uri, queries.Encode())
	}
	req, err := http.NewRequest(method, uri, strings.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w,uri is %s", err, uri)
	}
	for key, value := range headers {
		req.Header.Set(key, value)
	}
	log.DebugF("do request: %s", uri)
	doRequestTime := time.Now()
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	log.DebugF("do request spend time: %v", time.Now().Sub(doRequestTime))
	defer resp.Body.Close()
	respData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode > 399 {
		return nil, fmt.Errorf("failed to send request: %s,body is %s", resp.Status, string(respData))
	}

	result := new(Response[T])
	err = json.Unmarshal(respData, result)
	if err != nil {
		return nil, fmt.Errorf("failed to decode response: %w,body is %s", err, string(respData))
	}
	return result.Data.Result, nil
}
