package ai_dto

type UpdateLLM struct {
	LLM string `json:"llm"`
}

type UpdateConfig struct {
	DefaultLLM string `json:"default_llm"`
	Config     string `json:"config"`
	Priority   *int   `json:"priority"`
	Enable     *bool  `json:"enable"`
}

type Sort struct {
	Providers []string `json:"providers"`
}
