package openAI

import (
	"encoding/json"
	"fmt"
	"github.com/APIParkLab/APIPark/module/ai/provider"
	openai "github.com/sashabaranov/go-openai"
	"net/url"
)

type GlobalConfig struct {
	APIKey  string `json:"api_key"`
	BaseUrl string `json:"base_url"`
}

type GlobalConfigDriver struct {
}

func NewGlobalConfigDriver() provider.IAIConfig {
	return &GlobalConfigDriver{}
}

func (g *GlobalConfigDriver) CheckConfig(cfg string) error {
	var c GlobalConfig
	err := json.Unmarshal([]byte(cfg), &c)
	if err != nil {
		return err
	}
	if c.APIKey == "" {
		return provider.ErrInvalidAPIKey
	}
	if c.APIKey == defaultAPIKey {
		return fmt.Errorf("unconfigued api key")
	}
	if c.BaseUrl != "" {
		u, err := url.Parse(c.BaseUrl)
		if err != nil || u.Scheme == "" || u.Host == "" {
			return fmt.Errorf("invalid base url: %s", c.BaseUrl)
		}
	}
	return nil
}

var defaultAPIKey = "Your Open AI API Key"

func (g *GlobalConfigDriver) DefaultConfig() string {
	return fmt.Sprintf(`{
    "api_key":"%s",
    "base_url":""
}`, defaultAPIKey)
}

func (g *GlobalConfigDriver) MaskConfig(cfg string) string {
	c := new(GlobalConfig)
	err := json.Unmarshal([]byte(cfg), c)
	if err != nil {
		return cfg
	}
	if c.APIKey != defaultAPIKey {
		c.APIKey = provider.PartialMasking(c.APIKey, 5, 15)
	}
	result, _ := json.Marshal(c)
	return string(result)
}

type InvokeConfig struct {
	Temperature      *float32                             `json:"temperature"`
	TopP             *float32                             `json:"top_p"`
	PresencePenalty  *float32                             `json:"presence_penalty"`
	FrequencyPenalty *float32                             `json:"frequency_penalty"`
	MaxTokens        *int                                 `json:"max_tokens"`
	ResponseFormat   *openai.ChatCompletionResponseFormat `json:"response_format"`
}

type InvokeConfigDriver struct {
}

func NewInvokeConfigDriver() provider.IAIConfig {
	return &InvokeConfigDriver{}
}

var validResponseFormat = map[openai.ChatCompletionResponseFormatType]struct{}{
	openai.ChatCompletionResponseFormatTypeText:       {},
	openai.ChatCompletionResponseFormatTypeJSONObject: {},
}

func (i *InvokeConfigDriver) CheckConfig(cfg string) error {
	var c InvokeConfig
	err := json.Unmarshal([]byte(cfg), &c)
	if err != nil {
		return err
	}
	if c.Temperature != nil && (*c.Temperature < 0 || *c.Temperature > 2) {
		return fmt.Errorf("invalid temperature: %f", c.Temperature)
	}
	if c.TopP != nil && (*c.TopP < 0 || *c.TopP > 1) {
		return fmt.Errorf("invalid top_p: %f", c.TopP)
	}
	if c.PresencePenalty != nil && (*c.PresencePenalty < 0 || *c.PresencePenalty > 1) {
		return fmt.Errorf("invalid presence_penalty: %f", c.PresencePenalty)
	}
	if c.FrequencyPenalty != nil && (*c.FrequencyPenalty < 0 || *c.FrequencyPenalty > 1) {
		return fmt.Errorf("invalid frequency_penalty: %f", c.FrequencyPenalty)
	}
	if c.MaxTokens != nil && (*c.MaxTokens < 0) {
		return fmt.Errorf("invalid max_tokens: %d", c.MaxTokens)
	}
	if c.ResponseFormat != nil {
		if _, ok := validResponseFormat[c.ResponseFormat.Type]; !ok {
			return fmt.Errorf("invalid response_format: %v", c.ResponseFormat)
		}
	}

	return nil
}

func (i *InvokeConfigDriver) DefaultConfig() string {
	return `{
    "temperature": 0,
    "top_p": 1,
    "presence_penalty": 0,
    "frequency_penalty": 0,
    "max_tokens": 512,
    "response_format": {
        "type": "json_object"
    }
}`
}

func (i *InvokeConfigDriver) MaskConfig(cfg string) string {
	return cfg
}
