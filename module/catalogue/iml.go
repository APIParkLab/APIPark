package catalogue

import (
	"context"
	"errors"
	"fmt"
	"math"
	"sort"
	"strings"
	"time"

	mcp_server "github.com/APIParkLab/APIPark/mcp-server"

	service_overview "github.com/APIParkLab/APIPark/service/service-overview"

	"github.com/APIParkLab/APIPark/module/monitor/driver"

	"github.com/APIParkLab/APIPark/service/monitor"

	"github.com/APIParkLab/APIPark/service/setting"

	"github.com/eolinker/eosc/log"

	"github.com/APIParkLab/APIPark/gateway"
	"github.com/APIParkLab/APIPark/service/cluster"

	api_doc "github.com/APIParkLab/APIPark/service/api-doc"

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
	catalogueService       catalogue.ICatalogueService       `autowired:""`
	apiService             api.IAPIService                   `autowired:""`
	apiDocService          api_doc.IAPIDocService            `autowired:""`
	serviceService         service.IServiceService           `autowired:""`
	serviceOverviewService service_overview.IOverviewService `autowired:""`
	serviceTagService      service_tag.ITagService           `autowired:""`
	serviceDocService      service_doc.IDocService           `autowired:""`
	tagService             tag.ITagService                   `autowired:""`
	releaseService         release.IReleaseService           `autowired:""`
	subscribeService       subscribe.ISubscribeService       `autowired:""`
	subscribeApplyService  subscribe.ISubscribeApplyService  `autowired:""`
	transaction            store.ITransaction                `autowired:""`
	clusterService         cluster.IClusterService           `autowired:""`
	settingService         setting.ISettingService           `autowired:""`
	monitorService         monitor.IMonitorService           `autowired:""`
	root                   *Root
}

func (i *imlCatalogueModule) DefaultCatalogue(ctx context.Context) (*catalogue_dto.Catalogue, error) {
	catalogues, err := i.catalogueService.List(ctx)
	if err != nil {
		return nil, err
	}
	for _, v := range catalogues {
		if v.Parent == "" {
			return &catalogue_dto.Catalogue{
				Id:     v.Id,
				Name:   v.Name,
				Parent: v.Parent,
				Sort:   v.Sort,
			}, nil
		}
	}
	return nil, errors.New("no default catalogue")
}

func (i *imlCatalogueModule) onlineSubscriber(ctx context.Context, clusterId string, sub *gateway.SubscribeRelease) error {
	client, err := i.clusterService.GatewayClient(ctx, clusterId)
	if err != nil {
		return err
	}
	defer func() {
		_ = client.Close(ctx)
	}()
	return client.Subscribe().Online(ctx, sub)
}

func (i *imlCatalogueModule) Get(ctx context.Context, id string) (*catalogue_dto.Catalogue, error) {
	info, err := i.catalogueService.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	return &catalogue_dto.Catalogue{
		Id:     info.Id,
		Name:   info.Name,
		Parent: info.Parent,
		Sort:   info.Sort,
	}, nil
}

func (i *imlCatalogueModule) ExportAll(ctx context.Context) ([]*catalogue_dto.ExportCatalogue, error) {
	list, err := i.catalogueService.List(ctx)
	if err != nil {
		return nil, err
	}

	return utils.SliceToSlice(list, func(c *catalogue.Catalogue) *catalogue_dto.ExportCatalogue {
		return &catalogue_dto.ExportCatalogue{
			Id:     c.Id,
			Name:   c.Name,
			Parent: c.Parent,
			Sort:   c.Sort,
		}
	}), nil
}

func (i *imlCatalogueModule) getExecutor(ctx context.Context, clusterId string) (driver.IExecutor, error) {
	info, err := i.monitorService.GetByCluster(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	return driver.CreateExecutor(info.Driver, info.Config)
}

func (i *imlCatalogueModule) statistics(ctx context.Context, clusterId string, groupBy string, start, end time.Time, wheres []monitor.MonWhereItem, limit int) (map[string]monitor.MonCommonData, error) {
	executor, err := i.getExecutor(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	result, err := executor.CommonStatistics(ctx, start, end, groupBy, limit, wheres)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (i *imlCatalogueModule) genCommonWheres(ctx context.Context, clusterIds ...string) ([]monitor.MonWhereItem, error) {

	clusters, err := i.clusterService.List(ctx, clusterIds...)
	if err != nil {
		return nil, err
	}
	clusterIds = utils.SliceToSlice(clusters, func(item *cluster.Cluster) string {
		return item.Uuid
	})

	wheres := make([]monitor.MonWhereItem, 0, 1)
	nodes, err := i.clusterService.Nodes(ctx, clusterIds...)
	if err != nil {
		return nil, err
	}
	nodeIds := utils.SliceToSlice(nodes, func(s *cluster.Node) string {
		return s.Name
	})
	wheres = append(wheres, monitor.MonWhereItem{
		Key:       "node",
		Operation: "in",
		Values:    nodeIds,
	})

	return wheres, nil
}

func (i *imlCatalogueModule) ProviderStatistics(ctx context.Context, start, end time.Time, serviceIds ...string) (map[string]int64, error) {
	// 判断是否配置influxdb
	clusterId := cluster.DefaultClusterID
	_, err := i.monitorService.Get(ctx, clusterId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return make(map[string]int64), nil
		}
		return nil, err
	}
	_, err = i.clusterService.Get(ctx, clusterId)
	if err != nil {
		return nil, err
	}

	wheres, err := i.genCommonWheres(ctx, clusterId)
	if err != nil {
		return nil, err
	}

	if len(serviceIds) > 0 {
		wheres = append(wheres, monitor.MonWhereItem{
			Key:       "provider",
			Operation: "in",
			Values:    serviceIds,
		})
	}
	statisticMap, err := i.statistics(ctx, clusterId, "provider", start, end, wheres, 0)
	if err != nil {
		return nil, err
	}
	resultMap := make(map[string]int64)
	for key, item := range statisticMap {
		resultMap[key] = item.RequestTotal
	}

	return resultMap, nil
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
			status := subscribe.ApplyStatusReview
			if s.ApprovalType == service.ApprovalTypeAuto {
				status = subscribe.ApplyStatusSubscribe
				cs, err := i.clusterService.List(ctx)
				if err != nil {
					return err
				}
				for _, c := range cs {
					err := i.onlineSubscriber(ctx, c.Uuid, &gateway.SubscribeRelease{
						Service:     subscribeInfo.Service,
						Application: appId,
						Expired:     "0",
					})

					if err != nil {
						log.Errorf("online subscriber for cluster[%s] %v", c.Uuid, err)
					}
				}
			}

			err = i.subscribeApplyService.Create(ctx, &subscribe.CreateApply{
				Uuid:        uuid.New().String(),
				Service:     subscribeInfo.Service,
				Team:        s.Team,
				Application: appId,
				ApplyTeam:   appInfo.Team,
				Reason:      subscribeInfo.Reason,
				Status:      status,
				Applier:     userId,
			})

			if err != nil {
				return err
			}

			// 修改订阅表状态
			subscribers, err := i.subscribeService.ListByApplication(ctx, subscribeInfo.Service, appId)
			if err != nil {
				return err
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
						ApplyStatus: status,
						From:        subscribe.FromSubscribe,
					})
					if err != nil {
						return err
					}
				} else if v.ApplyStatus != subscribe.ApplyStatusSubscribe {
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
	r, err := i.releaseService.GetRunning(ctx, s.Id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &catalogue_dto.ServiceDetail{
				Name:        s.Name,
				Description: s.Description,
				Document:    "",
				Basic: &catalogue_dto.ServiceBasic{
					Team:   auto.UUID(s.Team),
					ApiNum: 0,
				},
			}, nil
		}

		return nil, fmt.Errorf("get running release failed: %w", err)
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
	_, _, apiDocCommit, _, serviceDocCommit, err := i.releaseService.GetReleaseInfos(ctx, r.UUID)
	if err != nil {
		return nil, fmt.Errorf("get release apis failed: %w", err)
	}
	var apiDoc string
	var apiNum int
	if apiDocCommit != nil {
		commit, err := i.apiDocService.GetDocCommit(ctx, apiDocCommit.Commit)
		if err != nil {
			return nil, err
		}
		apiDoc = commit.Data.Content
		apiNum = int(commit.Data.APICount)
	}

	var serviceDoc string
	if serviceDocCommit != nil {
		commit, err := i.serviceDocService.GetDocCommit(ctx, serviceDocCommit.Commit)
		if err != nil {
			return nil, err
		}
		serviceDoc = commit.Data.Content
	}
	invokeAddress, _ := i.settingService.Get(ctx, setting.KeyInvokeAddress)
	sitePrefix, _ := i.settingService.Get(ctx, setting.KeySitePrefix)
	mcpAccessAddress := ""
	mcpAccessConfig := ""
	if s.EnableMCP {
		if sitePrefix != "" {
			mcpAccessConfig = mcp_server.NewMCPConfig(
				mcp_server.TransportTypeStreamableHTTP,
				fmt.Sprintf("%s/openapi/v1/service/mcp", strings.TrimSuffix(sitePrefix, "/")),
				map[string]string{
					"Authorization": "Bearer {your_api_key}",
					"X-Service-Id":  s.Id,
				},
				nil,
			).ToString(fmt.Sprintf("APIPark/%s", s.Name))
		}
	}
	invokeMap, err := i.ProviderStatistics(ctx, time.Now().Add(-24*30*time.Hour), time.Now(), s.Id)
	if err != nil {
		return nil, err
	}

	return &catalogue_dto.ServiceDetail{
		Name:        s.Name,
		Description: s.Description,
		Document:    serviceDoc,
		Basic: &catalogue_dto.ServiceBasic{
			Team:          auto.UUID(s.Team),
			ApiNum:        apiNum,
			AppNum:        int(countMap[s.Id]),
			Tags:          auto.List(tagIds),
			Catalogue:     auto.UUID(s.Catalogue),
			Version:       r.Version,
			UpdateTime:    auto.TimeLabel(r.CreateAt),
			Logo:          s.Logo,
			ApprovalType:  s.ApprovalType.String(),
			ServiceKind:   s.Kind.String(),
			InvokeAddress: invokeAddress,
			SitePrefix:    sitePrefix,
			EnableMCP:     s.EnableMCP,
			InvokeCount:   invokeMap[s.Id],
		},
		APIDoc:           apiDoc,
		OpenAPIAddress:   fmt.Sprintf("%s/api/v1/service/apidoc/%s", strings.TrimSuffix(sitePrefix, "/"), s.Id),
		MCPServerAddress: mcpAccessAddress,
		MCPAccessConfig:  mcpAccessConfig,
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
	})
	overviewMap, err := i.serviceOverviewService.Map(ctx, serviceIds...)
	if err != nil {
		return nil, err
	}
	serviceIds = utils.SliceToSlice(serviceIds, func(s string) string {
		return s
	}, func(s string) bool {
		// 只展示已发布的服务
		if info, ok := overviewMap[s]; ok && info.IsReleased {
			return true
		}
		return false
	})
	if len(serviceIds) < 1 {
		return nil, nil
	}

	subscriberCountMap, err := i.subscribeService.CountMapByService(ctx, subscribe.ApplyStatusSubscribe, serviceIds...)
	if err != nil {
		return nil, err
	}
	invokeStatisticMap, err := i.ProviderStatistics(ctx, time.Now().Add(-24*30*time.Hour), time.Now(), serviceIds...)
	if err != nil {
		return nil, err
	}

	result := make([]*catalogue_dto.ServiceItem, 0, len(items))
	for _, v := range items {

		ov, ok := overviewMap[v.Id]
		if !ok || ov.ReleaseApiCount < 1 {
			continue
		}

		result = append(result, &catalogue_dto.ServiceItem{
			Id:            v.Id,
			Name:          v.Name,
			Tags:          auto.List(serviceTagMap[v.Id]),
			Catalogue:     auto.UUID(v.Catalogue),
			SubscriberNum: subscriberCountMap[v.Id],
			ApiNum:        ov.ReleaseApiCount,
			Description:   v.Description,
			Logo:          v.Logo,
			EnableMCP:     v.EnableMCP,
			ServiceKind:   v.Kind.String(),
			InvokeCount:   invokeStatisticMap[v.Id],
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
		s := index
		err := i.catalogueService.Save(ctx, item.Id, &catalogue.EditCatalogue{
			Parent: &parent,
			Sort:   &s,
		})
		if err != nil {
			return err
		}
		if len(item.Children) < 1 {
			continue
		}
		err = i.recurseUpdateSort(ctx, item.Id, item.Children)
		if err != nil {
			return err
		}
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
	index := _sortMax
	if input.Sort != nil {
		index = *input.Sort
	}
	err := i.catalogueService.Create(ctx, &catalogue.CreateCatalogue{
		Id:     input.Id,
		Name:   input.Name,
		Parent: parent,
		Sort:   index,
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
		Sort:   input.Sort,
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
				Sort:     v.Sort,
			})
		}
	}
	sort.Slice(items, func(i, j int) bool {
		return items[i].Sort < items[j].Sort
	})
	return items
}
