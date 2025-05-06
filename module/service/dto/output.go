package service_dto

import (
	ai_provider_local "github.com/APIParkLab/APIPark/ai-provider/local"
	"github.com/APIParkLab/APIPark/service/service"
	"github.com/eolinker/go-common/auto"
)

type ServiceState string

const (
	ServiceStateNormal      ServiceState = "normal"
	ServiceStateDeploying   ServiceState = "deploying"
	ServiceStateDeployError ServiceState = "error"
)

func (s ServiceState) String() string {
	return string(s)
}

func (s ServiceState) Int() int {
	switch s {
	case ServiceStateNormal:
		return 0
	case ServiceStateDeploying:
		return 1
	case ServiceStateDeployError:
		return 2
	default:
		return 0
	}
}

func FromServiceState(s int) ServiceState {
	switch s {
	case 0:
		return ServiceStateNormal
	case 1:
		return ServiceStateDeploying
	case 2:
		return ServiceStateDeployError
	default:
		return ""
	}
}

type ServiceItem struct {
	Id          string         `json:"id"`
	Name        string         `json:"name"`
	Team        auto.Label     `json:"team" aolabel:"team"`
	ServiceKind string         `json:"service_kind"`
	ApiNum      int64          `json:"api_num"`
	Description string         `json:"description"`
	CreateTime  auto.TimeLabel `json:"create_time"`
	UpdateTime  auto.TimeLabel `json:"update_time"`
	Provider    *auto.Label    `json:"provider,omitempty" aolabel:"ai_provider"`
	State       string         `json:"state"`
	CanDelete   bool           `json:"can_delete"`
	EnableMCP   bool           `json:"enable_mcp"`
}

type AppItem struct {
	Id                 string         `json:"id"`
	Name               string         `json:"name"`
	Team               auto.Label     `json:"team" aolabel:"team"`
	SubscribeNum       int64          `json:"subscribe_num"`
	SubscribeVerifyNum int64          `json:"subscribe_verify_num"`
	AuthNum            int64          `json:"auth_num"`
	Description        string         `json:"description"`
	CreateTime         auto.TimeLabel `json:"create_time"`
	UpdateTime         auto.TimeLabel `json:"update_time"`
	CanDelete          bool           `json:"can_delete"`
}

type SimpleServiceItem struct {
	Id          string     `json:"id"`
	Name        string     `json:"name"`
	Team        auto.Label `json:"team" aolabel:"team"`
	Description string     `json:"description"`
}

type SimpleAppItem struct {
	Id          string     `json:"id"`
	Name        string     `json:"name"`
	Team        auto.Label `json:"team" aolabel:"team"`
	Description string     `json:"description"`
}

type SubscribeAppItem struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	IsSubscribed bool   `json:"is_subscribed"`
}

type Service struct {
	Id           string         `json:"id"`
	Name         string         `json:"name"`
	Prefix       string         `json:"prefix,omitempty"`
	Description  string         `json:"description"`
	Team         auto.Label     `json:"team" aolabel:"team"`
	CreateTime   auto.TimeLabel `json:"create_time"`
	UpdateTime   auto.TimeLabel `json:"update_time"`
	ServiceType  string         `json:"service_type"`
	Catalogue    auto.Label     `json:"catalogue" aolabel:"catalogue"`
	Tags         []auto.Label   `json:"tags" aolabel:"tag"`
	Logo         string         `json:"logo"`
	Provider     *auto.Label    `json:"provider,omitempty" aolabel:"ai_provider"`
	ProviderType string         `json:"provider_type,omitempty"`
	Model        string         `json:"model,omitempty"`
	ApprovalType string         `json:"approval_type"`
	ServiceKind  string         `json:"service_kind"`
	State        string         `json:"state"`
	ModelMapping string         `json:"model_mapping"`
	AsServer     bool           `json:"as_server"`
	AsApp        bool           `json:"as_app"`
	EnableMCP    bool           `json:"enable_mcp"`
}

type App struct {
	Id          string         `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Team        auto.Label     `json:"team" aolabel:"team"`
	CreateTime  auto.TimeLabel `json:"create_time"`
	UpdateTime  auto.TimeLabel `json:"update_time"`
	AsApp       bool           `json:"as_app"`
}

func ToService(model *service.Service) *Service {
	prefix := "/"
	if model.Prefix != "" {
		prefix = model.Prefix
	}

	s := &Service{
		Id:           model.Id,
		Name:         model.Name,
		Prefix:       prefix,
		Description:  model.Description,
		Team:         auto.UUID(model.Team),
		ServiceType:  model.ServiceType.String(),
		Logo:         model.Logo,
		Catalogue:    auto.UUID(model.Catalogue),
		CreateTime:   auto.TimeLabel(model.CreateTime),
		UpdateTime:   auto.TimeLabel(model.UpdateTime),
		ApprovalType: model.ApprovalType.String(),
		AsServer:     model.AsServer,
		AsApp:        model.AsApp,
		ServiceKind:  model.Kind.String(),
		EnableMCP:    model.EnableMCP,
	}
	state := FromServiceState(model.State)
	if state == ServiceStateNormal {
		s.State = model.ServiceType.String()
	} else {
		s.State = state.String()
	}

	switch model.Kind {
	case service.AIService:
		provider := auto.UUID(model.AdditionalConfig["provider"])
		s.Provider = &provider
		s.ProviderType = "local"
		if provider.Id != ai_provider_local.ProviderLocal {
			s.ProviderType = "online"
		}
		modelId := model.AdditionalConfig["model"]
		if modelId != "" {
			s.Model = modelId
		}
	}
	return s
}

type MemberItem struct {
	User      auto.Label   `json:"user" aolabel:"user"`
	Email     string       `json:"email"`
	Roles     []auto.Label `json:"roles" aolabel:"role"`
	CanDelete bool         `json:"can_delete"`
}

type SimpleMemberItem struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

type TeamMemberToAdd struct {
	Id         string     `json:"id,omitempty"`
	Name       string     `json:"name,omitempty"`
	Email      string     `json:"email,omitempty"`
	Department auto.Label `json:"department" aolabel:"department"`
}

type ServiceDoc struct {
	Id         string         `json:"id"`
	Name       string         `json:"name"`
	Doc        string         `json:"doc"`
	Creator    auto.Label     `json:"creator" aolabel:"user"`
	CreateTime auto.TimeLabel `json:"create_time"`
	Updater    auto.Label     `json:"updater" aolabel:"user"`
	UpdateTime auto.TimeLabel `json:"update_time"`
}

type ExportService struct {
	Id           string   `json:"id"`
	Name         string   `json:"name"`
	Prefix       string   `json:"prefix,omitempty"`
	Description  string   `json:"description"`
	Team         string   `json:"team"`
	ServiceType  string   `json:"service_type"`
	Catalogue    string   `json:"catalogue"`
	Tags         []string `json:"tags"`
	Logo         string   `json:"logo"`
	Doc          string   `json:"doc"`
	ModelMapping string   `json:"model_mapping"`
}

type ExportApp struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Team        string `json:"team"`
}

type Overview struct {
	Id               string     `json:"id"`
	Name             string     `json:"name"`
	Description      string     `json:"description"`
	EnableMCP        bool       `json:"enable_mcp"`
	ServiceKind      string     `json:"service_kind"`
	SubscriberNum    int64      `json:"subscriber_num"`
	InvokeNum        int64      `json:"invoke_num"`
	Logo             string     `json:"logo"`
	AvailableMonitor bool       `json:"available_monitor"`
	IsReleased       bool       `json:"is_released"`
	Catalogue        auto.Label `json:"catalogue" aolabel:"catalogue"`
	APINum           int64      `json:"api_num"`
}

type AILogItem struct {
	Id             string         `json:"id"`
	API            auto.Label     `json:"api" aolabel:"api"`
	Status         int64          `json:"status"`
	LogTime        auto.TimeLabel `json:"log_time"`
	Ip             string         `json:"ip"`
	Token          int64          `json:"token"`
	TokenPerSecond int64          `json:"token_per_second"`
	Consumer       auto.Label     `json:"consumer" aolabel:"service"`
	Provider       auto.Label     `json:"provider" aolabel:"ai_provider"`
	Model          string         `json:"model"`
}
type RestLogItem struct {
	Id           string         `json:"id"`
	API          auto.Label     `json:"api" aolabel:"api"`
	Status       int64          `json:"status"`
	LogTime      auto.TimeLabel `json:"log_time"`
	Ip           string         `json:"ip"`
	Consumer     auto.Label     `json:"consumer" aolabel:"service"`
	ResponseTime string         `json:"response_time"`
	Traffic      string         `json:"traffic"`
}

type RestLogInfo struct {
	Id               string         `json:"id"`
	API              auto.Label     `json:"api" aolabel:"api"`
	Consumer         auto.Label     `json:"consumer" aolabel:"service"`
	IsSystemConsumer bool           `json:"is_system_consumer"`
	Status           int64          `json:"status"`
	Ip               string         `json:"ip"`
	ResponseTime     string         `json:"response_time"`
	Traffic          string         `json:"traffic"`
	LogTime          auto.TimeLabel `json:"log_time"`
	Request          OriginRequest  `json:"request"`
	Response         OriginRequest  `json:"response"`
}

type AILogInfo struct {
	Id               string          `json:"id"`
	API              auto.Label      `json:"api" aolabel:"api"`
	Consumer         auto.Label      `json:"consumer" aolabel:"service"`
	IsSystemConsumer bool            `json:"is_system_consumer"`
	Status           int64           `json:"status"`
	Ip               string          `json:"ip"`
	Provider         auto.Label      `json:"provider" aolabel:"ai_provider"`
	Model            string          `json:"model"`
	LogTime          auto.TimeLabel  `json:"log_time"`
	Request          OriginAIRequest `json:"request"`
	Response         OriginAIRequest `json:"response"`
}

type OriginRequest struct {
	Header string `json:"header"`
	Origin string `json:"origin"`
	Body   string `json:"body"`
}

type OriginAIRequest struct {
	OriginRequest
	Token int64 `json:"token"`
}
