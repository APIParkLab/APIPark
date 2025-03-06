package ai_model

import (
	"encoding/base64"
	"github.com/APIParkLab/APIPark/stores/ai"
	"time"
)

type ProviderModel struct {
	Id                  string // provider model:uuid
	Name                string
	Type                string
	AccessConfiguration string
	ModelParameters     string
	Provider            string
	Creator             string
	Updater             string
	CreateAt            time.Time
	UpdateAt            time.Time
}

func FromEntity(e *ai.ProviderModel) *ProviderModel {
	accessConfiguration, err := base64.RawStdEncoding.DecodeString(e.AccessConfiguration)
	modelParameters, err := base64.RawStdEncoding.DecodeString(e.ModelParameters)
	if err != nil {
		accessConfiguration = []byte(e.AccessConfiguration)
	}
	if err != nil {
		modelParameters = []byte(e.ModelParameters)
	}
	return &ProviderModel{
		Id:                  e.UUID,
		Name:                e.Name,
		Type:                e.Type,
		AccessConfiguration: string(accessConfiguration),
		ModelParameters:     string(modelParameters),
		Provider:            e.Provider,
		Creator:             e.Creator,
		Updater:             e.Updater,
		CreateAt:            e.CreateAt,
		UpdateAt:            e.UpdateAt,
	}
}

type Model struct {
	Name                *string
	Provider            *string
	Type                *string
	AccessConfiguration *string
	ModelParameters     *string
}
