package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/APIParkLab/APIPark/common"

	"github.com/mitchellh/mapstructure"

	"github.com/eolinker/go-common/register"

	"github.com/mark3labs/mcp-go/mcp"

	mcp_server "github.com/APIParkLab/APIPark/mcp-server"

	"github.com/APIParkLab/APIPark/service/release"

	"github.com/APIParkLab/APIPark/gateway"

	ai_local "github.com/APIParkLab/APIPark/service/ai-local"
	"github.com/APIParkLab/APIPark/service/cluster"

	model_runtime "github.com/APIParkLab/APIPark/ai-provider/model-runtime"

	"github.com/APIParkLab/APIPark/resources/access"
	log_service "github.com/APIParkLab/APIPark/service/log"
	"github.com/eolinker/eosc/log"
	"github.com/eolinker/go-common/server"

	"github.com/eolinker/ap-account/service/role"

	application_authorization "github.com/APIParkLab/APIPark/service/application-authorization"
	service_model_mapping "github.com/APIParkLab/APIPark/service/service-model-mapping"

	api_doc "github.com/APIParkLab/APIPark/service/api-doc"

	service_tag "github.com/APIParkLab/APIPark/service/service-tag"

	service_doc "github.com/APIParkLab/APIPark/service/service-doc"

	serviceDto "github.com/APIParkLab/APIPark/module/service/dto"

	"github.com/APIParkLab/APIPark/service/tag"

	"github.com/APIParkLab/APIPark/service/service"

	"github.com/APIParkLab/APIPark/service/subscribe"
	"gorm.io/gorm"

	"github.com/APIParkLab/APIPark/service/api"

	"github.com/eolinker/go-common/auto"

	team_member "github.com/APIParkLab/APIPark/service/team-member"

	"github.com/eolinker/go-common/store"

	"github.com/google/uuid"

	"github.com/eolinker/go-common/utils"

	"github.com/APIParkLab/APIPark/service/team"

	service_dto "github.com/APIParkLab/APIPark/module/service/dto"
)

var (
	_ IServiceModule       = (*imlServiceModule)(nil)
	_ IExportServiceModule = (*imlServiceModule)(nil)
)

type imlServiceModule struct {
	serviceService    service.IServiceService        `autowired:""`
	teamService       team.ITeamService              `autowired:""`
	teamMemberService team_member.ITeamMemberService `autowired:""`
	tagService        tag.ITagService                `autowired:""`
	localModelService ai_local.ILocalModelService    `autowired:""`

	serviceTagService service_tag.ITagService     `autowired:""`
	apiService        api.IAPIService             `autowired:""`
	apiDocService     api_doc.IAPIDocService      `autowired:""`
	clusterService    cluster.IClusterService     `autowired:""`
	subscribeServer   subscribe.ISubscribeService `autowired:""`

	releaseService             release.IReleaseService                           `autowired:""`
	serviceModelMappingService service_model_mapping.IServiceModelMappingService `autowired:""`
	logService                 log_service.ILogService                           `autowired:""`

	transaction store.ITransaction `autowired:""`
}

func (i *imlServiceModule) RestLogs(ctx context.Context, serviceId string, start int64, end int64, page int, size int) ([]*service_dto.RestLogItem, int64, error) {
	list, total, err := i.logService.LogRecordsByService(ctx, serviceId, time.Unix(start, 0), time.Unix(end, 0), page, size)
	if err != nil {
		return nil, 0, err
	}
	return utils.SliceToSlice(list, func(s *log_service.Item) *service_dto.RestLogItem {
		return &service_dto.RestLogItem{
			Id:           s.ID,
			API:          auto.UUID(s.API),
			Status:       s.StatusCode,
			LogTime:      auto.TimeLabel(s.RecordTime),
			Ip:           s.RemoteIP,
			Consumer:     auto.UUID(s.Consumer),
			ResponseTime: common.FormatTime(s.ResponseTime),
			Traffic:      common.FormatByte(s.Traffic),
		}
	}), total, nil
}

func (i *imlServiceModule) AILogs(ctx context.Context, serviceId string, start int64, end int64, page int, size int) ([]*service_dto.AILogItem, int64, error) {
	list, total, err := i.logService.LogRecordsByService(ctx, serviceId, time.Unix(start, 0), time.Unix(end, 0), page, size)
	if err != nil {
		return nil, 0, err
	}
	return utils.SliceToSlice(list, func(s *log_service.Item) *service_dto.AILogItem {
		return &service_dto.AILogItem{
			Id:             s.ID,
			API:            auto.UUID(s.API),
			Status:         s.StatusCode,
			LogTime:        auto.TimeLabel(s.RecordTime),
			Ip:             s.RemoteIP,
			Token:          s.TotalToken,
			TokenPerSecond: s.TotalToken / s.ResponseTime,
			Consumer:       auto.UUID(s.Consumer),
			Provider:       auto.UUID(s.AIProvider),
			Model:          s.AIModel,
		}
	}), total, nil
}

func (i *imlServiceModule) ServiceOverview(ctx context.Context, id string) (*service_dto.Overview, error) {
	info, err := i.serviceService.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	apiCountMap, err := i.apiDocService.APICountByServices(ctx, id)
	if err != nil {
		return nil, err
	}
	subscribeMap, err := i.subscribeServer.CountMapByService(ctx, subscribe.ApplyStatusSubscribe, id)
	if err != nil {
		return nil, err
	}
	result := &service_dto.Overview{
		Id:            info.Id,
		Name:          info.Name,
		Description:   info.Description,
		EnableMCP:     info.EnableMCP,
		ServiceKind:   info.Kind.String(),
		SubscriberNum: subscribeMap[id],
		Logo:          info.Logo,
		Catalogue:     auto.UUID(info.Catalogue),
		APINum:        apiCountMap[id],
	}
	_, err = i.releaseService.GetRunning(ctx, id)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
	} else {
		result.IsReleased = true
	}

	return result, nil
}

func (i *imlServiceModule) OnInit() {
	register.Handle(func(v server.Server) {
		ctx := context.Background()
		services, err := i.serviceService.ServiceList(ctx)
		if err != nil {
			log.Error(err)
			return
		}
		for _, s := range services {
			err = i.updateMCPServer(ctx, s.Id, s.Name, "1.0")
			if err != nil {
				log.Error(err)
				return
			}
		}
	})
}

func (i *imlServiceModule) initGateway(ctx context.Context, clusterId string, clientDriver gateway.IClientDriver) error {
	services, err := i.serviceService.ServiceList(ctx)
	if err != nil {
		return err
	}
	subscribeReleases := make([]*gateway.SubscribeRelease, 0, len(services))
	hashReleases := make([]*gateway.HashRelease, 0, len(services))
	for _, s := range services {
		subscribeReleases = append(subscribeReleases, &gateway.SubscribeRelease{
			Service:     s.Id,
			Application: "apipark-global",
			Expired:     "0",
		})

		modelMap, err := i.serviceModelMappingService.Get(ctx, s.Id)
		if err != nil {
			return err
		}
		if modelMap.Content == "" {
			continue
		}
		m := make(map[string]string)
		err = json.Unmarshal([]byte(modelMap.Content), &m)
		if err != nil {
			return err
		}
		hashReleases = append(hashReleases, &gateway.HashRelease{
			HashKey: fmt.Sprintf("%s:%s", gateway.KeyServiceMapping, s.Id),
			HashMap: m,
		})

	}
	err = clientDriver.Subscribe().Online(ctx, subscribeReleases...)
	if err != nil {
		return err
	}
	return clientDriver.Hash().Online(ctx, hashReleases...)
}

func (i *imlServiceModule) updateMCPServer(ctx context.Context, sid string, name string, version string) error {
	r, err := i.releaseService.GetRunning(ctx, sid)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}
	_, _, apiDocCommit, _, _, err := i.releaseService.GetReleaseInfos(ctx, r.UUID)
	if err != nil {
		return fmt.Errorf("get release info error: %w", err)
	}
	commitDoc, err := i.apiDocService.GetDocCommit(ctx, apiDocCommit.Commit)
	if err != nil {
		return fmt.Errorf("get api doc commit error: %w", err)
	}
	mcpInfo, err := mcp_server.ConvertMCPFromOpenAPI3Data([]byte(commitDoc.Data.Content))
	if err != nil {
		return fmt.Errorf("convert mcp from openapi3 data error: %w", err)
	}
	tools := make([]mcp_server.ITool, 0, len(mcpInfo.Apis))
	for _, a := range mcpInfo.Apis {
		toolOptions := make([]mcp.ToolOption, 0, len(a.Params)+2)
		toolOptions = append(toolOptions, mcp.WithDescription(a.Description))
		headers := make(map[string]interface{})
		queries := make(map[string]interface{})
		path := make(map[string]interface{})
		for _, v := range a.Params {
			p := map[string]interface{}{
				"type":        "string",
				"required":    v.Required,
				"description": v.Description,
			}
			switch v.In {
			case "header":
				headers[v.Name] = p
			case "query":
				queries[v.Name] = p
			case "path":
				path[v.Name] = p
			}
		}
		if len(headers) > 0 {
			toolOptions = append(toolOptions, mcp.WithObject(mcp_server.MCPHeader, mcp.Properties(headers), mcp.Description("request headers.")))
		}
		if len(queries) > 0 {
			toolOptions = append(toolOptions, mcp.WithObject(mcp_server.MCPQuery, mcp.Properties(queries), mcp.Description("request queries.")))
		}
		if len(path) > 0 {
			toolOptions = append(toolOptions, mcp.WithObject(mcp_server.MCPPath, mcp.Properties(path), mcp.Description("request path params.")))
		}
		if a.Body != nil {
			type Schema struct {
				Type       string                 `mapstructure:"type"`
				Properties map[string]interface{} `mapstructure:"properties"`
				Items      interface{}            `mapstructure:"items"`
			}
			var tmp Schema
			err = mapstructure.Decode(a.Body, &tmp)
			if err != nil {
				return err
			}
			switch tmp.Type {
			case "object":
				toolOptions = append(toolOptions, mcp.WithObject(mcp_server.MCPBody, mcp.Properties(tmp.Properties), mcp.Description("request body,it is avalible when method is POST、PUT、PATCH.")))
			case "array":
				toolOptions = append(toolOptions, mcp.WithArray(mcp_server.MCPBody, mcp.Items(tmp.Items), mcp.Description("request body,it is avalible when method is POST、PUT、PATCH.")))
			}
		}
		tools = append(tools, mcp_server.NewTool(a.Summary, a.Path, a.Method, a.ContentType, toolOptions...))
	}
	mcp_server.SetSSEServer(sid, name, version, tools...)
	return nil
}

func (i *imlServiceModule) deleteMCPServer(ctx context.Context, sid string) {
	mcp_server.DelSSEServer(sid)
}

func (i *imlServiceModule) ExportAll(ctx context.Context) ([]*service_dto.ExportService, error) {
	services, err := i.serviceService.ServiceList(ctx)
	if err != nil {
		return nil, err
	}
	serviceIds := utils.SliceToSlice(services, func(s *service.Service) string {
		return s.Id
	})
	serviceTags, err := i.serviceTagService.List(ctx, serviceIds, nil)
	if err != nil {
		return nil, err
	}
	tagMap, err := i.tagService.Map(ctx)
	if err != nil {
		return nil, err
	}
	serviceTagMap := make(map[string][]string)
	for _, st := range serviceTags {
		if _, ok := tagMap[st.Tid]; !ok {
			continue
		}
		if _, ok := serviceTagMap[st.Sid]; !ok {
			serviceTagMap[st.Sid] = make([]string, 0)
		}
		serviceTagMap[st.Sid] = append(serviceTagMap[st.Sid], tagMap[st.Tid].Name)
	}

	items := make([]*service_dto.ExportService, 0, len(services))
	for _, s := range services {
		info := &service_dto.ExportService{
			Id:          s.Id,
			Name:        s.Name,
			Prefix:      s.Prefix,
			Description: s.Description,
			Team:        s.Team,
			ServiceType: s.ServiceType.String(),
			Catalogue:   s.Catalogue,
			Logo:        s.Logo,
		}

		if tags, ok := serviceTagMap[s.Id]; ok {
			info.Tags = tags
		}
		items = append(items, info)
	}
	return items, nil
}

func (i *imlServiceModule) searchMyServices(ctx context.Context, teamId string, keyword string) ([]*service.Service, error) {
	userID := utils.UserId(ctx)
	condition := make(map[string]interface{})
	condition["as_server"] = true
	if teamId != "" {
		_, err := i.teamService.Get(ctx, teamId)
		if err != nil {
			return nil, err
		}
		condition["team"] = teamId
		return i.serviceService.Search(ctx, keyword, condition, "create_at desc")
	} else {
		membersForUser, err := i.teamMemberService.FilterMembersForUser(ctx, userID)
		if err != nil {
			return nil, err
		}
		teamIds := membersForUser[userID]
		condition["team"] = teamIds
		return i.serviceService.Search(ctx, keyword, condition, "create_at desc")
	}
}

func (i *imlServiceModule) SearchMyServices(ctx context.Context, teamId string, keyword string) ([]*service_dto.ServiceItem, error) {
	services, err := i.searchMyServices(ctx, teamId, keyword)
	if err != nil {
		return nil, err
	}
	serviceIds := utils.SliceToSlice(services, func(p *service.Service) string {
		return p.Id
	})
	apiCountMap, err := i.apiDocService.APICountByServices(ctx, serviceIds...)
	if err != nil {
		return nil, err
	}

	items := make([]*service_dto.ServiceItem, 0, len(services))
	for _, model := range services {
		if teamId != "" && model.Team != teamId {
			continue
		}
		apiCount := apiCountMap[model.Id]
		item := toServiceItem(model)
		item.ApiNum = apiCount
		item.CanDelete = apiCount == 0
		items = append(items, item)

	}
	return items, nil
}

func (i *imlServiceModule) Simple(ctx context.Context) ([]*service_dto.SimpleServiceItem, error) {
	w := make(map[string]interface{})
	w["as_server"] = true

	services, err := i.serviceService.Search(ctx, "", w)
	if err != nil {
		return nil, err
	}

	items := make([]*service_dto.SimpleServiceItem, 0, len(services))
	for _, p := range services {
		items = append(items, &service_dto.SimpleServiceItem{
			Id:          p.Id,
			Name:        p.Name,
			Description: p.Description,
			Team:        auto.UUID(p.Team),
		})
	}
	return items, nil
}

func (i *imlServiceModule) MySimple(ctx context.Context) ([]*service_dto.SimpleServiceItem, error) {
	services, err := i.searchMyServices(ctx, "", "")
	if err != nil {
		return nil, err
	}

	items := make([]*service_dto.SimpleServiceItem, 0, len(services))
	for _, p := range services {
		items = append(items, &service_dto.SimpleServiceItem{
			Id:          p.Id,
			Name:        p.Name,
			Description: p.Description,
			Team:        auto.UUID(p.Team),
		})
	}
	return items, nil
}

func (i *imlServiceModule) Get(ctx context.Context, id string) (*service_dto.Service, error) {
	now := time.Now()
	serviceInfo, err := i.serviceService.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	tags, err := i.serviceTagService.List(ctx, []string{serviceInfo.Id}, nil)
	if err != nil {
		return nil, err
	}

	s := service_dto.ToService(serviceInfo)
	s.Tags = auto.List(utils.SliceToSlice(tags, func(p *service_tag.Tag) string {
		return p.Tid
	}))
	if s.Model == "" {
		switch s.ProviderType {
		case "online":
			p, has := model_runtime.GetProvider(s.Provider.Id)
			if has {
				m, has := p.DefaultModel(model_runtime.ModelTypeLLM)
				if has {
					s.Model = m.ID()
				}
			}
		case "local":
			info, err := i.localModelService.DefaultModel(ctx)
			if err != nil {
				return nil, err
			}
			s.Model = info.Id

		}
	}

	serviceModelMapping, err := i.serviceModelMappingService.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	s.ModelMapping = serviceModelMapping.Content

	log.Infof("get service cost %d ms", time.Since(now).Milliseconds())
	return s, nil
}

func (i *imlServiceModule) Search(ctx context.Context, teamID string, keyword string) ([]*service_dto.ServiceItem, error) {
	var list []*service.Service
	var err error
	if teamID != "" {
		_, err = i.teamService.Get(ctx, teamID)
		if err != nil {
			return nil, err
		}
		list, err = i.serviceService.Search(ctx, keyword, map[string]interface{}{"team": teamID, "as_server": true}, "create_at desc")
	} else {
		list, err = i.serviceService.Search(ctx, keyword, map[string]interface{}{"as_server": true}, "create_at desc")
	}
	if err != nil {
		return nil, err
	}

	serviceIds := utils.SliceToSlice(list, func(s *service.Service) string {
		return s.Id
	})

	apiCountMap, err := i.apiDocService.APICountByServices(ctx, serviceIds...)
	if err != nil {
		return nil, err
	}

	items := make([]*service_dto.ServiceItem, 0, len(list))
	for _, model := range list {
		apiCount := apiCountMap[model.Id]
		item := toServiceItem(model)
		item.ApiNum = apiCount
		item.CanDelete = apiCount == 0
		items = append(items, item)
	}
	return items, nil
}

func toServiceItem(model *service.Service) *service_dto.ServiceItem {
	item := &service_dto.ServiceItem{
		Id:          model.Id,
		Name:        model.Name,
		Description: model.Description,
		CreateTime:  auto.TimeLabel(model.CreateTime),
		UpdateTime:  auto.TimeLabel(model.UpdateTime),
		Team:        auto.UUID(model.Team),
		EnableMCP:   model.EnableMCP,
		ServiceKind: model.Kind.String(),
	}
	state := service_dto.FromServiceState(model.State)
	if state == service_dto.ServiceStateNormal {
		item.State = model.ServiceType.String()
	} else {
		item.State = state.String()
	}

	switch model.Kind {
	case service.RestService:
		item.State = model.ServiceType.String()
		return item
	case service.AIService:
		provider := auto.UUID(model.AdditionalConfig["provider"])
		item.Provider = &provider
		return item
	default:
		return item
	}
}

func (i *imlServiceModule) Create(ctx context.Context, teamID string, input *service_dto.CreateService) (*service_dto.Service, error) {
	if input.Id == "" {
		input.Id = uuid.New().String()
	}
	if teamID == "" {
		item, err := i.teamService.DefaultTeam(ctx)
		if err != nil {
			return nil, err
		}
		teamID = item.Id
	}
	mo := &service.Create{
		Id:               input.Id,
		Name:             input.Name,
		Description:      input.Description,
		Team:             teamID,
		ServiceType:      service.ServiceType(input.ServiceType),
		Catalogue:        input.Catalogue,
		Prefix:           input.Prefix,
		Logo:             input.Logo,
		State:            service_dto.ServiceState(input.State).Int(),
		ApprovalType:     service.ApprovalType(input.ApprovalType),
		AdditionalConfig: make(map[string]string),
		Kind:             service.Kind(input.Kind),
		EnableMCP:        input.EnableMCP,
	}
	if mo.ServiceType == service.PublicService && mo.Catalogue == "" {
		return nil, fmt.Errorf("catalogue can not be empty")
	}
	switch mo.Kind {
	case service.AIService:
		if input.Provider == nil {
			return nil, fmt.Errorf("ai service: provider can not be empty")
		}
		mo.AdditionalConfig["provider"] = *input.Provider
		if input.Model == nil {
			return nil, fmt.Errorf("ai service: model can not be empty")
		}
		mo.AdditionalConfig["model"] = *input.Model
	}
	if input.AsApp == nil {
		// 默认值为false
		mo.AsApp = false
	} else {
		mo.AsApp = *input.AsApp
	}
	if input.AsServer == nil {
		// 默认值为true
		mo.AsServer = true
	} else {
		mo.AsServer = *input.AsServer
	}

	input.Prefix = strings.Trim(strings.Trim(input.Prefix, " "), "/")
	err := i.transaction.Transaction(ctx, func(ctx context.Context) error {
		if input.Tags != nil {
			tags, err := i.getTagUuids(ctx, input.Tags)
			if err != nil {
				return err
			}
			for _, t := range tags {
				err = i.serviceTagService.Create(ctx, &service_tag.CreateTag{
					Tid: t,
					Sid: input.Id,
				})
				if err != nil {
					return err
				}
			}
		}
		err := i.serviceService.Create(ctx, mo)
		if err != nil {
			return err
		}
		client, err := i.clusterService.GatewayClient(ctx, cluster.DefaultClusterID)
		if err != nil {
			return err
		}
		err = client.Subscribe().Online(ctx, &gateway.SubscribeRelease{
			Service:     mo.Id,
			Application: "apipark-global",
			Expired:     "0",
		})
		if err != nil {
			return err
		}
		if input.ModelMapping != "" {
			m := make(map[string]string)
			err = json.Unmarshal([]byte(input.ModelMapping), &m)
			if err != nil {
				return err
			}
			err = i.serviceModelMappingService.Save(ctx, &service_model_mapping.Save{
				Sid:     input.Id,
				Content: input.ModelMapping,
			})
			if err != nil {
				return err
			}

			err = client.Hash().Online(ctx, &gateway.HashRelease{
				HashKey: fmt.Sprintf("%s:%s", gateway.KeyServiceMapping, input.Id),
				HashMap: m,
			})
			if err != nil {
				return err
			}
		}

		if input.EnableMCP {
			err = i.updateMCPServer(ctx, input.Id, input.Name, "1.0")
			if err != nil {
				return err
			}
		} else {
			i.deleteMCPServer(ctx, input.Id)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return i.Get(ctx, input.Id)
}

func (i *imlServiceModule) Edit(ctx context.Context, id string, input *service_dto.EditService) (*service_dto.Service, error) {
	info, err := i.serviceService.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	switch info.Kind {
	case service.AIService:
		if input.Provider != nil {
			info.AdditionalConfig["provider"] = *input.Provider
		}
		if input.Model != nil {
			info.AdditionalConfig["model"] = *input.Model
		}
	}
	err = i.transaction.Transaction(ctx, func(ctx context.Context) error {
		serviceType := (*service.ServiceType)(input.ServiceType)
		if serviceType != nil && *serviceType == service.PublicService {
			if input.Catalogue == nil || *input.Catalogue == "" {
				return fmt.Errorf("catalogue can not be empty")
			}
		}
		var approvalType service.ApprovalType
		if input.ApprovalType != nil {
			approvalType = service.ApprovalType(*input.ApprovalType)
		}
		editCfg := &service.Edit{
			Name:             input.Name,
			Description:      input.Description,
			Logo:             input.Logo,
			ServiceType:      serviceType,
			Catalogue:        input.Catalogue,
			AdditionalConfig: &info.AdditionalConfig,
			ApprovalType:     &approvalType,
			EnableMCP:        input.EnableMCP,
		}
		if input.State != nil {
			state := service_dto.ServiceState(*input.State).Int()
			editCfg.State = &state
		}

		err = i.serviceService.Save(ctx, id, editCfg)
		if err != nil {
			return err
		}
		if input.Tags != nil {
			tags, err := i.getTagUuids(ctx, *input.Tags)
			if err != nil {
				return err
			}
			i.serviceTagService.Delete(ctx, nil, []string{id})
			for _, t := range tags {
				err = i.serviceTagService.Create(ctx, &service_tag.CreateTag{
					Tid: t,
					Sid: id,
				})
				if err != nil {
					return err
				}

			}
		}
		client, err := i.clusterService.GatewayClient(ctx, cluster.DefaultClusterID)
		if err != nil {
			return err
		}
		err = client.Subscribe().Online(ctx, &gateway.SubscribeRelease{
			Service:     id,
			Application: "apipark-global",
			Expired:     "0",
		})
		if err != nil {
			return err
		}
		if input.ModelMapping != nil && *input.ModelMapping != "" {
			m := make(map[string]string)
			err = json.Unmarshal([]byte(*input.ModelMapping), &m)
			if err != nil {
				return err
			}
			err = i.serviceModelMappingService.Save(ctx, &service_model_mapping.Save{
				Sid:     id,
				Content: *input.ModelMapping,
			})
			if err != nil {
				return err
			}

			err = client.Hash().Online(ctx, &gateway.HashRelease{
				HashKey: fmt.Sprintf("%s:%s", gateway.KeyServiceMapping, id),
				HashMap: m,
			})
			if err != nil {
				return err
			}
		}

		if input.EnableMCP != nil {
			if *input.EnableMCP {
				name := info.Name
				if input.Name != nil {
					name = *input.Name
				}
				err = i.updateMCPServer(ctx, id, name, "1.0")
				if err != nil {
					return err
				}
			} else {
				i.deleteMCPServer(ctx, id)
			}
		}

		return nil
	})
	if err != nil {
		return nil, err
	}
	return i.Get(ctx, id)
}

func (i *imlServiceModule) Delete(ctx context.Context, id string) error {
	err := i.transaction.Transaction(ctx, func(ctx context.Context) error {
		count, err := i.apiService.CountByService(ctx, id)
		if err != nil {
			return err
		}
		if count > 0 {
			return fmt.Errorf("service has apis, can not delete")
		}

		err = i.serviceService.Delete(ctx, id)
		if err != nil {
			return err
		}

		err = i.serviceModelMappingService.Delete(ctx, id)
		if err != nil {
			return err
		}
		client, err := i.clusterService.GatewayClient(ctx, cluster.DefaultClusterID)
		if err != nil {
			return err
		}
		err = client.Project().Offline(ctx, &gateway.ProjectRelease{
			Id: id,
		})
		if err != nil {
			if err.Error() != "nil" {
				return err
			}
		}
		err = client.Subscribe().Offline(ctx, &gateway.SubscribeRelease{
			Service:     id,
			Application: "apipark-global",
			Expired:     "0",
		})
		if err != nil {
			return err
		}

		err = client.Hash().Offline(ctx, &gateway.HashRelease{
			HashKey: fmt.Sprintf("%s:%s", gateway.KeyServiceMapping, id),
		})
		if err != nil {
			return err
		}
		i.deleteMCPServer(ctx, id)
		return nil
	})
	return err
}

func (i *imlServiceModule) getTagUuids(ctx context.Context, tags []string) ([]string, error) {
	list, err := i.tagService.Search(ctx, "", map[string]interface{}{"name": tags})
	if err != nil {
		return nil, err
	}
	tagMap := make(map[string]string)
	for _, t := range list {
		tagMap[t.Name] = t.Id
	}
	tagList := make([]string, 0, len(tags))
	repeatTag := make(map[string]struct{})
	for _, t := range tags {
		if _, ok := repeatTag[t]; ok {
			continue
		}
		repeatTag[t] = struct{}{}
		v := &tag.CreateTag{
			Name: t,
		}
		id, ok := tagMap[t]
		if !ok {
			v.Id = uuid.New().String()
			err = i.tagService.Create(ctx, v)
			if err != nil {
				return nil, err
			}
			tagMap[t] = v.Id
		} else {
			v.Id = id
		}
		tagList = append(tagList, v.Id)
	}
	return tagList, nil
}

type imlServiceDocModule struct {
	serviceService    service.IServiceService `autowired:""`
	serviceDocService service_doc.IDocService `autowired:""`
}

func (i *imlServiceDocModule) ServiceDoc(ctx context.Context, pid string) (*serviceDto.ServiceDoc, error) {
	_, err := i.serviceService.Check(ctx, pid, map[string]bool{"as_server": true})
	if err != nil {
		return nil, err
	}
	info, err := i.serviceService.Get(ctx, pid)
	if err != nil {
		return nil, err
	}
	doc, err := i.serviceDocService.Get(ctx, pid)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return &serviceDto.ServiceDoc{
			Id:   pid,
			Name: info.Name,
			Doc:  "",
		}, nil
	}
	return &serviceDto.ServiceDoc{
		Id:         pid,
		Name:       info.Name,
		Doc:        doc.Doc,
		Creator:    auto.UUID(doc.Creator),
		CreateTime: auto.TimeLabel(doc.CreateTime),
		Updater:    auto.UUID(doc.Updater),
		UpdateTime: auto.TimeLabel(doc.UpdateTime),
	}, nil
}

func (i *imlServiceDocModule) SaveServiceDoc(ctx context.Context, pid string, input *serviceDto.SaveServiceDoc) error {
	_, err := i.serviceService.Check(ctx, pid, map[string]bool{"as_server": true})
	if err != nil {
		return err
	}
	return i.serviceDocService.Save(ctx, &service_doc.SaveDoc{
		Sid: pid,
		Doc: input.Doc,
	})
}

var (
	_ IAppModule       = &imlAppModule{}
	_ IExportAppModule = &imlAppModule{}
)

type imlAppModule struct {
	teamService       team.ITeamService                               `autowired:""`
	serviceService    service.IServiceService                         `autowired:""`
	teamMemberService team_member.ITeamMemberService                  `autowired:""`
	subscribeService  subscribe.ISubscribeService                     `autowired:""`
	authService       application_authorization.IAuthorizationService `autowired:""`
	roleService       role.IRoleService                               `autowired:""`
	roleMemberService role.IRoleMemberService                         `autowired:""`
	transaction       store.ITransaction                              `autowired:""`
}

func (i *imlAppModule) SearchCanSubscribe(ctx context.Context, serviceId string) ([]*service_dto.SubscribeAppItem, bool, error) {
	apps, err := i.searchMyApps(ctx, "", "")
	if err != nil {
		return nil, false, err
	}
	subscribes, err := i.subscribeService.ListByServices(ctx, serviceId)
	if err != nil {
		return nil, false, err
	}
	subscribeMap := utils.SliceToMapO(subscribes, func(p *subscribe.Subscribe) (string, struct{}) {
		return p.Application, struct{}{}
	}, func(s *subscribe.Subscribe) bool {
		return s.ApplyStatus == subscribe.ApplyStatusSubscribe
	})
	canSubscribe := false
	list, err := i.roleService.ListByPermit(ctx, access.SystemWorkspaceApplicationManagerAll)
	if err == nil && len(list) > 0 {
		return utils.SliceToSlice(apps, func(p *service.Service) *service_dto.SubscribeAppItem {
			_, isSubscribed := subscribeMap[p.Id]
			if !isSubscribed {
				canSubscribe = true
			}
			return &service_dto.SubscribeAppItem{
				Id:           p.Id,
				Name:         p.Name,
				IsSubscribed: isSubscribed,
			}
		}), canSubscribe, nil
	}
	list, err = i.roleService.ListByPermit(ctx, access.TeamConsumerSubscriptionSubscribe)
	if err != nil {
		return nil, false, nil
	}
	roleIds := utils.SliceToSlice(list, func(p *role.RoleByPermit) string {
		return p.Id
	})
	members, err := i.roleMemberService.ListByRoleIds(ctx, utils.UserId(ctx), roleIds...)
	if err != nil {
		return nil, false, err
	}
	if len(members) == 0 {
		return nil, false, nil
	}

	teamMap := utils.SliceToMapO(members, func(p *role.Member) (string, struct{}) {
		return role.TrimTeamTarget(p.Target), struct{}{}
	})
	result := make([]*service_dto.SubscribeAppItem, 0, len(apps))
	for _, app := range apps {
		if _, ok := teamMap[app.Team]; !ok {
			continue
		}
		_, isSubscribed := subscribeMap[app.Id]
		if !isSubscribed {
			canSubscribe = true
		}
		result = append(result, &service_dto.SubscribeAppItem{
			Id:           app.Id,
			Name:         app.Name,
			IsSubscribed: isSubscribed,
		})
	}

	return result, canSubscribe, nil
}

func (i *imlAppModule) ExportAll(ctx context.Context) ([]*service_dto.ExportApp, error) {
	apps, err := i.serviceService.AppList(ctx)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(apps, func(p *service.Service) *service_dto.ExportApp {
		return &service_dto.ExportApp{
			Id:          p.Id,
			Name:        p.Name,
			Description: p.Description,
			Team:        p.Team,
		}
	}), nil
}

func (i *imlAppModule) Search(ctx context.Context, teamId string, keyword string) ([]*service_dto.AppItem, error) {
	var services []*service.Service
	var err error
	if teamId != "" {
		_, err = i.teamService.Get(ctx, teamId)
		if err != nil {
			return nil, err
		}
		services, err = i.serviceService.Search(ctx, keyword, map[string]interface{}{"team": teamId, "as_app": true}, "update_at desc")
	} else {
		services, err = i.serviceService.Search(ctx, keyword, map[string]interface{}{"as_app": true}, "update_at desc")
	}
	if err != nil {
		return nil, err
	}

	serviceIds := utils.SliceToSlice(services, func(p *service.Service) string {
		return p.Id
	})

	subscribers, err := i.subscribeService.SubscriptionsByApplication(ctx, serviceIds...)
	if err != nil {
		return nil, err
	}

	subscribeCount := map[string]int64{}
	subscribeVerifyCount := map[string]int64{}
	verifyTmp := map[string]struct{}{}
	subscribeTmp := map[string]struct{}{}
	for _, s := range subscribers {
		key := fmt.Sprintf("%s-%s", s.Service, s.Application)
		switch s.ApplyStatus {
		case subscribe.ApplyStatusSubscribe:
			if _, ok := subscribeTmp[key]; !ok {
				subscribeTmp[key] = struct{}{}
				subscribeCount[s.Application]++
			}
		case subscribe.ApplyStatusReview:
			if _, ok := verifyTmp[key]; !ok {
				verifyTmp[key] = struct{}{}
				subscribeVerifyCount[s.Application]++
			}
		default:

		}
	}
	authMap, err := i.authService.CountByApp(ctx, serviceIds...)
	if err != nil {
		return nil, err
	}
	items := make([]*service_dto.AppItem, 0, len(services))
	for _, model := range services {
		subscribeNum := subscribeCount[model.Id]
		verifyNum := subscribeVerifyCount[model.Id]
		items = append(items, &service_dto.AppItem{
			Id:                 model.Id,
			Name:               model.Name,
			Description:        model.Description,
			CreateTime:         auto.TimeLabel(model.CreateTime),
			UpdateTime:         auto.TimeLabel(model.UpdateTime),
			Team:               auto.UUID(model.Team),
			SubscribeNum:       subscribeNum,
			SubscribeVerifyNum: verifyNum,
			CanDelete:          subscribeNum == 0,
			AuthNum:            authMap[model.Id],
		})
	}
	sort.Slice(items, func(i, j int) bool {
		if items[i].SubscribeNum != items[j].SubscribeNum {
			return items[i].SubscribeNum > items[j].SubscribeNum
		}
		if items[i].SubscribeVerifyNum != items[j].SubscribeVerifyNum {
			return items[i].SubscribeVerifyNum > items[j].SubscribeVerifyNum
		}
		return items[i].Name < items[j].Name
	})
	return items, nil
}

func (i *imlAppModule) CreateApp(ctx context.Context, teamID string, input *service_dto.CreateApp) (*service_dto.App, error) {
	if input.Id == "" {
		input.Id = uuid.New().String()
	}
	userId := utils.UserId(ctx)
	mo := &service.Create{
		Id:          input.Id,
		Name:        input.Name,
		Description: input.Description,
		Team:        teamID,
		AsApp:       true,
	}
	// 判断用户是否在团队内
	members, err := i.teamMemberService.Members(ctx, []string{teamID}, []string{userId})
	if err != nil {
		return nil, err
	}
	if len(members) == 0 {
		return nil, fmt.Errorf("master is not in team")
	}

	err = i.transaction.Transaction(ctx, func(ctx context.Context) error {
		return i.serviceService.Create(ctx, mo)
	})
	if err != nil {
		return nil, err
	}
	return i.GetApp(ctx, input.Id)
}

func (i *imlAppModule) UpdateApp(ctx context.Context, appId string, input *service_dto.UpdateApp) (*service_dto.App, error) {
	// userId := utils.UserId(ctx)
	info, err := i.serviceService.Get(ctx, appId)
	if err != nil {
		return nil, err
	}
	if !info.AsApp {
		return nil, fmt.Errorf("not app")
	}
	//if info.Master != userId {
	//	return nil, fmt.Errorf("user is not app master, can not update")
	//}

	err = i.serviceService.Save(ctx, appId, &service.Edit{
		Name:        input.Name,
		Description: input.Description,
	})
	if err != nil {
		return nil, err
	}
	return i.GetApp(ctx, info.Id)
}

func (i *imlAppModule) searchMyApps(ctx context.Context, teamId string, keyword string) ([]*service.Service, error) {
	userID := utils.UserId(ctx)
	condition := make(map[string]interface{})
	condition["as_app"] = true
	if teamId != "" {
		_, err := i.teamService.Get(ctx, teamId)
		if err != nil {
			return nil, err
		}
		condition["team"] = teamId
		return i.serviceService.Search(ctx, keyword, condition, "update_at desc")
	} else {
		membersForUser, err := i.teamMemberService.FilterMembersForUser(ctx, userID)
		if err != nil {
			return nil, err
		}
		teamIds := membersForUser[userID]
		condition["team"] = teamIds

		return i.serviceService.Search(ctx, keyword, condition, "update_at desc")
	}
}

func (i *imlAppModule) SearchMyApps(ctx context.Context, teamId string, keyword string) ([]*service_dto.AppItem, error) {
	services, err := i.searchMyApps(ctx, teamId, keyword)
	if err != nil {
		return nil, err
	}
	serviceIds := utils.SliceToSlice(services, func(p *service.Service) string {
		return p.Id
	})

	subscribers, err := i.subscribeService.SubscriptionsByApplication(ctx, serviceIds...)
	if err != nil {
		return nil, err
	}
	authMap, err := i.authService.CountByApp(ctx, serviceIds...)
	if err != nil {
		return nil, err
	}

	subscribeCount := map[string]int64{}
	subscribeVerifyCount := map[string]int64{}
	verifyTmp := map[string]struct{}{}
	subscribeTmp := map[string]struct{}{}
	for _, s := range subscribers {
		key := fmt.Sprintf("%s-%s", s.Service, s.Application)
		switch s.ApplyStatus {
		case subscribe.ApplyStatusSubscribe:
			if _, ok := subscribeTmp[key]; !ok {
				subscribeTmp[key] = struct{}{}
				subscribeCount[s.Application]++
			}
		case subscribe.ApplyStatusReview:
			if _, ok := verifyTmp[key]; !ok {
				verifyTmp[key] = struct{}{}
				subscribeVerifyCount[s.Application]++
			}
		default:

		}
	}
	items := make([]*service_dto.AppItem, 0, len(services))
	for _, model := range services {
		subscribeNum := subscribeCount[model.Id]
		verifyNum := subscribeVerifyCount[model.Id]
		items = append(items, &service_dto.AppItem{
			Id:                 model.Id,
			Name:               model.Name,
			Description:        model.Description,
			CreateTime:         auto.TimeLabel(model.CreateTime),
			UpdateTime:         auto.TimeLabel(model.UpdateTime),
			Team:               auto.UUID(model.Team),
			SubscribeNum:       subscribeNum,
			SubscribeVerifyNum: verifyNum,
			CanDelete:          subscribeNum == 0,
			AuthNum:            authMap[model.Id],
		})
	}
	sort.Slice(items, func(i, j int) bool {
		if items[i].SubscribeNum != items[j].SubscribeNum {
			return items[i].SubscribeNum > items[j].SubscribeNum
		}
		if items[i].SubscribeVerifyNum != items[j].SubscribeVerifyNum {
			return items[i].SubscribeVerifyNum > items[j].SubscribeVerifyNum
		}
		return items[i].Name < items[j].Name
	})
	return items, nil
}

func (i *imlAppModule) SimpleApps(ctx context.Context, keyword string) ([]*service_dto.SimpleAppItem, error) {
	w := make(map[string]interface{})
	w["as_app"] = true
	services, err := i.serviceService.Search(ctx, keyword, w)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(services, func(p *service.Service) *service_dto.SimpleAppItem {
		return &service_dto.SimpleAppItem{
			Id:          p.Id,
			Name:        p.Name,
			Description: p.Description,
			Team:        auto.UUID(p.Team),
		}
	}), nil
}

func (i *imlAppModule) MySimpleApps(ctx context.Context, keyword string) ([]*service_dto.SimpleAppItem, error) {
	services, err := i.searchMyApps(ctx, "", keyword)
	if err != nil {
		return nil, err
	}
	items := make([]*service_dto.SimpleAppItem, 0, len(services))
	for _, p := range services {
		items = append(items, &service_dto.SimpleAppItem{
			Id:          p.Id,
			Name:        p.Name,
			Description: p.Description,
			Team:        auto.UUID(p.Team),
		})
	}
	return items, nil
}

func (i *imlAppModule) GetApp(ctx context.Context, appId string) (*service_dto.App, error) {
	info, err := i.serviceService.Get(ctx, appId)
	if err != nil {
		return nil, err
	}
	if !info.AsApp {
		return nil, errors.New("not app")
	}
	return &service_dto.App{
		Id:          info.Id,
		Name:        info.Name,
		Description: info.Description,
		Team:        auto.UUID(info.Team),
		CreateTime:  auto.TimeLabel(info.CreateTime),
		UpdateTime:  auto.TimeLabel(info.UpdateTime),
		AsApp:       info.AsApp,
	}, nil
}

func (i *imlAppModule) DeleteApp(ctx context.Context, appId string) error {
	info, err := i.serviceService.Get(ctx, appId)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		return nil
	}
	if !info.AsApp {
		return errors.New("not app, can not delete")
	}

	return i.serviceService.Delete(ctx, appId)
}
