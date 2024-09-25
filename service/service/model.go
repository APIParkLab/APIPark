package service

import (
	"encoding/json"
	"time"

	"github.com/APIParkLab/APIPark/stores/service"
)

const (
	InnerService   ServiceType = "inner"
	PublicService  ServiceType = "public"
	UnknownService ServiceType = "unknown"
)

type ServiceType string

func (s ServiceType) String() string {
	return string(s)
}

func (s ServiceType) Int() int {
	switch s {
	case InnerService:
		return 1
	case PublicService:
		return 2
	default:
		return 0
	}
}

func ToServiceType(s int) ServiceType {

	switch s {
	case 1:
		return InnerService
	case 2:
		return PublicService
	default:
		return UnknownService
	}
}

type Kind string

const (
	RestService Kind = "rest"
	AIService   Kind = "ai"
)

func (s Kind) String() string {
	return string(s)
}

func (s Kind) Int() int {
	switch s {
	case RestService:
		return 0
	case AIService:
		return 1
	default:
		return 0
	}
}

func ToServiceKind(s int) Kind {
	switch s {
	case 0:
		return RestService
	case 1:
		return AIService
	default:
		return RestService
	}
}

type Service struct {
	Id               string
	Name             string
	Description      string
	Team             string
	Prefix           string
	Logo             string
	ServiceType      ServiceType
	Kind             Kind
	Catalogue        string
	AdditionalConfig map[string]string
	AsServer         bool
	AsApp            bool
	CreateTime       time.Time
	UpdateTime       time.Time
}

func FromEntity(e *service.Service) *Service {
	additionalConfig := make(map[string]string)
	if e.AdditionalConfig != "" {
		_ = json.Unmarshal([]byte(e.AdditionalConfig), &additionalConfig)
	}
	return &Service{
		Id:               e.UUID,
		Name:             e.Name,
		Description:      e.Description,
		Team:             e.Team,
		Prefix:           e.Prefix,
		Logo:             e.Logo,
		ServiceType:      ToServiceType(e.ServiceType),
		Kind:             ToServiceKind(e.Kind),
		Catalogue:        e.Catalogue,
		AsServer:         e.AsServer,
		AsApp:            e.AsApp,
		CreateTime:       e.CreateAt,
		UpdateTime:       e.UpdateAt,
		AdditionalConfig: additionalConfig,
	}
}

type Create struct {
	Id               string
	Name             string
	Description      string
	Team             string
	Prefix           string
	Logo             string
	ServiceType      ServiceType
	Kind             Kind
	Catalogue        string
	AdditionalConfig map[string]string
	AsServer         bool
	AsApp            bool
}

type Edit struct {
	Name             *string
	Description      *string
	ServiceType      *ServiceType
	Kind             *Kind
	Catalogue        *string
	Logo             *string
	AdditionalConfig *map[string]string
}

type CreateTag struct {
	Tid string
	Sid string
}
