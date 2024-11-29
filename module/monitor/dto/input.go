package monitor_dto

type MonWhereItem struct {
	Key       string
	Operation string // 表达式，默认为 =，多个为 in，可以用其他
	Values    []string
}

const (
	DataTypeApi        = "api"
	DataTypeProvider   = "provider"
	DataTypeSubscriber = "subscriber"
)

type Top10Input struct {
	*CommonInput
	DataType string `json:"data_type"`
}

type CommonInput struct {
	Start int64 `json:"start"`
	End   int64 `json:"end"`
}

type StatisticInput struct {
	Apis     []string `json:"apis"`
	Services []string `json:"services"`
	Path     string   `json:"path"`
	*CommonInput
}

type SaveMonitorConfig struct {
	Driver string                 `json:"driver"`
	Config map[string]interface{} `json:"config"`
}
