package entity

type AIModel struct {
	Model           string            `json:"model" yaml:"model"`
	Label           map[string]string `json:"label" yaml:"label"`
	ModelType       string            `json:"model_type" yaml:"model_type"`
	Features        []string          `json:"features" yaml:"features"`
	ModelProperties map[string]string `json:"model_properties" yaml:"model_properties"`
	ParameterRules  []ParameterRule   `json:"parameter_rules" yaml:"parameter_rules"`
}

type ParameterRule struct {
	Name      string            `json:"name" yaml:"name"`
	Default   interface{}       `json:"default" yaml:"default"`
	Label     map[string]string `json:"label" yaml:"label"`
	Type      string            `json:"type" yaml:"type"`
	Min       float64           `json:"min" yaml:"min"`
	Max       float64           `json:"max" yaml:"max"`
	Precision int               `json:"precision" yaml:"precision"`
	Required  bool              `json:"required" yaml:"required"`
}
