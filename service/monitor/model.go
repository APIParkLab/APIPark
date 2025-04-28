package monitor

import "time"

type CreateMonitorProxy struct {
}

type UpdateMonitorProxy struct {
}

type Monitor struct {
	ID       string
	Cluster  string
	Driver   string
	Config   string
	Creator  string
	Updater  string
	CreateAt time.Time
	UpdateAt time.Time
}

type SaveMonitor struct {
	Cluster string
	Driver  string
	Config  string
}

type MonSortType string

type MonCommonInput struct {
	StartTime    int64
	EndTime      int64
	PartitionId  string
	Path         string
	Clusters     []string
	Ip           string
	Keyword      string
	ServiceName  string
	AppId        string
	ApiId        string
	ServiceNames []string
	AppIds       []string
	ApiIds       []string
	PageNum      int
	PageSize     int
	Sort         MonCommonSort
}

type MonCommonSort struct {
	Key MonSortType
	Val bool
}

// MonCommonStatistics 调用统计
type MonCommonStatistics struct {
	ApiId       string //apiID
	ApiName     string //api名称
	ServiceID   string //上游服务ID
	ServiceName string //上游服务名称
	AppName     string //应用名称
	AppId       string //应用ID
	Path        string //路径
	ProxyPath   string //转发路径
	Ip          string //IP
	Node        string //目标节点
	IsRed       bool   //是否标红
	MonCommonData
}

type MonPirMapInfo struct {
	RequestTotal     int `json:"request_total"`   //请求总数
	RequestSuccess   int `json:"request_success"` //请求成功数
	RequestFail      int `json:"request_fail"`    //请求失败数
	RequestStatus5XX int `json:"request_status_5_xx"`
	RequestStatus4XX int `json:"request_status_4_xx"`
	ProxyTotal       int `json:"proxy_total"`   //转发总数
	ProxySuccess     int `json:"proxy_success"` //转发成功数
	ProxyFail        int `json:"proxy_fail"`    //转发失败数
	ProxyStatus5XX   int `json:"proxy_status_5_xx"`
	ProxyStatus4XX   int `json:"proxy_status_4_xx"`
}

type MonInvokeCountTrend struct {
	Date         []time.Time `json:"date"`
	Status5XX    []int64     `json:"status_5_xx"`
	Status4XX    []int64     `json:"status_4_xx"`
	ProxyRate    []float64   `json:"proxy_rate"`
	ProxyTotal   []int64     `json:"proxy_total"`
	RequestRate  []float64   `json:"request_rate"`
	RequestTotal []int64     `json:"request_total"`
}

// MonCommonData 通用字段
type MonCommonData struct {
	ID             string  `json:"id"`
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

type MonProxyData struct {
	ProxyTotal   int64   `json:"proxy_total"`   //转发总数
	ProxySuccess int64   `json:"proxy_success"` //转发成功数
	ProxyRate    float64 `json:"proxy_rate"`    //转发成功率
	StatusFail   int64   `json:"status_fail"`   //失败状态数
	AvgResp      float64 `json:"avg_resp"`      //平均响应时间
	MaxResp      int64   `json:"max_resp"`      //最大响应时间
	MinResp      int64   `json:"min_resp"`      //最小响应时间
	AvgTraffic   float64 `json:"avg_traffic"`   //平均流量
	MaxTraffic   int64   `json:"max_traffic"`   //最大流量
	MinTraffic   int64   `json:"min_traffic"`   //最小流量
}

type MonMessageTrend struct {
	Dates       []time.Time `json:"dates"`
	ReqMessage  []float64   `json:"req_message"`
	RespMessage []float64   `json:"resp_message"`
}

type Summary struct {
	Total     int64 `json:"total"`
	Success   int64 `json:"success"`
	Fail      int64 `json:"fail"`
	Status4Xx int64 `json:"status_4xx"`
	Status5Xx int64 `json:"status_5xx"`
}

type MonWhereItem struct {
	Key       string
	Operation string // 表达式，默认为 =，多个为 in，可以用其他
	Values    []string
}
type MonSortBy struct {
	Key  string
	Desc bool
}
type MonStatisticsValue struct {
	MonCommonData
}
type MonTrendFilter struct {
	Name string
	MonWhereItem
}

type MonTrendValues struct {
	Data   []string
	Names  []string
	Values [][]interface{}
}

type StatusCodeOverview struct {
	Status2xx   int64
	Status4xx   int64
	Status5xx   int64
	StatusTotal int64
}

type TokenOverview struct {
	InputToken  int64
	OutputToken int64
	TotalToken  int64
}

type TopN struct {
	Key     string
	Request int64
	Token   int64
	Traffic int64
}

type Aggregate struct {
	Max int64
	Min int64
	Avg int64
}
