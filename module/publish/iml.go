package publish

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

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
	projectDiffModule serviceDiff.IServiceDiffModule `autowired:""`
	releaseModule     releaseModule.IReleaseModule   `autowired:""`
	publishService    publish.IPublishService        `autowired:""`
	apiService        api.IAPIService                `autowired:""`
	upstreamService   upstream.IUpstreamService      `autowired:""`
	strategyService   strategy.IStrategyService      `autowired:""`
	releaseService    release.IReleaseService        `autowired:""`
	clusterService    cluster.IClusterService        `autowired:""`
	serviceService    service.IServiceService        `autowired:""`
	transaction       store.ITransaction             `autowired:""`
}

func (m *imlPublishModule) initGateway(ctx context.Context, partitionId string, clientDriver gateway.IClientDriver) error {
	return nil
	projects, err := m.serviceService.List(ctx)
	if err != nil {
		return err
	}
	projectIds := utils.SliceToSlice(projects, func(p *service.Service) string {
		return p.Id
	})
	for _, projectId := range projectIds {
		releaseInfo, err := m.GetProjectRelease(ctx, projectId, partitionId)
		if err != nil {
			return err
		}
		if releaseInfo == nil {
			continue
		}

		err = clientDriver.Project().Online(ctx, releaseInfo)
		if err != nil {
			return err
		}
	}
	return nil
}

func (m *imlPublishModule) getProjectRelease(ctx context.Context, projectID string, commitId string) (*gateway.ProjectRelease, error) {
	commits, err := m.releaseService.GetCommits(ctx, commitId)
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

	apiInfos, err := m.apiService.ListInfo(ctx, apiIds...)
	if err != nil {
		return nil, err
	}

	proxyCommits, err := m.apiService.ListProxyCommit(ctx, apiProxyCommitIds...)
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
	for _, a := range apiInfos {
		apiInfo := &gateway.ApiRelease{
			BasicItem: &gateway.BasicItem{
				ID:          a.UUID,
				Description: a.Description,
				Version:     version,
			},
			Path:    a.Path,
			Methods: a.Methods,
			Service: a.Upstream,
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
		upstreamCommits, err := m.upstreamService.ListCommit(ctx, upstreamCommitIds...)
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
		strategyCommits, err := m.strategyService.ListStrategyCommit(ctx, strategyCommitIds...)
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

func (m *imlPublishModule) GetProjectRelease(ctx context.Context, projectID string, partitionId string) (*gateway.ProjectRelease, error) {

	releaseInfo, err := m.releaseService.GetRunning(ctx, projectID)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return nil, nil
	}

	return m.getProjectRelease(ctx, projectID, releaseInfo.UUID)
}

func (m *imlPublishModule) getReleaseInfo(ctx context.Context, projectID, releaseId, version string, clusterIds []string) (map[string]*gateway.ProjectRelease, error) {
	projectRelease, err := m.getProjectRelease(ctx, projectID, releaseId)
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

func (m *imlPublishModule) PublishStatuses(ctx context.Context, serviceId string, id string) ([]*dto.PublishStatus, error) {
	_, err := m.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}
	flow, err := m.publishService.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if flow.Service != serviceId {
		return nil, errors.New("服务不一致")
	}
	list, err := m.publishService.GetPublishStatus(ctx, id)
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
func (m *imlPublishModule) Apply(ctx context.Context, serviceId string, input *dto.ApplyInput) (*dto.Publish, error) {
	_, err := m.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}
	err = m.checkPublish(ctx, serviceId, input.Release)
	if err != nil {
		return nil, err
	}

	previous := ""
	running, err := m.releaseService.GetRunning(ctx, serviceId)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {

		return nil, err
	}
	if running != nil {
		previous = running.UUID
	}

	releaseToPublish, err := m.releaseService.GetRelease(ctx, input.Release)
	if err != nil {
		// 目标版本不存在
		return nil, err
	}

	newPublishId := uuid.NewString()
	diff, ok, err := m.projectDiffModule.DiffForLatest(ctx, serviceId, previous)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, errors.New("latest completeness check failed")
	}
	err = m.publishService.Create(ctx, newPublishId, serviceId, releaseToPublish.UUID, previous, releaseToPublish.Version, input.Remark, diff)
	if err != nil {
		return nil, err
	}
	np, err := m.publishService.Get(ctx, newPublishId)
	if err != nil {
		return nil, err
	}
	return dto.FromModel(np, releaseToPublish.Remark), nil
}

func (m *imlPublishModule) CheckPublish(ctx context.Context, serviceId string, releaseId string) (*dto.DiffOut, error) {
	_, err := m.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}
	err = m.checkPublish(ctx, serviceId, releaseId)
	if err != nil {
		return nil, err
	}

	running, err := m.releaseService.GetRunning(ctx, serviceId)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	runningReleaseId := ""
	if running != nil {
		runningReleaseId = running.UUID
	}
	if releaseId == "" {
		// 发布latest 版本
		diff, _, err := m.projectDiffModule.DiffForLatest(ctx, serviceId, runningReleaseId)
		if err != nil {
			return nil, err
		}
		return m.projectDiffModule.Out(ctx, diff)
	} else {
		// 发布 releaseId 版本, 返回 与当前版本的差异
		diff, err := m.projectDiffModule.Diff(ctx, serviceId, runningReleaseId, releaseId)
		if err != nil {
			return nil, err
		}
		return m.projectDiffModule.Out(ctx, diff)
	}

}
func (m *imlPublishModule) checkPublish(ctx context.Context, serviceId string, releaseId string) error {
	flows, err := m.publishService.ListForStatus(ctx, serviceId, publish.StatusApply, publish.StatusAccept)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	if len(flows) > 0 {
		return errors.New("正在发布中")
	}
	running, err := m.releaseService.GetRunning(ctx, serviceId)
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
func (m *imlPublishModule) Close(ctx context.Context, serviceId, id string) error {
	err := m.publishService.SetStatus(ctx, serviceId, id, publish.StatusClose)
	if err != nil {
		return err
	}

	return nil
}

func (m *imlPublishModule) Stop(ctx context.Context, serviceId string, id string) error {
	_, err := m.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return err
	}
	flow, err := m.publishService.Get(ctx, id)
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
	return m.publishService.SetStatus(ctx, serviceId, id, status)
}

func (m *imlPublishModule) Refuse(ctx context.Context, serviceId string, id string, commits string) error {
	_, err := m.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return err
	}
	return m.publishService.Refuse(ctx, serviceId, id, commits)
}

func (m *imlPublishModule) Accept(ctx context.Context, serviceId string, id string, commits string) error {
	_, err := m.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return err
	}
	return m.publishService.Accept(ctx, serviceId, id, commits)
}

func (m *imlPublishModule) publish(ctx context.Context, id string, clusterId string, projectRelease *gateway.ProjectRelease) error {

	publishStatus := &publish.Status{
		Publish:  id,
		Status:   publish.StatusPublishing,
		UpdateAt: time.Now(),
	}
	err := m.publishService.SetPublishStatus(ctx, publishStatus)
	if err != nil {
		return fmt.Errorf("set publishing publishStatus error: %v", err)
	}
	defer func() {
		err := m.publishService.SetPublishStatus(ctx, publishStatus)
		if err != nil {
			log.Errorf("set publishing publishStatus error: %v", err)
		}
	}()

	client, err := m.clusterService.GatewayClient(ctx, clusterId)
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

func (m *imlPublishModule) Publish(ctx context.Context, serviceId string, id string) error {
	_, err := m.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return err
	}
	flow, err := m.publishService.Get(ctx, id)
	if err != nil {
		return err
	}
	if flow.Service != serviceId {
		return errors.New("服务不一致")
	}
	if flow.Status != publish.StatusAccept && flow.Status != publish.StatusDone {
		return errors.New("只有通过状态才能发布")
	}
	clusters, err := m.clusterService.List(ctx)
	if err != nil {
		return err
	}
	clusterIds := utils.SliceToSlice(clusters, func(i *cluster.Cluster) string {
		return i.Uuid
	})

	projectReleaseMap, err := m.getReleaseInfo(ctx, serviceId, flow.Release, flow.Release, clusterIds)
	if err != nil {
		return err
	}
	hasError := false

	for _, c := range clusters {
		err = m.publish(ctx, flow.Id, c.Uuid, projectReleaseMap[c.Uuid])
		if err != nil {
			hasError = true
			log.Error(err)
			continue
		}
	}
	err = m.releaseService.SetRunning(ctx, serviceId, flow.Release)
	if err != nil {
		return err
	}
	status := publish.StatusDone
	if hasError {
		status = publish.StatusPublishError
	}
	return m.publishService.SetStatus(ctx, serviceId, id, status)
}

func (m *imlPublishModule) List(ctx context.Context, serviceId string, page, pageSize int) ([]*dto.Publish, int64, error) {
	_, err := m.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, 0, err
	}
	list, total, err := m.publishService.ListProjectPage(ctx, serviceId, page, pageSize)
	if err != nil {
		return nil, 0, err
	}

	return utils.SliceToSlice(list, func(s *publish.Publish) *dto.Publish {
		return dto.FromModel(s, "")
	}), total, nil
}

func (m *imlPublishModule) Detail(ctx context.Context, serviceId string, id string) (*dto.PublishDetail, error) {
	_, err := m.serviceService.Check(ctx, serviceId, asServer)
	if err != nil {
		return nil, err
	}
	flow, err := m.publishService.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if flow.Service != serviceId {
		return nil, errors.New("项目不一致")
	}
	diff, err := m.publishService.GetDiff(ctx, id)
	if err != nil {
		return nil, err
	}
	out, err := m.projectDiffModule.Out(ctx, diff)
	if err != nil {
		return nil, err
	}
	publishStatuses, err := m.PublishStatuses(ctx, serviceId, id)
	if err != nil {
		return nil, err
	}
	releaseInfo, err := m.releaseService.GetRelease(ctx, flow.Release)
	if err != nil {
		return nil, err
	}
	return &dto.PublishDetail{
		Publish:         dto.FromModel(flow, releaseInfo.Remark),
		Diffs:           out,
		PublishStatuses: publishStatuses,
	}, nil

}
