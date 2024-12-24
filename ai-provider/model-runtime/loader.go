package model_runtime

import (
	"embed"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/APIParkLab/APIPark/gateway"

	"github.com/eolinker/eosc"
)

func init() {
	Load()
}

type IConfig interface {
	Check(cfg string) error
	GenConfig(target string, origin string) (string, error)
	DefaultConfig() string
}

func NewConfig(cfg string, validator IParamValidator) *Config {
	return &Config{cfg: cfg, validator: validator}
}

type Config struct {
	cfg       string
	validator IParamValidator
}

func (c *Config) Check(cfg string) error {
	data := make(map[string]interface{})
	err := json.Unmarshal([]byte(cfg), &data)
	if err != nil {
		return err
	}
	return c.validator.Valid(data)
}

func (c *Config) GenConfig(target string, origin string) (string, error) {
	if target == "" {
		target = "{}"
	}
	if origin == "" {
		origin = "{}"
	}
	var targetData map[string]interface{}

	err := json.Unmarshal([]byte(target), &targetData)
	if err != nil {
		return "", err
	}
	var originData map[string]interface{}
	err = json.Unmarshal([]byte(origin), &originData)
	if err != nil {
		return "", err
	}
	return c.validator.GenConfig(targetData, originData)
}

func (c *Config) DefaultConfig() string {
	return c.cfg
}

const (
	DirAssets = "assets"
)

var (
	//go:embed model-providers/*
	providerDir embed.FS
)

func Load() error {
	files, err := providerDir.ReadDir("model-providers")
	if err != nil {
		return err
	}
	for _, file := range files {
		if !file.IsDir() {
			continue
		}
		name := fmt.Sprintf("model-providers/%s", file.Name())
		err = LoadProvider(name)
		if err != nil {
			return err
		}
	}
	return nil
}

func LoadProvider(name string) error {
	files, err := providerDir.ReadDir(name)
	if err != nil {
		return err
	}
	var providerFile string
	models := make(map[string]eosc.Untyped[string, string])
	for _, file := range files {
		if file.IsDir() {
			result, err := ReadFile(providerDir, fmt.Sprintf("%s/%s", name, file.Name()))
			if err != nil {
				return err
			}
			models[file.Name()] = result
			continue
		}
		if strings.HasSuffix(file.Name(), ".yaml") {
			data, err := providerDir.ReadFile(fmt.Sprintf("%s/%s", name, file.Name()))
			if err != nil {
				return err
			}
			providerFile = string(data)
		}
	}
	provider, err := NewProvider(providerFile, models)
	if err != nil {
		return err
	}
	gateway.RegisterDynamicResourceDriver(provider.ID(), gateway.Worker{
		Profession: gateway.ProfessionAIProvider,
		Driver:     provider.ID(),
	})
	Register(provider.ID(), provider)
	return nil
}

func ReadFile(dir embed.FS, name string) (eosc.Untyped[string, string], error) {

	files, err := dir.ReadDir(name)
	if err != nil {
		return nil, err
	}
	result := eosc.BuildUntyped[string, string]()
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		if !strings.HasSuffix(file.Name(), ".yaml") && !strings.HasSuffix(file.Name(), ".svg") {
			continue
		}
		data, err := dir.ReadFile(fmt.Sprintf("%s/%s", name, file.Name()))
		if err != nil {
			return nil, fmt.Errorf("open file %s error: %w", file.Name(), err)
		}
		result.Set(file.Name(), string(data))
	}
	return result, nil
}
