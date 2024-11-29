package service

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/eolinker/eosc/log"

	"github.com/APIParkLab/APIPark/resources/access"

	"github.com/eolinker/ap-account/service/role"

	application_authorization "github.com/APIParkLab/APIPark/service/application-authorization"

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

	serviceTagService service_tag.ITagService `autowired:""`
	apiService        api.IAPIService         `autowired:""`
	apiDocService     api_doc.IAPIDocService  `autowired:""`
	transaction       store.ITransaction      `autowired:""`
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

	//docMap, err := i.serviceDocService.Map(ctx, serviceIds...)
	//if err != nil {
	//	return nil, err
	//}

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

//func (i *imlServiceModule) SimpleAPPS(ctx context.Context, keyword string) ([]*service_dto.SimpleServiceItem, error) {
//	w := make(map[string]interface{})
//	w["as_app"] = true
//	services, err := i.serviceService.SearchByDriver(ctx, keyword, w)
//	if err != nil {
//		return nil, err
//	}
//	return utils.SliceToSlice(services, func(p *service.Service) *service_dto.SimpleServiceItem {
//		return &service_dto.SimpleServiceItem{
//			Id:          p.Id,
//			Name:        p.Name,
//			Description: p.Description,
//
//			Team: auto.UUID(p.Team),
//		}
//	}), nil
//}

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
		list, err = i.serviceService.Search(ctx, keyword, map[string]interface{}{"team": teamID, "as_server": true}, "update_at desc")
	} else {
		list, err = i.serviceService.Search(ctx, keyword, map[string]interface{}{"as_server": true}, "update_at desc")
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
		ServiceKind: model.Kind.String(),
	}
	switch model.Kind {
	case service.RestService:
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
	mo := &service.Create{
		Id:               input.Id,
		Name:             input.Name,
		Description:      input.Description,
		Team:             teamID,
		ServiceType:      service.ServiceType(input.ServiceType),
		Catalogue:        input.Catalogue,
		Prefix:           input.Prefix,
		Logo:             input.Logo,
		ApprovalType:     service.ApprovalType(input.ApprovalType),
		AdditionalConfig: make(map[string]string),
		Kind:             service.Kind(input.Kind),
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
		return i.serviceService.Create(ctx, mo)
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

		err = i.serviceService.Save(ctx, id, &service.Edit{
			Name:             input.Name,
			Description:      input.Description,
			Logo:             input.Logo,
			ServiceType:      serviceType,
			Catalogue:        input.Catalogue,
			AdditionalConfig: &info.AdditionalConfig,
			ApprovalType:     &approvalType,
		})
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

		return i.serviceService.Delete(ctx, id)
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

func (i *imlAppModule) SearchCanSubscribe(ctx context.Context, serviceId string) ([]*service_dto.SimpleAppItem, error) {
	apps, err := i.searchMyApps(ctx, "", "")
	if err != nil {
		return nil, err
	}
	list, err := i.roleService.ListByPermit(ctx, access.SystemWorkspaceApplicationManagerAll)
	if err == nil && len(list) > 0 {
		return utils.SliceToSlice(apps, func(p *service.Service) *service_dto.SimpleAppItem {
			return &service_dto.SimpleAppItem{
				Id:          p.Id,
				Name:        p.Name,
				Description: p.Description,
				Team:        auto.UUID(p.Team),
			}
		}), nil
	}
	list, err = i.roleService.ListByPermit(ctx, access.TeamConsumerSubscriptionSubscribe)
	if err != nil {
		return nil, nil
	}
	roleIds := utils.SliceToSlice(list, func(p *role.RoleByPermit) string {
		return p.Id
	})
	members, err := i.roleMemberService.ListByRoleIds(ctx, utils.UserId(ctx), roleIds...)
	if err != nil {
		return nil, err
	}
	if len(members) == 0 {
		return nil, nil
	}
	subscribes, err := i.subscribeService.ListByServices(ctx, serviceId)
	if err != nil {
		return nil, err
	}
	subscribeMap := utils.SliceToMapO(subscribes, func(p *subscribe.Subscribe) (string, struct{}) {
		return p.Application, struct{}{}
	}, func(s *subscribe.Subscribe) bool {
		return s.ApplyStatus == subscribe.ApplyStatusSubscribe
	})
	teamMap := utils.SliceToMapO(members, func(p *role.Member) (string, struct{}) {
		return role.TrimTeamTarget(p.Target), struct{}{}
	})
	result := make([]*service_dto.SimpleAppItem, 0, len(apps))
	for _, app := range apps {
		if _, ok := teamMap[app.Team]; !ok {
			continue
		}
		if _, ok := subscribeMap[app.Id]; ok {
			continue
		}
		result = append(result, &service_dto.SimpleAppItem{
			Id:          app.Id,
			Name:        app.Name,
			Description: app.Description,
			Team:        auto.UUID(app.Team),
		})
	}

	return result, nil
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
	//userId := utils.UserId(ctx)
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
