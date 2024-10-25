package entity

var (
	ModelTypeLLM           = "llm"
	ModelTypeTextEmbedding = "text-embedding"
	ModelTypeSpeech2Text   = "speech2text"
	ModelTypeTTS           = "tts"
	ModelTypeModeration    = "moderation"

	LanguageEnglish = "en_US"
	LanguageChinese = "zh_Hans"
)

type Provider struct {
	Provider                 string                   `json:"provider" yaml:"provider"`
	Label                    map[string]string        `json:"label" yaml:"label"`
	Description              map[string]string        `json:"description" yaml:"description"`
	IconSmall                map[string]string        `json:"icon_small" yaml:"icon_small"`
	IconLarge                map[string]string        `json:"icon_large" yaml:"icon_large"`
	Background               string                   `json:"background" yaml:"background"`
	Help                     Help                     `json:"help" yaml:"help"`
	SupportedModelTypes      []string                 `json:"supported_model_types" yaml:"supported_model_types"`
	ProviderCredentialSchema ProviderCredentialSchema `json:"provider_credential_schema" yaml:"provider_credential_schema"`
	Default                  map[string]string        `json:"default" yaml:"default"`
	Address                  string                   `json:"address" yaml:"address"`
	Recommend                bool                     `json:"recommend" yaml:"recommend"`
	Sort                     int                      `json:"sort" yaml:"sort"`
}

type ProviderCredentialSchema struct {
	CredentialFormSchemas []CredentialFormSchema `json:"credential_form_schemas" yaml:"credential_form_schemas"`
}

type CredentialFormSchema struct {
	Variable    string            `json:"variable" yaml:"variable"`
	Label       map[string]string `json:"label" yaml:"label"`
	Type        string            `json:"type" yaml:"type"`
	Required    bool              `json:"required" yaml:"required"`
	Placeholder map[string]string `json:"placeholder" yaml:"placeholder"`
}

type Help struct {
	Title map[string]string `json:"title" yaml:"title"`
	URL   map[string]string `json:"url" yaml:"url"`
}
