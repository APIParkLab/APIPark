package publish

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/eolinker/go-common/server"

	"github.com/eolinker/go-common/register"

	service_overview "github.com/APIParkLab/APIPark/service/service-overview"

	mcp_server "github.com/APIParkLab/APIPark/mcp-server"
	api_doc "github.com/APIParkLab/APIPark/service/api-doc"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mitchellh/mapstructure"

	strategy_driver "github.com/APIParkLab/APIPark/module/strategy/driver"
	strategy_dto "github.com/APIParkLab/APIPark/module/strategy/dto"

	"github.com/eolinker/eosc"

	"github.com/APIParkLab/APIPark/service/strategy"

	"github.com/eolinker/go-common/store"

	"github.com/APIParkLab/APIPark/service/service"

	"github.com/APIParkLab/APIPark/service/universally/commit"

	"github.com/APIParkLab/APIPark/service/api"
	"github.com/APIParkLab/APIPark/service/upstream"

	"github.com/APIParkLab/APIPark/gateway"

	"github.com/eolinker/eosc/log"

	"github.com/APIParkLab/APIPark/module/publish/dto"
	releaseModule "github.com/APIParkLab/APIPark/module/release"
	serviceDiff "github.com/APIParkLab/APIPark/module/service-diff"
	"github.com/APIParkLab/APIPark/service/cluster"
	"github.com/APIParkLab/APIPark/service/publish"
	"github.com/APIParkLab/APIPark/service/release"
	"github.com/eolinker/go-common/utils"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	_        IPublishModule = (*imlPublishModule)(nil)
	asServer                = map[string]bool{
		"as_server": true,
	}
)

type imlPublishModule struct {
	projectDiffModule      serviceDiff.IServiceDiffModule    `autowired:""`
	releaseModule          releaseModule.IReleaseModule      `autowired:""`
	publishService         publish.IPublishService           `autowired:""`
	apiService             api.IAPIService                   `autowired:""`
	apiDocService          api_doc.IAPIDocService            `autowired:""`
	upstreamService        upstream.IUpstreamService         `autowired:""`
	strategyService        strategy.IStrategyService         `autowired:""`
	releaseService         release.IReleaseService           `autowired:""`
	clusterService         cluster.IClusterService           `autowired:""`
	serviceService         service.IServiceService           `autowired:""`
	serviceOverviewService service_overview.IOverviewService `autowired:""`
	transaction            store.ITransaction                `autowired:""`
}

func (i *imlPublishModule) OnInit() {
	register.Handle(func(v server.Server) {
		ctx := context.Background()
		list, err := i.releaseService.GetRunningList(ctx)
		if err != nil {
			log.Errorf("onInit: get running list failed:%s", err.Error())
			return
		}
		if len(list) < 1 {
			return
		}

		serviceMap := make(map[string]*release.Release)
		serviceIds := make([]string, 0, len(list))
		for _, v := range list {
			if _, ok := serviceMap[v.Service]; !ok {
				serviceMap[v.Service] = v
				serviceIds = append(serviceIds, v.Service)
			}
		}
		overviewList, err := i.serviceOverviewService.List(ctx, serviceIds...)
		if err != nil {
			log.Errorf("onInit: get running list failed:%s", err.Error())
			return
		}
		for _, v := range overviewList {
			if v.IsReleased {
				return
			}
		}

		listCommits, err := i.apiDocService.ListLatestDocCommit(ctx, serviceIds...)
		if err != nil {
			log.Errorf("onInit: get running api doc commits failed:%s", err.Error())
			return
		}
		isReleased := true
		for _, v := range listCommits {
			i.serviceOverviewService.Update(ctx, v.Target, &service_overview.Update{
				ApiCount:        nil,
				ReleaseApiCount: &v.Data.APICount,
				IsReleased:      &isReleased,
			})
		}
	})
}

func (i *imlPublishModule) initGateway(ctx context.Context, partitionId string, clientDriver gateway.IClientDriver) error {
	return nil
	//projects, err := i.serviceService.List(ctx)
	//if err != nil {
	//	return err
	//}
	//projectIds := utils.SliceToSlice(projects, func(p *service.Service) string {
	//	return p.Id
	//})
	//for _, projectId := range projectIds {
	//	releaseInfo, err := i.GetProjectRelease(ctx, projectId, partitionId)
	//	if err != nil {
	//		return err
	//	}
	//	if releaseInfo == nil {
	//		continue
	//	}
	//
	//	err = clientDriver.Project().Online(ctx, releaseInfo)
	//	if err != nil {
	//		return err
	//	}
	//}
	//return nil
}

func (i *imlPublishModule) getProjectRelease(ctx context.Context, projectID string, commitId string) (*gateway.ProjectRelease, error) {
	commits, err := i.releaseService.GetCommits(ctx, commitId)
	if err != nil {
		return nil, err
	}
	apiIds := make([]string, 0, len(commits))
	apiProxyCommitIds := make([]string, 0, len(commits))
	upstreamCommitIds := make([]string, 0, len(commits))
	strategyCommitIds := make([]string, 0, len(commits))
	for _, c := range commits {
		switch c.Type {
		case release.CommitApiProxy:
			apiIds = append(apiIds, c.Target)
			apiProxyCommitIds = append(apiProxyCommitIds, c.Commit)
		case release.CommitUpstream:
			upstreamCommitIds = append(upstreamCommitIds, c.Commit)
		case release.CommitStrategy:
			strategyCommitIds = append(strategyCommitIds, c.Commit)
		}
	}
	serviceInfo, err := i.serviceService.Get(ctx, projectID)
	if err != nil {
		return nil, err
	}

	apiInfos, err := i.apiService.ListInfo(ctx, apiIds...)
	if err != nil {
		return nil, err
	}

	proxyCommits, err := i.apiService.ListProxyCommit(ctx, apiProxyCommitIds...)
	if err != nil {
		return nil, err
	}
	proxyCommitMap := utils.SliceToMapO(proxyCommits, func(c *commit.Commit[api.Proxy]) (string, *api.Proxy) {
		return c.Target, c.Data
	})

	version := commitId
	r := &gateway.ProjectRelease{
		Id:      projectID,
		Version: version,
	}
	apis := make([]*gateway.ApiRelease, 0, len(apiInfos))
	hasUpstream := len(upstreamCommitIds) > 0
	for _, a := range apiInfos {
		apiInfo := &gateway.ApiRelease{
			BasicItem: &gateway.BasicItem{
				ID:          a.UUID,
				Description: a.Description,
				Version:     version,
			},
			Path:    a.Path,
			Methods: a.Methods,
			Labels: map[string]string{
				"api_kind": serviceInfo.Kind.String(),
			},
			//Service: a.Upstream,
		}
		if hasUpstream {
			apiInfo.Service = a.Upstream
		}
		proxy, ok := proxyCommitMap[a.UUID]
		if ok {
			apiInfo.Plugins = utils.MapChange(proxy.Plugins, func(v api.PluginSetting) *gateway.Plugin {
				return &gateway.Plugin{
					Config:  v.Config,
					Disable: v.Disable,
				}
			})
			apiInfo.Extends = proxy.Extends
			apiInfo.ProxyPath = proxy.Path
			apiInfo.ProxyHeaders = utils.SliceToSlice(proxy.Headers, func(h *api.Header) *gateway.ProxyHeader {
				return &gateway.ProxyHeader{
					Key:   h.Key,
					Value: h.Value,
					Opt:   h.OptType,
				}
			})
			apiInfo.Retry = proxy.Retry
			apiInfo.Timeout = proxy.Timeout
		}
		apis = append(apis, apiInfo)
	}
	r.Apis = apis
	var upstreamRelease *gateway.UpstreamRelease
	if len(upstreamCommitIds) > 0 {
		upstreamCommits, err := i.upstreamService.ListCommit(ctx, upstreamCommitIds...)
		if err != nil {
			return nil, err
		}
		for _, c := range upstreamCommits {
			upstreamRelease = &gateway.UpstreamRelease{
				BasicItem: &gateway.BasicItem{
					ID:      c.Target,
					Version: version,
					MatchLabels: map[string]string{
						"serviceId": projectID,
					},
				},
				PassHost: c.Data.PassHost,
				Scheme:   c.Data.Scheme,
				Balance:  c.Data.Balance,
				Timeout:  c.Data.Timeout,
				Nodes: utils.SliceToSlice(c.Data.Nodes, func(n *upstream.NodeConfig) string {
					return fmt.Sprintf("%s weight=%d", n.Address, n.Weight)
				}),
			}
		}
		r.Upstream = upstreamRelease
	}
	if len(strategyCommitIds) > 0 {
		strategyCommits, err := i.strategyService.ListStrategyCommit(ctx, strategyCommitIds...)
		if err != nil {
			return nil, err
		}
		strategyReleases := make([]*eosc.Base[gateway.StrategyRelease], 0, len(strategyCommits))
		for _, c := range strategyCommits {
			s := c.Data
			driver, has := strategy_driver.GetDriver(c.Data.Driver)
			if !has {
				continue
			}
			filters := make([]*strategy_dto.Filter, 0)
			json.Unmarshal([]byte(s.Filters), &filters)
			var cfg interface{}
			json.Unmarshal([]byte(s.Config), &cfg)
			strategyReleases = append(strategyReleases, driver.ToRelease(&strategy_dto.Strategy{
				Id:       fmt.Sprintf("%s", s.Id),
				Name:     s.Name,
				Priority: s.Priority,
				Filters:  filters,
				Config:   cfg,
				IsDelete: s.IsDelete || s.IsStop,
			}, map[string][]string{
				"provider": {projectID},
			}, 0))
		}
		r.Strategies = strategyReleases
	}

	return r, nil
}

func (i *imlPublishModule) GetProjectRelease(ctx context.Context, projectID string, partitionId string) (*gateway.ProjectRelease, error) {

	releaseInfo, err := i.releaseService.GetRunning(ctx, projectID)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return nil, nil
	}

	return i.getProjectRelease(ctx, projectID, releaseInfo.UUID)
}

func (i *imlPublishModule) getReleaseInfo(ctx context.Context, projectID, releaseId, version string, clusterIds []string) (map[string]*gateway.ProjectRelease, error) {
	projectRelease, err := i.getProjectRelease(ctx, projectID, releaseId)
	if err != nil {
		return nil, err
	}

	projectReleaseMap := make(map[string]*gateway.ProjectRelease)
	for _, clusterId := range clusterIds {
		projectReleaseMap[clusterId] = &gateway.ProjectRelease{
			Id:         projectID,
			Version:    version,
			Apis:       projectRelease.Apis,
			Upstream:   projectRelease.Upstream,
			Strategies: projectRelease.Strategies,
		}
	}
	return projectReleaseMap, nil
}

func (i *imlPublishModule) PublishStatuses(ctx context.Context, serviceId string, id string) ([]*dto.PublishStatus, error) {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}
	flow, err := i.publishService.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if flow.Service != serviceId {
		return nil, errors.New("服务不一致")
	}
	list, err := i.publishService.GetPublishStatus(ctx, id)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, func(s *publish.Status) *dto.PublishStatus {
		status := s.Status
		errMsg := s.Error
		if s.Status == publish.StatusPublishing && time.Now().Sub(s.UpdateAt) > 30*time.Second {
			status = publish.StatusPublishError
			errMsg = "发布超时"
		}
		return &dto.PublishStatus{
			//Cluster: auto.UUID(s.Cluster),
			Status: status.String(),
			Error:  errMsg,
		}

	}), nil
}

// Apply applies the changes to the imlPublishModule.
//
// ctx context.Context, serviceId string, input *dto.ApplyInput
// *dto.Publish, error
func (i *imlPublishModule) Apply(ctx context.Context, serviceId string, input *dto.ApplyInput) (*dto.Publish, error) {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}
	err = i.checkPublish(ctx, serviceId, input.Release)
	if err != nil {
		return nil, err
	}

	previous := ""
	running, err := i.releaseService.GetRunning(ctx, serviceId)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {

		return nil, err
	}
	if running != nil {
		previous = running.UUID
	}

	releaseToPublish, err := i.releaseService.GetRelease(ctx, input.Release)
	if err != nil {
		// 目标版本不存在
		return nil, err
	}

	newPublishId := uuid.NewString()
	diff, ok, err := i.projectDiffModule.DiffForLatest(ctx, serviceId, previous)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, errors.New("latest completeness check failed")
	}
	err = i.publishService.Create(ctx, newPublishId, serviceId, releaseToPublish.UUID, previous, releaseToPublish.Version, input.Remark, diff)
	if err != nil {
		return nil, err
	}
	np, err := i.publishService.Get(ctx, newPublishId)
	if err != nil {
		return nil, err
	}
	return dto.FromModel(np, releaseToPublish.Remark), nil
}

func (i *imlPublishModule) CheckPublish(ctx context.Context, serviceId string, releaseId string) (*dto.DiffOut, error) {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}
	err = i.checkPublish(ctx, serviceId, releaseId)
	if err != nil {
		return nil, err
	}

	running, err := i.releaseService.GetRunning(ctx, serviceId)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	runningReleaseId := ""
	if running != nil {
		runningReleaseId = running.UUID
	}
	if releaseId == "" {
		// 发布latest 版本
		diff, _, err := i.projectDiffModule.DiffForLatest(ctx, serviceId, runningReleaseId)
		if err != nil {
			return nil, err
		}
		return i.projectDiffModule.Out(ctx, diff)
	} else {
		// 发布 releaseId 版本, 返回 与当前版本的差异
		diff, err := i.projectDiffModule.Diff(ctx, serviceId, runningReleaseId, releaseId)
		if err != nil {
			return nil, err
		}
		return i.projectDiffModule.Out(ctx, diff)
	}

}
func (i *imlPublishModule) checkPublish(ctx context.Context, serviceId string, releaseId string) error {
	flows, err := i.publishService.ListForStatus(ctx, serviceId, publish.StatusApply, publish.StatusAccept)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	if len(flows) > 0 {
		return errors.New("正在发布中")
	}
	running, err := i.releaseService.GetRunning(ctx, serviceId)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	if running == nil {
		return nil
	}
	if running.UUID == releaseId {
		return errors.New("不能申请发布当前版本")
	}
	return nil
}
func (i *imlPublishModule) Close(ctx context.Context, serviceId, id string) error {
	err := i.publishService.SetStatus(ctx, serviceId, id, publish.StatusClose)
	if err != nil {
		return err
	}

	return nil
}

func (i *imlPublishModule) Stop(ctx context.Context, serviceId string, id string) error {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return err
	}
	flow, err := i.publishService.Get(ctx, id)
	if err != nil {
		return err
	}
	if flow.Service != serviceId {
		return errors.New("项目不一致")
	}

	if flow.Status != publish.StatusApply && flow.Status != publish.StatusAccept {
		return errors.New("只有发布中状态才能停止")
	}
	status := publish.StatusStop
	if flow.Status == publish.StatusApply {
		status = publish.StatusClose
	}
	return i.publishService.SetStatus(ctx, serviceId, id, status)
}

func (i *imlPublishModule) Refuse(ctx context.Context, serviceId string, id string, commits string) error {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return err
	}
	return i.publishService.Refuse(ctx, serviceId, id, commits)
}

func (i *imlPublishModule) Accept(ctx context.Context, serviceId string, id string, commits string) error {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return err
	}
	return i.publishService.Accept(ctx, serviceId, id, commits)
}

func (i *imlPublishModule) publish(ctx context.Context, id string, clusterId string, projectRelease *gateway.ProjectRelease) error {

	publishStatus := &publish.Status{
		Publish:  id,
		Status:   publish.StatusPublishing,
		UpdateAt: time.Now(),
	}
	err := i.publishService.SetPublishStatus(ctx, publishStatus)
	if err != nil {
		return fmt.Errorf("set publishing publishStatus error: %v", err)
	}
	defer func() {
		err := i.publishService.SetPublishStatus(ctx, publishStatus)
		if err != nil {
			log.Errorf("set publishing publishStatus error: %v", err)
		}
	}()

	client, err := i.clusterService.GatewayClient(ctx, clusterId)
	if err != nil {
		publishStatus.Status = publish.StatusPublishError
		publishStatus.Error = err.Error()
		publishStatus.UpdateAt = time.Now()
		return fmt.Errorf("get gateway client error: %v", err)
	}
	defer func() {
		err := client.Close(ctx)
		if err != nil {
			log.Warn("close apinto client:", err)
		}
	}()
	err = client.Project().Online(ctx, projectRelease)
	if err != nil {
		publishStatus.Status = publish.StatusPublishError
		publishStatus.Error = err.Error()
		publishStatus.UpdateAt = time.Now()
		return fmt.Errorf("online error: %v", err)
	}
	apiIds := utils.SliceToSlice(projectRelease.Apis, func(api *gateway.ApiRelease) string {
		return api.ID
	})
	client.Service().Online(ctx, &gateway.ServiceRelease{
		ID:   projectRelease.Id,
		Apis: apiIds,
	})
	publishStatus.Status = publish.StatusDone
	publishStatus.UpdateAt = time.Now()
	return nil
}

func (i *imlPublishModule) Publish(ctx context.Context, serviceId string, id string) error {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return err
	}
	flow, err := i.publishService.Get(ctx, id)
	if err != nil {
		return err
	}
	if flow.Service != serviceId {
		return errors.New("服务不一致")
	}
	if flow.Status != publish.StatusAccept && flow.Status != publish.StatusDone {
		return errors.New("只有通过状态才能发布")
	}
	clusters, err := i.clusterService.List(ctx)
	if err != nil {
		return err
	}
	clusterIds := utils.SliceToSlice(clusters, func(i *cluster.Cluster) string {
		return i.Uuid
	})

	projectReleaseMap, err := i.getReleaseInfo(ctx, serviceId, flow.Release, flow.Release, clusterIds)
	if err != nil {
		return err
	}
	hasError := false
	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		for _, c := range clusters {
			err = i.publish(ctx, flow.Id, c.Uuid, projectReleaseMap[c.Uuid])
			if err != nil {
				hasError = true
				log.Error(err)
				continue
			}
		}
		err = i.releaseService.SetRunning(ctx, serviceId, flow.Release)
		if err != nil {
			return err
		}
		status := publish.StatusDone
		if hasError {
			status = publish.StatusPublishError
		}
		if status == publish.StatusDone {
			info, err := i.serviceService.Get(ctx, serviceId)
			if err != nil {
				return err
			}
			if info.EnableMCP {
				err = i.updateMCPServer(ctx, serviceId, info.Name, flow.Version)
				if err != nil {
					return err
				}
			}
			apidocCommit, err := i.apiDocService.LatestDocCommit(ctx, serviceId)
			if err != nil {
				return err
			}
			isReleased := true
			i.serviceOverviewService.Update(ctx, serviceId, &service_overview.Update{
				ReleaseApiCount: &apidocCommit.Data.APICount,
				IsReleased:      &isReleased,
			})
		}
		return i.publishService.SetStatus(ctx, serviceId, id, status)
	})

}

func (i *imlPublishModule) List(ctx context.Context, serviceId string, page, pageSize int) ([]*dto.Publish, int64, error) {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, 0, err
	}
	list, total, err := i.publishService.ListProjectPage(ctx, serviceId, page, pageSize)
	if err != nil {
		return nil, 0, err
	}

	return utils.SliceToSlice(list, func(s *publish.Publish) *dto.Publish {
		return dto.FromModel(s, "")
	}), total, nil
}

func (i *imlPublishModule) updateMCPServer(ctx context.Context, sid string, name string, version string) error {
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
			//switch a.ContentType {
			//case "application/json":
			switch tmp.Type {
			case "object":
				toolOptions = append(toolOptions, mcp.WithObject(mcp_server.MCPBody, mcp.Properties(tmp.Properties), mcp.Description("request body,it is avalible when method is POST、PUT、PATCH.")))
			case "array":
				toolOptions = append(toolOptions, mcp.WithArray(mcp_server.MCPBody, mcp.Items(tmp.Items), mcp.Description("request body,it is avalible when method is POST、PUT、PATCH.")))
			}
			//case "application/x-www-form-urlencoded":
			//	toolOptions = append(toolOptions, mcp.WithString(mcp_server.MCPBody, mcp.Items(tmp.Items), mcp.Description("request body,it is avalible when method is POST、PUT、PATCH.")))

		}
		tools = append(tools, mcp_server.NewTool(a.Summary, a.Path, a.Method, a.ContentType, toolOptions...))
	}
	mcp_server.SetSSEServer(sid, name, version, tools...)
	return nil
}

func (i *imlPublishModule) Detail(ctx context.Context, serviceId string, id string) (*dto.PublishDetail, error) {
	_, err := i.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}
	flow, err := i.publishService.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if flow.Service != serviceId {
		return nil, errors.New("项目不一致")
	}
	diff, err := i.publishService.GetDiff(ctx, id)
	if err != nil {
		return nil, err
	}
	out, err := i.projectDiffModule.Out(ctx, diff)
	if err != nil {
		return nil, err
	}
	publishStatuses, err := i.PublishStatuses(ctx, serviceId, id)
	if err != nil {
		return nil, err
	}
	releaseInfo, err := i.releaseService.GetRelease(ctx, flow.Release)
	if err != nil {
		return nil, err
	}
	return &dto.PublishDetail{
		Publish:         dto.FromModel(flow, releaseInfo.Remark),
		Diffs:           out,
		PublishStatuses: publishStatuses,
	}, nil

}
