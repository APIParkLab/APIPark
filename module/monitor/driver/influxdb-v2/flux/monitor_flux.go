package flux

// FluxStatistics flux统计通用字段
type FluxStatistics struct {
	Total         int64 `json:"total"`           //总数
	Success       int64 `json:"success"`         //成功数
	S2xx          int64 `json:"s2xx"`            //2xx
	ProxyTotal    int64 `json:"p_total"`         //转发总数
	ProxySuccess  int64 `json:"p_success"`       //转发成功数
	TotalTiming   int64 `json:"timing"`          //平均响应时间
	MaxTiming     int64 `json:"timing_max"`      //最大响应时间
	MinTiming     int64 `json:"timing_min"`      //最小响应时间
	TotalRequest  int64 `json:"request"`         //总请求流量
	RequestMax    int64 `json:"request_max"`     //最大流量
	RequestMin    int64 `json:"request_min"`     //最小流量
	TotalResponse int64 `json:"response"`        //总请求流量
	ResponseMax   int64 `json:"response_max"`    //最大流量
	ResponseMin   int64 `json:"response_min"`    //最小流量
	TotalToken    int64 `json:"total_token"`     //总token流量
	TokenMax      int64 `json:"total_token_max"` //最大token流量
	TokenMin      int64 `json:"total_token_min"` //最小token流量
}

// FluxWarnStatistics flux统计告警通用字段
type FluxWarnStatistics struct {
	Total         int64 `json:"total"`   //总数
	Success       int64 `json:"success"` //成功数
	S2xx          int64 `json:"s2xx"`
	S4xx          int64 `json:"s4xx"`
	S5xx          int64 `json:"s5xx"`
	ProxyTotal    int64 `json:"p_total"`   //转发总数
	ProxySuccess  int64 `json:"p_success"` //转发成功数
	ProxyS4xx     int64 `json:"p_s4xx"`
	ProxyS5xx     int64 `json:"p_s5xx"`
	TotalTiming   int64 `json:"timing"`   //平均响应时间
	TotalRequest  int64 `json:"request"`  //总请求流量
	TotalResponse int64 `json:"response"` //总响应流量
}

// StatisticsFilterConf 统计表过滤_field的配置
type StatisticsFilterConf struct {
	Measurement string
	AggregateFn string
	Fields      []string
}
