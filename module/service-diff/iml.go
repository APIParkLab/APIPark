package service_diff

import (
	"context"
	"errors"
	"fmt"
	
	"github.com/APIParkLab/APIPark/service/api"
	"github.com/APIParkLab/APIPark/service/cluster"
	"github.com/APIParkLab/APIPark/service/release"
	"github.com/APIParkLab/APIPark/service/service_diff"
	"github.com/APIParkLab/APIPark/service/universally/commit"
	"github.com/APIParkLab/APIPark/service/upstream"
	"github.com/eolinker/go-common/auto"
	"github.com/eolinker/go-common/utils"
)

type imlServiceDiff struct {
	apiService      api.IAPIService           `autowired:""`
	upstreamService upstream.IUpstreamService `autowired:""`
	releaseService  release.IReleaseService   `autowired:""`
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
func (m *imlServiceDiff) DiffForLatest(ctx context.Context, serviceId string, baseRelease string) (*service_diff.Diff, bool, error) {
	
	apis, err := m.apiService.ListForService(ctx, serviceId)
	if err != nil {
		return nil, false, err
	}
	
	apiIds := utils.SliceToSlice(apis, func(i *api.API) string {
		return i.UUID
	})
	apiInfos, err := m.apiService.ListInfo(ctx, apiIds...)
	if err != nil {
		return nil, false, err
	}
	proxy, err := m.apiService.ListLatestCommitProxy(ctx, apiIds...)
	if err != nil {
		return nil, false, fmt.Errorf("diff for api commit %v", err)
	}
	documents, err := m.apiService.ListLatestCommitDocument(ctx, apiIds...)
	if err != nil {
		return nil, false, err
	}
	
	upstreamCommits, err := m.upstreamService.ListLatestCommit(ctx, serviceId)
	if err != nil {
		return nil, false, err
	}
	
	base, err := m.getBaseInfo(ctx, serviceId, baseRelease)
	if err != nil {
		return nil, false, err
	}
	target := &projectInfo{
		id:              serviceId,
		apis:            apiInfos,
		apiCommits:      proxy,
		apiDocs:         documents,
		upstreamCommits: upstreamCommits,
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
	
	apiIds := utils.SliceToSlice(commits, func(i *release.ProjectCommits) string {
		return i.Target
	}, func(c *release.ProjectCommits) bool {
		return c.Type == release.CommitApiProxy || c.Type == release.CommitApiDocument
	})
	apiInfos, err := m.apiService.ListInfo(ctx, apiIds...)
	if err != nil {
		return nil, err
	}
	apiProxyCommitIds := utils.SliceToSlice(commits, func(i *release.ProjectCommits) string {
		return i.Commit
	}, func(c *release.ProjectCommits) bool {
		return c.Type == release.CommitApiProxy
	})
	apiDocumentCommitIds := utils.SliceToSlice(commits, func(i *release.ProjectCommits) string {
		return i.Commit
	}, func(c *release.ProjectCommits) bool {
		return c.Type == release.CommitApiDocument
	})
	upstreamCommitIds := utils.SliceToSlice(commits, func(i *release.ProjectCommits) string {
		return i.Commit
	}, func(c *release.ProjectCommits) bool {
		return c.Type == release.CommitUpstream
	})
	proxyCommits, err := m.apiService.ListProxyCommit(ctx, apiProxyCommitIds...)
	if err != nil {
		return nil, err
	}
	documentCommits, err := m.apiService.ListDocumentCommit(ctx, apiDocumentCommitIds...)
	if err != nil {
		return nil, err
	}
	upstreamCommits, err := m.upstreamService.ListCommit(ctx, upstreamCommitIds...)
	if err != nil {
		return nil, err
	}
	return &projectInfo{
		apis:            apiInfos,
		apiCommits:      proxyCommits,
		apiDocs:         documentCommits,
		upstreamCommits: upstreamCommits,
	}, nil
}
func (m *imlServiceDiff) diff(partitions []string, base, target *projectInfo) *service_diff.Diff {
	out := &service_diff.Diff{
		Apis:      nil,
		Upstreams: nil,
		//Clusters: partitions,
	}
	baseApis := utils.NewSet(utils.SliceToSlice(base.apis, func(i *api.Info) string {
		return i.UUID
	})...)
	baseApiProxy := utils.SliceToMap(base.apiCommits, func(i *commit.Commit[api.Proxy]) string {
		return i.Target
	})
	baseAPIDoc := utils.SliceToMap(base.apiDocs, func(i *commit.Commit[api.Document]) string {
		return i.Target
	})
	
	targetApiProxy := utils.SliceToMap(target.apiCommits, func(i *commit.Commit[api.Proxy]) string {
		return i.Target
	})
	targetAPIDoc := utils.SliceToMap(target.apiDocs, func(i *commit.Commit[api.Document]) string {
		return i.Target
	})
	
	for _, apiInfo := range target.apis {
		apiId := apiInfo.UUID
		a := &service_diff.ApiDiff{
			APi:    apiInfo.UUID,
			Name:   apiInfo.Name,
			Method: apiInfo.Method,
			Path:   apiInfo.Path,
			Status: service_diff.Status{},
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
	for _, apiInfo := range base.apis {
		if baseApis.Has(apiInfo.UUID) {
			out.Apis = append(out.Apis, &service_diff.ApiDiff{
				APi:    apiInfo.UUID,
				Name:   apiInfo.Name,
				Method: apiInfo.Method,
				Path:   apiInfo.Path,
				Status: service_diff.Status{},
				Change: service_diff.ChangeTypeDelete,
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
			//Partition: partitionId,
			Data:   nil,
			Change: service_diff.ChangeTypeNone,
			Status: 0,
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
	out.Apis = utils.SliceToSlice(diff.Apis, func(i *service_diff.ApiDiff) *ApiDiffOut {
		return &ApiDiffOut{
			Api:    auto.UUID(i.APi),
			Name:   i.Name,
			Method: i.Method,
			Path:   i.Path,
			Change: i.Change,
			Status: i.Status,
		}
	})
	
	for _, u := range diff.Upstreams {
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
	return out, nil
}
