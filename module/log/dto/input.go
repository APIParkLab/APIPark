package log_dto

type Save struct {
	ID      string                 `json:"id"`
	Cluster string                 `json:"cluster"`
	Config  map[string]interface{} `json:"config"`
}
