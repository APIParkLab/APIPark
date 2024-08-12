package plugin_model

type PluginConfig struct {
	Name   string     `json:"name"`
	Status Status     `json:"status"`
	Config ConfigType `json:"config,omitempty"`
}

type ConfigType map[string]any

type Render map[string]any
