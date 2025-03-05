package ai_api_dto

type CreateAPI struct {
	Id          string    `json:"id"`
	Name        string    `json:"name"`
	Path        string    `json:"path"`
	Description string    `json:"description"`
	Disable     bool      `json:"disabled"`
	AiPrompt    *AiPrompt `json:"ai_prompt"`
	AiModel     *AiModel  `json:"ai_model"`
	Timeout     int       `json:"timeout"`
	Retry       int       `json:"retry"`
}

type AiPrompt struct {
	Variables []*AiPromptVariable `json:"variables"`
	Prompt    string              `json:"prompt"`
}

type AiPromptVariable struct {
	Key         string `json:"key"`
	Description string `json:"description"`
	Require     bool   `json:"require"`
}

type AiModel struct {
	Id       string `json:"id"`
	Config   string `json:"config"`
	Provider string `json:"provider"`
	Type     string `json:"type"`
}

type EditAPI struct {
	Name        *string   `json:"name"`
	Path        *string   `json:"path"`
	Description *string   `json:"description"`
	Disable     *bool     `json:"disabled"`
	AiPrompt    *AiPrompt `json:"ai_prompt"`
	AiModel     *AiModel  `json:"ai_model"`
	Timeout     *int      `json:"timeout"`
	Retry       *int      `json:"retry"`
}
