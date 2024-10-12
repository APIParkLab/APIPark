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
		return 2
	}
}

func ToServiceType(s int) ServiceType {

	switch s {
	case 1:
		return InnerService
	case 2:
		return PublicService
	default:
		return PublicService
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

const (
	ApprovalTypeAuto   ApprovalType = "auto"
	ApprovalTypeManual ApprovalType = "manual"
)

type ApprovalType string

func (s ApprovalType) String() string {
	return string(s)
}

func (s ApprovalType) Int() int {
	switch s {
	case "auto":
		return 1
	case "manual":
		return 0
	default:
		return 0
	}
}

func ToApprovalType(s int) ApprovalType {
	switch s {
	case 1:
		return "auto"
	case 0:
		return "manual"
	default:
		return "manual"
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
	ApprovalType     ApprovalType
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
		ApprovalType:     ToApprovalType(e.ApprovalType),
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
	ApprovalType     ApprovalType
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
	ApprovalType     *ApprovalType
}

type CreateTag struct {
	Tid string
	Sid string
}
