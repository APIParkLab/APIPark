package dynamic_module_dto

type CreateDynamicModule struct {
	Id          string                 `json:"id"`
	Name        string                 `json:"title"`
	Driver      string                 `json:"driver"`
	Description string                 `json:"description"`
	Config      map[string]interface{} `json:"config"`
}

//type PartitionConfig map[string]interface{}

type EditDynamicModule struct {
	Name        *string                 `json:"title"`
	Description *string                 `json:"description"`
	Config      *map[string]interface{} `json:"config"`
}

type ClusterInput struct {
	Clusters []string `json:"clusters" aocheck:"cluster"`
}
