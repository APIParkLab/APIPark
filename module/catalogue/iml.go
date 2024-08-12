package catalogue

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"sort"
	
	service_doc "github.com/APIParkLab/APIPark/service/service-doc"
	
	service_tag "github.com/APIParkLab/APIPark/service/service-tag"
	
	"github.com/APIParkLab/APIPark/service/subscribe"
	
	"github.com/eolinker/go-common/store"
	
	"gorm.io/gorm"
	
	"github.com/eolinker/go-common/utils"
	
	"github.com/APIParkLab/APIPark/service/release"
	
	"github.com/APIParkLab/APIPark/service/api"
	"github.com/eolinker/go-common/auto"
	
	"github.com/APIParkLab/APIPark/service/tag"
	
	"github.com/APIParkLab/APIPark/service/service"
	
	"github.com/google/uuid"
	
	"github.com/APIParkLab/APIPark/service/catalogue"
	
	catalogue_dto "github.com/APIParkLab/APIPark/module/catalogue/dto"
)

var (
	_        ICatalogueModule = (*imlCatalogueModule)(nil)
	_sortMax                  = math.MaxInt32 / 2
)

type imlCatalogueModule struct {
	catalogueService      catalogue.ICatalogueService      `autowired:""`
	apiService            api.IAPIService                  `autowired:""`
	serviceService        service.IServiceService          `autowired:""`
	serviceTagService     service_tag.ITagService          `autowired:""`
	serviceDocService     service_doc.IDocService          `autowired:""`
	tagService            tag.ITagService                  `autowired:""`
	releaseService        release.IReleaseService          `autowired:""`
	subscribeService      subscribe.ISubscribeService      `autowired:""`
	subscribeApplyService subscribe.ISubscribeApplyService `autowired:""`
	transaction           store.ITransaction               `autowired:""`
	
	root *Root
}

func (i *imlCatalogueModule) Subscribe(ctx context.Context, subscribeInfo *catalogue_dto.SubscribeService) error {
	if len(subscribeInfo.Applications) == 0 {
		return fmt.Errorf("applications is empty")
	}
	// 获取服务的基本信息
	s, err := i.serviceService.Get(ctx, subscribeInfo.Service)
	if err != nil {
		return fmt.Errorf("get service failed: %w", err)
	}
	if !s.AsServer {
		return fmt.Errorf("service does not support subscribe")
	}
	
	userId := utils.UserId(ctx)
	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		
		apps := make([]string, 0, len(subscribeInfo.Applications))
		
		for _, appId := range subscribeInfo.Applications {
			if appId == s.Id {
				// 不能订阅自己
				continue
			}
			
			appInfo, err := i.serviceService.Get(ctx, appId)
			if err != nil {
				return err
			}
			if !appInfo.AsApp {
				// 当系统不可作为订阅方时，不可订阅
				continue
			}
			//info, err := i.subscribeApplyService.GetApply(ctx, subscribeInfo.Service, appId)
			//if err != nil {
			//	if !errors.Is(err, gorm.ErrRecordNotFound) {
			//		return err
			//	}
			err = i.subscribeApplyService.Create(ctx, &subscribe.CreateApply{
				Uuid:        uuid.New().String(),
				Service:     subscribeInfo.Service,
				Team:        s.Team,
				Application: appId,
				ApplyTeam:   appInfo.Team,
				Reason:      subscribeInfo.Reason,
				Status:      subscribe.ApplyStatusReview,
				Applier:     userId,
			})
			
			//} else {
			//	status := subscribe.ApplyStatusReview
			//	err = i.subscribeApplyService.Save(ctx, info.Id, &subscribe.EditApply{
			//		Status:  &status,
			//		Applier: &userId,
			//	})
			//}
			if err != nil {
				return err
			}
			
			// 修改订阅表状态
			subscribers, err := i.subscribeService.ListByApplication(ctx, subscribeInfo.Service, appId)
			if err != nil {
				if !errors.Is(err, gorm.ErrRecordNotFound) {
					return err
				}
				err = i.subscribeService.Create(ctx, &subscribe.CreateSubscribe{
					Uuid:        uuid.New().String(),
					Service:     subscribeInfo.Service,
					Application: appId,
					ApplyStatus: subscribe.ApplyStatusReview,
					From:        subscribe.FromSubscribe,
				})
				if err != nil {
					return err
				}
				
			} else {
				subscriberMap := utils.SliceToMap(subscribers, func(t *subscribe.Subscribe) string {
					return t.Application
				})
				v, has := subscriberMap[appId]
				if !has {
					err = i.subscribeService.Create(ctx, &subscribe.CreateSubscribe{
						Uuid:        uuid.New().String(),
						Service:     subscribeInfo.Service,
						Application: appId,
						ApplyStatus: subscribe.ApplyStatusReview,
						From:        subscribe.FromSubscribe,
					})
					if err != nil {
						return err
					}
				} else if v.ApplyStatus != subscribe.ApplyStatusSubscribe {
					status := subscribe.ApplyStatusReview
					err = i.subscribeService.Save(ctx, v.Id, &subscribe.UpdateSubscribe{
						ApplyStatus: &status,
					})
				}
				
			}
			
			apps = append(apps, appId)
		}
		if len(apps) == 0 {
			return fmt.Errorf("no available apps")
		}
		return nil
	})
	
}

func (i *imlCatalogueModule) ServiceDetail(ctx context.Context, sid string) (*catalogue_dto.ServiceDetail, error) {
	// 获取服务的基本信息
	s, err := i.serviceService.Get(ctx, sid)
	if err != nil {
		return nil, fmt.Errorf("get service failed: %w", err)
	}
	docStr := ""
	doc, err := i.serviceDocService.Get(ctx, sid)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("get service doc failed: %w", err)
		}
	} else {
		docStr = doc.Doc
	}
	
	r, err := i.releaseService.GetRunning(ctx, s.Id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &catalogue_dto.ServiceDetail{
				Name:        s.Name,
				Description: s.Description,
				Document:    docStr,
				Basic: &catalogue_dto.ServiceBasic{
					Team:   auto.UUID(s.Team),
					ApiNum: 0,
				},
			}, nil
		}
		
		return nil, fmt.Errorf("get running release failed: %w", err)
	}
	_, docCommits, _, err := i.releaseService.GetReleaseInfos(ctx, r.UUID)
	if err != nil {
		return nil, fmt.Errorf("get release apis failed: %w", err)
	}
	apiMap := make(map[string]*release.APIDocumentCommit)
	apiIds := make([]string, 0, len(docCommits))
	for _, v := range docCommits {
		apiIds = append(apiIds, v.API)
		apiMap[v.API] = v
	}
	apiList, err := i.apiService.ListInfo(ctx, apiIds...)
	if err != nil {
		return nil, err
	}
	
	apis := make([]*catalogue_dto.ServiceApi, 0, len(apiList))
	for _, info := range apiList {
		basicApi := &catalogue_dto.ServiceApiBasic{
			Id:          info.UUID,
			Name:        info.Name,
			Description: info.Description,
			Method:      info.Method,
			Path:        info.Path,
			Creator:     auto.UUID(info.Creator),
			Updater:     auto.UUID(info.Updater),
			CreateTime:  auto.TimeLabel(info.CreateAt),
			UpdateTime:  auto.TimeLabel(info.UpdateAt),
		}
		v, ok := apiMap[info.UUID]
		if !ok {
			continue
		}
		commit, err := i.apiService.GetDocumentCommit(ctx, v.Commit)
		if err != nil {
			return nil, err
		}
		tmp := make(map[string]interface{})
		if commit.Data != nil {
			err = json.Unmarshal([]byte(commit.Data.Content), &tmp)
			if err != nil {
				return nil, err
			}
		}
		
		apis = append(apis, &catalogue_dto.ServiceApi{
			ServiceApiBasic: basicApi,
			Doc:             tmp,
		})
	}
	countMap, err := i.subscribeService.CountMapByService(ctx, subscribe.ApplyStatusSubscribe, sid)
	if err != nil {
		return nil, err
	}
	tags, err := i.serviceTagService.List(ctx, []string{sid}, nil)
	if err != nil {
		return nil, err
	}
	tagIds := utils.SliceToSlice(tags, func(t *service_tag.Tag) string {
		return t.Tid
	}, func(t *service_tag.Tag) bool {
		return t.Sid == sid
	})
	return &catalogue_dto.ServiceDetail{
		Name:        s.Name,
		Description: s.Description,
		Document:    docStr,
		Basic: &catalogue_dto.ServiceBasic{
			Team:       auto.UUID(s.Team),
			ApiNum:     len(apis),
			AppNum:     int(countMap[s.Id]),
			Tags:       auto.List(tagIds),
			Catalogue:  auto.UUID(s.Catalogue),
			Version:    r.Version,
			UpdateTime: auto.TimeLabel(r.CreateAt),
			Logo:       s.Logo,
		},
		Apis: apis,
	}, nil
}

func (i *imlCatalogueModule) Services(ctx context.Context, keyword string) ([]*catalogue_dto.ServiceItem, error) {
	
	serviceTags, err := i.serviceTagService.List(ctx, nil, nil)
	if err != nil {
		return nil, err
	}
	serviceTagMap := utils.SliceToMapArrayO(serviceTags, func(t *service_tag.Tag) (string, string) {
		return t.Sid, t.Tid
	})
	
	items, err := i.serviceService.SearchPublicServices(ctx, keyword)
	if err != nil {
		return nil, err
	}
	serviceIds := utils.SliceToSlice(items, func(i *service.Service) string {
		return i.Id
	}, func(s *service.Service) bool {
		// 未发布的不给展示
		_, err = i.releaseService.GetRunning(ctx, s.Id)
		return err == nil
	})
	if len(serviceIds) < 1 {
		return nil, nil
	}
	
	// 获取服务API数量
	apiCountMap, err := i.apiService.CountMapByService(ctx, serviceIds...)
	if err != nil {
		return nil, err
	}
	
	subscriberCountMap, err := i.subscribeService.CountMapByService(ctx, subscribe.ApplyStatusSubscribe, serviceIds...)
	if err != nil {
		return nil, err
	}
	
	result := make([]*catalogue_dto.ServiceItem, 0, len(items))
	for _, v := range items {
		apiNum, ok := apiCountMap[v.Id]
		if !ok || apiNum < 1 {
			continue
		}
		
		result = append(result, &catalogue_dto.ServiceItem{
			Id:            v.Id,
			Name:          v.Name,
			Tags:          auto.List(serviceTagMap[v.Id]),
			Catalogue:     auto.UUID(v.Catalogue),
			ApiNum:        apiNum,
			SubscriberNum: subscriberCountMap[v.Id],
			Description:   v.Description,
			Logo:          v.Logo,
		})
	}
	sort.Slice(result, func(i, j int) bool {
		if result[i].SubscriberNum != result[j].SubscriberNum {
			return result[i].SubscriberNum > result[j].SubscriberNum
		}
		if result[i].ApiNum != result[j].ApiNum {
			return result[i].ApiNum > result[j].ApiNum
		}
		return result[i].Name < result[j].Name
	})
	return result, nil
}

func (i *imlCatalogueModule) recurseUpdateSort(ctx context.Context, parent string, sorts []*catalogue_dto.SortItem) error {
	for index, item := range sorts {
		err := i.catalogueService.Save(ctx, item.Id, &catalogue.EditCatalogue{
			Parent: &parent,
			Sort:   &index,
		})
		if err != nil {
			return err
		}
		if len(item.Children) < 1 {
			continue
		}
		return i.recurseUpdateSort(ctx, item.Id, item.Children)
	}
	return nil
}

func (i *imlCatalogueModule) Sort(ctx context.Context, sorts []*catalogue_dto.SortItem) error {
	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		err := i.recurseUpdateSort(ctx, "", sorts)
		if err != nil {
			return err
		}
		all, err := i.catalogueService.List(ctx)
		if err != nil {
			return err
		}
		i.root = NewRoot(all)
		return nil
	})
	
}

func (i *imlCatalogueModule) Search(ctx context.Context, keyword string) ([]*catalogue_dto.Item, error) {
	all, err := i.catalogueService.List(ctx)
	if err != nil {
		return nil, err
	}
	if keyword == "" {
		parentMap := make(map[string][]*catalogue.Catalogue)
		nodeMap := make(map[string]*catalogue.Catalogue)
		for _, v := range all {
			if _, ok := parentMap[v.Parent]; !ok {
				parentMap[v.Parent] = make([]*catalogue.Catalogue, 0)
			}
			parentMap[v.Parent] = append(parentMap[v.Parent], v)
			nodeMap[v.Id] = v
		}
		return treeItems("", parentMap), nil
	}
	
	catalogues, err := i.catalogueService.Search(ctx, keyword, nil)
	if err != nil {
		return nil, err
	}
	if i.root == nil {
		// 初始化
		i.root = NewRoot(all)
	}
	items := make([]*catalogue_dto.Item, 0, len(catalogues))
	
	return items, nil
}

func (i *imlCatalogueModule) Create(ctx context.Context, input *catalogue_dto.CreateCatalogue) error {
	parent := ""
	if input.Parent != nil {
		parent = *input.Parent
	}
	if input.Id == "" {
		input.Id = uuid.New().String()
	}
	err := i.catalogueService.Create(ctx, &catalogue.CreateCatalogue{
		Id:     input.Id,
		Name:   input.Name,
		Parent: parent,
		Sort:   _sortMax,
	})
	if err != nil {
		return err
	}
	// 重新初始化
	catalogues, err := i.catalogueService.List(ctx)
	if err != nil {
		return err
	}
	i.root = NewRoot(catalogues)
	return nil
}

func (i *imlCatalogueModule) Edit(ctx context.Context, id string, input *catalogue_dto.EditCatalogue) error {
	err := i.catalogueService.Save(ctx, id, &catalogue.EditCatalogue{
		Name:   input.Name,
		Parent: input.Parent,
	})
	if err != nil {
		return err
	}
	// 重新初始化
	catalogues, err := i.catalogueService.List(ctx)
	if err != nil {
		return err
	}
	i.root = NewRoot(catalogues)
	return nil
}

func (i *imlCatalogueModule) Delete(ctx context.Context, id string) error {
	if id == "" {
		return nil
	}
	list, err := i.catalogueService.Search(ctx, "", map[string]interface{}{
		"parent": id,
	})
	if err != nil {
		return err
	}
	if len(list) > 0 {
		return fmt.Errorf("该目录下存在子目录")
	}
	err = i.catalogueService.Delete(ctx, id)
	if err != nil {
		return err
	}
	// 重新初始化
	catalogues, err := i.catalogueService.List(ctx)
	if err != nil {
		return err
	}
	i.root = NewRoot(catalogues)
	return nil
}

// treeItems 获取子树
func treeItems(parentId string, parentMap map[string][]*catalogue.Catalogue) []*catalogue_dto.Item {
	items := make([]*catalogue_dto.Item, 0)
	if _, ok := parentMap[parentId]; ok {
		for _, v := range parentMap[parentId] {
			childItems := treeItems(v.Id, parentMap)
			items = append(items, &catalogue_dto.Item{
				Id:       v.Id,
				Name:     v.Name,
				Children: childItems,
			})
		}
	}
	return items
}
