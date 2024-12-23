package ai_dto

type Provider struct {
	Id               string         `json:"id"`
	Name             string         `json:"name"`
	Config           string         `json:"config"`
	GetAPIKeyUrl     string         `json:"get_apikey_url"`
	DefaultLLM       string         `json:"defaultLLM"`
	DefaultLLMConfig string         `json:"-"`
	Priority         int            `json:"priority"`
	Status           ProviderStatus `json:"status"`
}

type ConfiguredProviderItem struct {
	Id         string         `json:"id"`
	Name       string         `json:"name"`
	Logo       string         `json:"logo"`
	DefaultLLM string         `json:"default_llm"`
	Status     ProviderStatus `json:"status"`
	APICount   int64          `json:"api_count"`
	KeyCount   int            `json:"key_count"`
	KeyStatus  []string       `json:"key_status"`
	Priority   int            `json:"priority"`
}

type ProviderItem struct {
	Id         string `json:"id"`
	Name       string `json:"name"`
	Logo       string `json:"logo"`
	DefaultLLM string `json:"default_llm"`
	Sort       int    `json:"-"`
}

type SimpleProviderItem struct {
	Id         string `json:"id"`
	Name       string `json:"name"`
	Logo       string `json:"logo"`
	Configured bool   `json:"configured"`
}

type LLMItem struct {
	Id     string   `json:"id"`
	Logo   string   `json:"logo"`
	Config string   `json:"config"`
	Scopes []string `json:"scopes"`
}
