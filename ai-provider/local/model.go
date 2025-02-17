package ai_provider_local

import (
	"embed"
	"encoding/json"
	"strings"

	"github.com/eolinker/eosc/log"
)

var (
	//go:embed models.json
	modelsFs        embed.FS
	modelCanInstall []ModelDetail
	modelVersion    string
	modelTags       = make(map[string][]ModelDetail)
)

type ModelConfig struct {
	Models  []ModelDetail `json:"models"`
	Version string        `json:"version"`
}

type ModelDetail struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Size        string `json:"size"`
	Digest      string `json:"digest"`
	Provider    string `json:"provider"`
	IsPopular   bool   `json:"is_popular"`
	Latest      bool   `json:"latest"`
}

func init() {
	data, err := modelsFs.ReadFile("models.json")
	if err != nil {
		log.Info("read models.json error: ", err)
		return
	}
	var cfg ModelConfig
	err = json.Unmarshal(data, &cfg)
	if err != nil {
		log.Info("unmarshal models.json error: ", err)
		return
	}
	modelVersion = cfg.Version
	modelCanInstall = make([]ModelDetail, 0, len(cfg.Models))
	for _, model := range cfg.Models {
		if _, ok := modelTags[model.Id]; !ok {
			modelTags[model.Id] = make([]ModelDetail, 0)
		}
		names := strings.Split(model.Id, ":")

		modelTags[names[0]] = append(modelTags[names[0]], model)
		if !model.Latest {
			continue
		}
		modelCanInstall = append(modelCanInstall, model)
	}

}

func ModelsCanInstall() ([]ModelDetail, string) {
	return modelCanInstall, modelVersion
}

func ModelsCanInstallById(id string) []ModelDetail {
	return modelTags[id]
}
