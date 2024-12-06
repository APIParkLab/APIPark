package service_diff

import (
	"context"
	"errors"
	"fmt"

	"github.com/APIParkLab/APIPark/service/strategy"

	"github.com/APIParkLab/APIPark/service/service"

	"github.com/APIParkLab/APIPark/service/api"
	api_doc "github.com/APIParkLab/APIPark/service/api-doc"
	"github.com/APIParkLab/APIPark/service/cluster"
	"github.com/APIParkLab/APIPark/service/release"
	"github.com/APIParkLab/APIPark/service/service_diff"
	"github.com/APIParkLab/APIPark/service/universally/commit"
	"github.com/APIParkLab/APIPark/service/upstream"
	"github.com/eolinker/go-common/utils"
)

type imlServiceDiff struct {
	apiService      api.IAPIService           `autowired:""`
	serviceService  service.IServiceService   `autowired:""`
	apiDocService   api_doc.IAPIDocService    `autowired:""`
	upstreamService upstream.IUpstreamService `autowired:""`
	releaseService  release.IReleaseService   `autowired:""`
	strategyService strategy.IStrategyService `autowired:""`
	clusterService  cluster.IClusterService   `autowired:""`
}

func (m *imlServiceDiff) Diff(ctx context.Context, serviceId string, baseRelease, targetRelease string) (*service_diff.Diff, error) {
	if targetRelease == "" {
		return nil, fmt.Errorf("target release is required")
	}

	var target *projectInfo

	targetReleaseValue, err := m.releaseService.GetRelease(ctx, targetRelease)
	if err != nil {
		return nil, fmt.Errorf("get target release  failed:%w", err)
	}
	if targetReleaseValue.Service != serviceId {
		return nil, errors.New("project not match")
	}

	target, err = m.getReleaseInfo(ctx, targetRelease)
	if err != nil {
		return nil, err
	}
	base, err := m.getBaseInfo(ctx, serviceId, baseRelease)
	if err != nil {
		return nil, err
	}
	target.id = serviceId
	clusters, err := m.clusterService.List(ctx)
	if err != nil {
		return nil, err
	}
	clusterIds := utils.SliceToSlice(clusters, func(i *cluster.Cluster) string {
		return i.Uuid
	})
	diff := m.diff(clusterIds, base, target)
	return diff, nil

}
func (m *imlServiceDiff) getBaseInfo(ctx context.Context, serviceId, baseRelease string) (*projectInfo, error) {
	if baseRelease == "" {
		return &projectInfo{}, nil
	}
	baseReleaseValue, err := m.releaseService.GetRelease(ctx, baseRelease)
	if err != nil {
		return nil, fmt.Errorf("get base release  failed:%w", err)
	}
	if baseReleaseValue.Service != serviceId {
		return nil, errors.New("project not match")
	}
	base, err := m.getReleaseInfo(ctx, baseRelease)
	if err != nil {
		return nil, fmt.Errorf("get base release info failed:%w", err)
	}

	return base, nil
}

func (m *imlServiceDiff) latestStrategyCommits(ctx context.Context, serviceId string) ([]*commit.Commit[strategy.Commit], error) {
	list, err := m.strategyService.All(ctx, 2, serviceId)
	if err != nil {
		return nil, fmt.Errorf("get latest strategy failed:%w", err)
	}

	return utils.SliceToSlice(list, func(s *strategy.Strategy) *commit.Commit[strategy.Commit] {
		key := fmt.Sprintf("service-%s", s.Id)
		return &commit.Commit[strategy.Commit]{
			Target: s.Id,
			Key:    key,
			Data: &strategy.Commit{
				Id:       s.Id,
				Name:     s.Name,
				Priority: s.Priority,
				Filters:  s.Filters,
				Config:   s.Config,
				Driver:   s.Driver,
				IsStop:   s.IsStop,
				Version:  s.UpdateAt.Format("20060102150405"),
			},
		}
	}, func(s *strategy.Strategy) bool {
		return !s.IsDelete
	}), nil
}

func (m *imlServiceDiff) DiffForLatest(ctx context.Context, serviceId string, baseRelease string) (*service_diff.Diff, bool, error) {
	serviceInfo, err := m.serviceService.Get(ctx, serviceId)
	if err != nil {
		return nil, false, fmt.Errorf("get service info failed:%w", err)
	}
	apis, err := m.apiService.ListForService(ctx, serviceId)
	if err != nil {
		return nil, false, err
	}
	if len(apis) < 1 {
		return nil, false, fmt.Errorf("api not found")
	}

	apiIds := utils.SliceToSlice(apis, func(i *api.API) string {
		return i.UUID
	})
	apiInfos, err := m.apiService.ListInfo(ctx, apiIds...)
	if err != nil {
		return nil, false, err
	}
	request := make([]*commit.Commit[api.Request], 0, len(apiInfos))
	for _, apiInfo := range apiInfos {
		request = append(request, &commit.Commit[api.Request]{
			Target: apiInfo.UUID,
			Key:    "request",
			Data: &api.Request{
				Name:      apiInfo.Name,
				Path:      apiInfo.Path,
				Methods:   apiInfo.Methods,
				Protocols: apiInfo.Protocols,
				Match:     apiInfo.Match,
				Disable:   apiInfo.Disable,
				Upstream:  apiInfo.Upstream,
			},
		})

	}
	proxy, err := m.apiService.ListLatestCommitProxy(ctx, apiIds...)
	if err != nil {
		return nil, false, fmt.Errorf("diff for api commit %v", err)
	}
	apiDocCommits, err := m.apiDocService.ListLatestDocCommit(ctx, serviceId)
	if err != nil {
		return nil, false, err
	}

	upstreamCommits, err := m.upstreamService.ListLatestCommit(ctx, cluster.DefaultClusterID, serviceId)
	if err != nil {
		return nil, false, err
	}
	if len(upstreamCommits) == 0 && serviceInfo.Kind == service.RestService {
		return nil, false, fmt.Errorf("upstream not found")
	}

	strategyCommits, err := m.latestStrategyCommits(ctx, serviceId)
	if err != nil {
		return nil, false, err
	}

	base, err := m.getBaseInfo(ctx, serviceId, baseRelease)
	if err != nil {
		return nil, false, err
	}
	target := &projectInfo{
		id:                serviceId,
		apiRequestCommits: request,
		apiProxyCommits:   proxy,
		apiDocCommits:     apiDocCommits,
		upstreamCommits:   upstreamCommits,
		strategyCommits:   strategyCommits,
	}
	clusters, err := m.clusterService.List(ctx)
	if err != nil {
		return nil, false, err
	}
	clusterIds := utils.SliceToSlice(clusters, func(i *cluster.Cluster) string {
		return i.Uuid
	})
	return m.diff(clusterIds, base, target), true, nil
}
func (m *imlServiceDiff) getReleaseInfo(ctx context.Context, releaseId string) (*projectInfo, error) {
	commits, err := m.releaseService.GetCommits(ctx, releaseId)
	if err != nil {
		return nil, err
	}
	apiRequestCommitIds := make([]string, 0)
	apiProxyCommitIds := make([]string, 0)
	apiDocumentCommitIds := make([]string, 0)
	upstreamCommitIds := make([]string, 0)
	strategyCommitIds := make([]string, 0)
	for _, c := range commits {
		switch c.Type {
		case release.CommitApiRequest:
			apiRequestCommitIds = append(apiRequestCommitIds, c.Commit)
		case release.CommitApiProxy:
			apiProxyCommitIds = append(apiProxyCommitIds, c.Commit)
		case release.CommitApiDocument:
			apiDocumentCommitIds = append(apiDocumentCommitIds, c.Commit)
		case release.CommitUpstream:
			upstreamCommitIds = append(upstreamCommitIds, c.Commit)
		case release.CommitStrategy:
			strategyCommitIds = append(strategyCommitIds, c.Commit)
		}
	}

	var requestCommits []*commit.Commit[api.Request]
	var proxyCommits []*commit.Commit[api.Proxy]
	var documentCommits []*commit.Commit[api_doc.DocCommit]
	if len(apiRequestCommitIds) > 0 {
		requestCommits, err = m.apiService.ListRequestCommit(ctx, apiRequestCommitIds...)
		if err != nil {
			return nil, err
		}
	}
	if len(apiProxyCommitIds) > 0 {
		proxyCommits, err = m.apiService.ListProxyCommit(ctx, apiProxyCommitIds...)
		if err != nil {
			return nil, err
		}
	}
	if len(apiDocumentCommitIds) > 0 {
		documentCommits, err = m.apiDocService.ListDocCommit(ctx, apiDocumentCommitIds...)
		if err != nil {
			return nil, err
		}
	}
	var upstreamCommits []*commit.Commit[upstream.Config]
	if len(upstreamCommitIds) > 0 {
		upstreamCommits, err = m.upstreamService.ListCommit(ctx, upstreamCommitIds...)
		if err != nil {
			return nil, err
		}
	}
	var strategyCommits []*commit.Commit[strategy.Commit]
	if len(strategyCommitIds) > 0 {
		strategyCommits, err = m.strategyService.ListStrategyCommit(ctx, strategyCommitIds...)
		if err != nil {
			return nil, err
		}
	}

	return &projectInfo{
		apiRequestCommits: requestCommits,
		apiProxyCommits:   proxyCommits,
		apiDocCommits:     documentCommits,
		upstreamCommits:   upstreamCommits,
		strategyCommits:   strategyCommits,
	}, nil
}

func (m *imlServiceDiff) diffStrategies(base, target []*commit.Commit[strategy.Commit]) []*service_diff.StrategyDiff {
	baseStrategy := utils.SliceToMap(base, func(i *commit.Commit[strategy.Commit]) string {
		return i.Target
	})
	targetStrategy := utils.SliceToMap(target, func(i *commit.Commit[strategy.Commit]) string {
		return i.Target
	})
	out := make([]*service_diff.StrategyDiff, 0, len(target))
	for _, tc := range targetStrategy {

		//t := tc.Data
		key := tc.Target
		o := &service_diff.StrategyDiff{
			Strategy: key,
			Name:     tc.Data.Name,
			Priority: tc.Data.Priority,
			Change:   service_diff.ChangeTypeNone,
			Status:   0,
		}
		b, hasB := baseStrategy[key]
		if !hasB {
			o.Change = service_diff.ChangeTypeNew
		} else if tc.Data.Version != b.Data.Version {
			o.Change = service_diff.ChangeTypeUpdate
		}
		delete(baseStrategy, key)
		out = append(out, o)
	}
	for _, b := range baseStrategy {
		o := &service_diff.StrategyDiff{
			Strategy: b.Target,
			Name:     b.Data.Name,
			Priority: b.Data.Priority,
			Change:   service_diff.ChangeTypeDelete,
			Status:   0,
		}
		out = append(out, o)
	}
	return out
}
func (m *imlServiceDiff) diff(partitions []string, base, target *projectInfo) *service_diff.Diff {
	out := &service_diff.Diff{
		Apis:      nil,
		Upstreams: nil,
	}
	baseApis := utils.NewSet(utils.SliceToSlice(base.apiRequestCommits, func(i *commit.Commit[api.Request]) string {
		return i.Target
	})...)
	baseApiProxy := utils.SliceToMap(base.apiProxyCommits, func(i *commit.Commit[api.Proxy]) string {
		return i.Target
	})
	baseAPIDoc := utils.SliceToMap(base.apiDocCommits, func(i *commit.Commit[api_doc.DocCommit]) string {
		return i.Target
	})

	targetApiProxy := utils.SliceToMap(target.apiProxyCommits, func(i *commit.Commit[api.Proxy]) string {
		return i.Target
	})
	targetAPIDoc := utils.SliceToMap(target.apiDocCommits, func(i *commit.Commit[api_doc.DocCommit]) string {
		return i.Target
	})

	for _, rc := range target.apiRequestCommits {
		apiId := rc.Target
		a := &service_diff.ApiDiff{
			Name:     rc.Data.Name,
			APi:      rc.Target,
			Method:   rc.Data.Methods,
			Protocol: rc.Data.Protocols,
			Disable:  false,
			Path:     rc.Data.Path,
			Change:   0,
			Status:   service_diff.Status{},
		}

		pc, hasPc := targetApiProxy[apiId]
		dc, hasDC := targetAPIDoc[apiId]
		if !hasPc {
			// 未设置proxy信息
			a.Status.Proxy = service_diff.StatusUnset
		}
		if !hasDC {
			// 未设置文档
			a.Status.Doc = service_diff.StatusUnset
		}

		if !baseApis.Has(apiId) {
			a.Change = service_diff.ChangeTypeNew
		} else {
			a.Change = service_diff.ChangeTypeNone

			baseProxy, hasBaseProxy := baseApiProxy[apiId]
			baseDoc, hasBaseDoc := baseAPIDoc[apiId]
			if hasBaseDoc != hasDC || hasBaseProxy != hasPc {
				// 文档或者proxy变更
				a.Change = service_diff.ChangeTypeUpdate
			} else if (hasPc && pc.UUID != baseProxy.UUID) || (hasDC && dc.UUID != baseDoc.UUID) {
				// 文档 或者 proxy 变更
				a.Change = service_diff.ChangeTypeUpdate
			}
		}
		out.Apis = append(out.Apis, a)

	}
	baseApis.Remove(utils.SliceToSlice(out.Apis, func(i *service_diff.ApiDiff) string {
		return i.APi
	})...)
	for _, rc := range base.apiRequestCommits {
		apiInfo := rc.Data
		if baseApis.Has(rc.Target) {
			out.Apis = append(out.Apis, &service_diff.ApiDiff{
				Name:     apiInfo.Name,
				APi:      rc.Target,
				Method:   apiInfo.Methods,
				Protocol: apiInfo.Protocols,
				Disable:  apiInfo.Disable,
				Path:     apiInfo.Path,
				Change:   service_diff.ChangeTypeDelete,
				Status:   service_diff.Status{},
			})
		}

	}
	// upstream diff
	targetUpstreamMap := utils.SliceToMap(target.upstreamCommits, func(i *commit.Commit[upstream.Config]) string {
		return fmt.Sprintf("%s-%s", i.Target, i.Key)
	})
	baseUpstreamMap := utils.SliceToMap(base.upstreamCommits, func(i *commit.Commit[upstream.Config]) string {
		return fmt.Sprintf("%s-%s", i.Target, i.Key)
	})

	for _, partitionId := range partitions {
		key := fmt.Sprintf("%s-%s", target.id, partitionId)
		o := &service_diff.UpstreamDiff{
			Upstream: target.id,
			Data:     nil,
			Change:   service_diff.ChangeTypeNone,
			Status:   0,
		}
		out.Upstreams = append(out.Upstreams, o)
		bu, hasBu := baseUpstreamMap[key]
		tu, hasTu := targetUpstreamMap[key]
		if hasTu {
			o.Data = tu.Data
			if !hasBu {
				o.Change = service_diff.ChangeTypeNew
			} else if tu.UUID != bu.UUID {
				o.Change = service_diff.ChangeTypeUpdate
			}

		} else {
			o.Status = service_diff.StatusLoss
			if hasBu {
				o.Change = service_diff.ChangeTypeDelete
			}
		}
	}
	out.Strategies = m.diffStrategies(base.strategyCommits, target.strategyCommits)

	return out
}

func (m *imlServiceDiff) Out(ctx context.Context, diff *service_diff.Diff) (*DiffOut, error) {

	clusters, err := m.clusterService.List(ctx, diff.Clusters...)
	if err != nil {
		return nil, err
	}
	if len(clusters) == 0 {
		return nil, fmt.Errorf("unset gateway for clusters %v", diff.Clusters)
	}

	out := &DiffOut{}
	out.Routers = utils.SliceToSlice(diff.Apis, func(i *service_diff.ApiDiff) *RouterDiffOut {
		return &RouterDiffOut{
			Name:      i.Name,
			Methods:   i.Method,
			Path:      i.Path,
			Change:    i.Change,
			Status:    i.Status,
			Protocols: i.Protocol,
			Disable:   i.Disable,
		}
	})

	for _, u := range diff.Upstreams {
		if u.Data == nil {
			continue
		}
		typeValue := u.Data.Type

		if typeValue == "" {
			typeValue = "static"
		}
		out.Upstreams = append(out.Upstreams, &UpstreamDiffOut{
			Change: u.Change,
			Type:   typeValue,
			Status: u.Status,
			Addr: utils.SliceToSlice(u.Data.Nodes, func(i *upstream.NodeConfig) string {
				return i.Address
			}),
		})
	}
	out.Strategies = utils.SliceToSlice(diff.Strategies, func(i *service_diff.StrategyDiff) *StrategyDiffOut {
		return &StrategyDiffOut{
			Name:     i.Name,
			Priority: i.Priority,
			Change:   i.Change,
			Status:   i.Status,
		}
	})
	return out, nil
}
