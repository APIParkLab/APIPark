package model_runtime

import (
	"embed"
	"errors"
	"fmt"
	"github.com/eolinker/eosc"
	"strings"
)

var (
	ErrInvalidAPIKey = errors.New("invalid api key")
)

type IConfig interface {
	Check(cfg string) error
	DefaultConfig() string
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
		if !strings.HasSuffix(file.Name(), ".yaml") {
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
