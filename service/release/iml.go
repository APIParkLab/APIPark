package release

import (
	"context"
	"errors"
	"time"

	"github.com/APIParkLab/APIPark/service/api"
	"github.com/APIParkLab/APIPark/service/universally/commit"
	"github.com/APIParkLab/APIPark/service/upstream"
	"github.com/APIParkLab/APIPark/stores/release"
	"github.com/eolinker/go-common/auto"
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/utils"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	_ IReleaseService      = (*imlReleaseService)(nil)
	_ auto.CompleteService = (*imlReleaseService)(nil)
	_ autowire.Complete    = (*imlReleaseService)(nil)
)

type imlReleaseService struct {
	releaseStore   release.IReleaseStore       `autowired:""`
	commitStore    release.IReleaseCommitStore `autowired:""`
	releaseRuntime release.IReleaseRuntime     `autowired:""`
}

func (s *imlReleaseService) GetRunningApiDocCommits(ctx context.Context, serviceIds ...string) ([]string, error) {
	w := make(map[string]interface{})
	if len(serviceIds) > 0 {
		w["service"] = serviceIds
	}
	runnings, err := s.releaseRuntime.List(ctx, w)
	if err != nil {
		return nil, err
	}
	apiDocCommits := make([]string, 0, len(runnings))
	for _, running := range runnings {
		commits, err := s.getCommitByType(ctx, running.Release, CommitApiDocument, running.Service)
		if err != nil {
			return nil, err
		}
		if len(commits) == 0 {
			continue
		}
		apiDocCommits = append(apiDocCommits, commits[0].Commit)
	}
	return apiDocCommits, nil
}

func (s *imlReleaseService) Completeness(partitions []string, apis []string, apiRequestCommits []*commit.Commit[api.Request], proxyCommits []*commit.Commit[api.Proxy], upstreamCommits []*commit.Commit[upstream.Config]) bool {

	requests := utils.SliceToMap(apiRequestCommits, func(o *commit.Commit[api.Request]) string {
		return o.Target
	})
	proxys := utils.SliceToMap(proxyCommits, func(o *commit.Commit[api.Proxy]) string {
		return o.Target
	})

	for _, aid := range apis {
		_, has := requests[aid]
		if !has {
			return false
		}
		_, has = proxys[aid]
		if !has {
			return false
		}

	}
	upstreamMap := make(map[string]map[string]struct{})
	for _, upstreamCommit := range upstreamCommits {
		if _, has := upstreamMap[upstreamCommit.Target]; !has {
			upstreamMap[upstreamCommit.Target] = make(map[string]struct{})
		}
		upstreamMap[upstreamCommit.Target][upstreamCommit.Key] = struct{}{}
	}

	for _, partition := range partitions {
		for _, u := range upstreamMap {
			if _, has := u[partition]; !has {
				return false
			}
		}
	}

	return true
}

func (s *imlReleaseService) GetCommits(ctx context.Context, id string) ([]*ProjectCommits, error) {
	list, err := s.commitStore.List(ctx, map[string]interface{}{
		"release": id,
	})
	if err != nil {
		return nil, err
	}

	return utils.SliceToSlice(list, func(o *release.Commit) *ProjectCommits {
		return &ProjectCommits{
			Release: o.Release,
			Target:  o.Target,
			Key:     o.Key,
			Type:    o.Type,
			Commit:  o.Commit,
		}
	}), nil
}

func (s *imlReleaseService) OnComplete() {
	auto.RegisterService("release", s)
}

func (s *imlReleaseService) GetLabels(ctx context.Context, ids ...string) map[string]string {
	if len(ids) == 0 {
		return nil
	}
	if len(ids) == 1 {
		o, err := s.releaseStore.GetByUUID(ctx, ids[0])
		if err != nil || o == nil {
			return nil
		}
		return map[string]string{
			o.UUID: o.Name,
		}
	}
	list, err := s.releaseStore.ListQuery(ctx, "`uuid` in ?", []interface{}{ids}, "id")
	if err != nil {
		return nil
	}
	return utils.SliceToMapO(list, func(o *release.Release) (string, string) { return o.UUID, o.Name })
}

func (s *imlReleaseService) GetApiProxyCommit(ctx context.Context, id string, apiUUID string) (string, error) {
	commits, err := s.getCommitByType(ctx, id, CommitApiProxy, apiUUID)
	if err != nil {
		return "", err
	}
	if len(commits) == 0 {
		return "", errors.New("not found")
	}

	return commits[0].Commit, nil
}

func (s *imlReleaseService) getCommitByType(ctx context.Context, releaseId, t CommitType, target string) ([]*release.Commit, error) {
	where := "`release` = ? and `type` = ? and `target` = ?"
	args := []interface{}{releaseId, t, target}
	return s.commitStore.ListQuery(ctx, where, args, "")

}

//func (s *imlReleaseService) GetApiDocCommit(ctx context.Context, id string, apiUUID string) (string, error) {
//	commits, err := s.getCommitByType(ctx, id, CommitApiDocument, apiUUID, CommitApiDocument)
//	if err != nil {
//		return "", err
//	}
//	if len(commits) == 0 {
//		return "", errors.New("not found")
//	}
//
//	return commits[0].Commit, nil
//}

//func (s *imlReleaseService) GetRunningApiDocCommit(ctx context.Context, service string, apiUUID string) (string, error) {
//	running, err := s.releaseRuntime.First(ctx, map[string]interface{}{
//		"service": service,
//	})
//	if err != nil {
//		return "", err
//	}
//	return s.GetApiDocCommit(ctx, running.Release, apiUUID)
//
//}

func (s *imlReleaseService) GetRunningApiProxyCommit(ctx context.Context, service string, apiUUID string) (string, error) {
	running, err := s.releaseRuntime.First(ctx, map[string]interface{}{
		"service": service,
	})
	if err != nil {
		return "", err
	}
	return s.GetApiProxyCommit(ctx, running.Release, apiUUID)
}

//
//func (s *imlReleaseService) DiffApis(ctx context.Context, baseApis []*Api, targetApis []*Api) []*APiDiff {
//	result := make([]*APiDiff, 0, len(targetApis)+len(baseApis))
//	baseApiMap := utils.SliceToMap(baseApis, func(v *Api) string {
//		return v.Api
//	})
//	for _, targetApi := range targetApis {
//		if baseApi, ok := baseApiMap[targetApi.Api]; ok {
//			if baseApi.ProxyCommit != targetApi.ProxyCommit || baseApi.DocCommit != targetApi.DocCommit {
//				result = append(result, &APiDiff{
//					Api:    targetApi.Api,
//					Change: project_diff.ChangeTypeUpdate,
//				})
//			} else {
//				result = append(result, &APiDiff{
//					Api:    targetApi.Api,
//					Change: project_diff.ChangeTypeNone,
//				})
//			}
//			delete(baseApiMap, targetApi.Api)
//		} else {
//			result = append(result, &APiDiff{
//				Api:    targetApi.Api,
//				Change: project_diff.ChangeTypeNew,
//			})
//		}
//	}
//	for _, baseApi := range baseApiMap {
//		result = append(result, &APiDiff{
//			Api:    baseApi.Api,
//			Change: project_diff.ChangeTypeDelete,
//		})
//	}
//	return result
//}
//
//func (s *imlReleaseService) DiffUpstreams(ctx context.Context, baseUpstreams []*UpstreamCommit, targetUpstreams []*UpstreamCommit) []*UpstreamDiff {
//	Upstreams := make([]*UpstreamDiff, 0, len(targetUpstreams)+len(baseUpstreams))
//	baseUpstreamMap := utils.SliceToMap(baseUpstreams, func(v *UpstreamCommit) string {
//		return fmt.Sprintf("%s-%s", v.UpstreamCommit, v.Cluster)
//	})
//	for _, targetUpstream := range targetUpstreams {
//		key := fmt.Sprintf("%s-%s", targetUpstream.UpstreamCommit, targetUpstream.Cluster)
//		if baseUpstream, ok := baseUpstreamMap[key]; ok {
//			if baseUpstream.Commit != targetUpstream.Commit {
//				Upstreams = append(Upstreams, &UpstreamDiff{
//					UpstreamCommit:  targetUpstream.UpstreamCommit,
//					Cluster: targetUpstream.Cluster,
//					Commit:    targetUpstream.Commit,
//					Change:    project_diff.ChangeTypeUpdate,
//				})
//			} else {
//				Upstreams = append(Upstreams, &UpstreamDiff{
//					UpstreamCommit:  targetUpstream.UpstreamCommit,
//					Cluster: targetUpstream.Cluster,
//					Commit:    targetUpstream.Commit,
//					Change:    project_diff.ChangeTypeNone,
//				})
//			}
//			delete(baseUpstreamMap, targetUpstream.UpstreamCommit)
//		} else {
//			Upstreams = append(Upstreams, &UpstreamDiff{
//				UpstreamCommit:  targetUpstream.UpstreamCommit,
//				Cluster: targetUpstream.Cluster,
//				Commit:    targetUpstream.Commit,
//				Change:    project_diff.ChangeTypeNew,
//			})
//		}
//	}
//	for _, baseUpstream := range baseUpstreamMap {
//		Upstreams = append(Upstreams, &UpstreamDiff{
//			UpstreamCommit:  baseUpstream.UpstreamCommit,
//			Cluster: baseUpstream.Cluster,
//			Commit:    baseUpstream.Commit,
//			Change:    project_diff.ChangeTypeDelete,
//		})
//	}
//	return Upstreams
//}

func (s *imlReleaseService) SetRunning(ctx context.Context, service string, id string) error {
	_, err := s.releaseRuntime.DeleteWhere(ctx, map[string]interface{}{"service": service})
	if err != nil {
		return err
	}
	operator := utils.UserId(ctx)
	return s.releaseRuntime.Save(ctx, &release.Runtime{
		Id:         0,
		Service:    service,
		Release:    id,
		UpdateTime: time.Now(),
		Operator:   operator,
	})

}

func (s *imlReleaseService) CreateRelease(ctx context.Context, service, version, remark string, apiRequestCommit, apisProxyCommits map[string]string, apiDocCommits, serviceDocCommits string, upstreams map[string]map[string]string, strategies map[string]string) (*Release, error) {
	operator := utils.UserId(ctx)
	releaseId := uuid.NewString()
	commits := make([]*release.Commit, 0, len(apisProxyCommits)+len(upstreams)+2)
	for apiId, commitUUID := range apiRequestCommit {
		commits = append(commits, &release.Commit{
			Type:    CommitApiRequest,
			Target:  apiId,
			Release: releaseId,
			Key:     CommitApiRequest,
			Commit:  commitUUID,
		})
	}
	for aid, commitUUID := range apisProxyCommits {
		commits = append(commits, &release.Commit{
			Type:    CommitApiProxy,
			Target:  aid,
			Release: releaseId,
			Key:     CommitApiProxy,
			Commit:  commitUUID,
		})
	}

	for upId, upstreamsByPartition := range upstreams {
		for partition, commitUUID := range upstreamsByPartition {
			commits = append(commits, &release.Commit{
				Type:    CommitUpstream,
				Target:  upId,
				Release: releaseId,
				Key:     partition,
				Commit:  commitUUID,
			})
		}
	}
	if apiDocCommits != "" {
		commits = append(commits, &release.Commit{
			Type:    CommitApiDocument,
			Target:  service,
			Release: releaseId,
			Key:     CommitApiDocument,
			Commit:  apiDocCommits,
		})
	}

	if serviceDocCommits != "" {
		commits = append(commits, &release.Commit{
			Type:    CommitServiceDoc,
			Target:  service,
			Release: releaseId,
			Key:     CommitServiceDoc,
			Commit:  serviceDocCommits,
		})
	}
	for key, value := range strategies {
		commits = append(commits, &release.Commit{
			Type:    CommitStrategy,
			Target:  key,
			Release: releaseId,
			Key:     CommitStrategy,
			Commit:  value,
		})
	}

	ev := &release.Release{
		Id:       0,
		UUID:     releaseId,
		Name:     version,
		Service:  service,
		Remark:   remark,
		Creator:  operator,
		CreateAt: time.Now(),
	}
	err := s.releaseStore.Transaction(ctx, func(ctx context.Context) error {
		ok, e := s.CheckNewVersion(ctx, service, version)
		if e != nil {
			return e
		}
		if !ok {
			return errors.New("version already exists")
		}

		err := s.releaseStore.Insert(ctx, ev)
		if err != nil {
			return err
		}
		return s.commitStore.Insert(ctx, commits...)
	})
	if err != nil {
		return nil, err
	}
	return FromEntity(ev), nil
}

func (s *imlReleaseService) CheckNewVersion(ctx context.Context, service string, version string) (bool, error) {
	v, err := s.releaseStore.First(ctx, map[string]interface{}{
		"service": service,
		"name":    version,
	})
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return false, err
	}
	if errors.Is(err, gorm.ErrRecordNotFound) || v == nil {
		return true, nil
	}
	return false, nil
}

func (s *imlReleaseService) GetRelease(ctx context.Context, id string) (*Release, error) {
	r, err := s.releaseStore.GetByUUID(ctx, id)
	if err != nil {
		return nil, err
	}
	return FromEntity(r), nil
}

//
//func (s *imlReleaseService) Diff(ctx context.Context, baseReleaseId string, targetReleaseId string) (*Diff, error) {
//	if baseReleaseId != "" || targetReleaseId != "" {
//		return nil, errors.New("not support")
//	}
//	baseApis, baseUpstreams, err := s.GetReleaseInfos(ctx, baseReleaseId)
//	if err != nil {
//		return nil, err
//	}
//	targetApis, targetUpstreams, err := s.GetReleaseInfos(ctx, targetReleaseId)
//	if err != nil {
//		return nil, err
//	}
//
//	df := new(Diff)
//	df.Routers = s.DiffApis(ctx, baseApis, targetApis)
//	df.Upstreams = s.DiffUpstreams(ctx, baseUpstreams, targetUpstreams)
//	return df, nil
//}

func (s *imlReleaseService) DeleteRelease(ctx context.Context, id string) error {
	//todo 判断版本是否有使用中的未完结流程

	return s.releaseStore.Transaction(ctx, func(ctx context.Context) error {
		first, err := s.releaseRuntime.First(ctx, map[string]interface{}{
			"release": id,
		})
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		if err == nil && first != nil {
			return errors.New("release is in use")
		}
		err = s.releaseStore.DeleteUUID(ctx, id)
		if err != nil {
			return err
		}
		_, err = s.commitStore.DeleteWhere(ctx, map[string]interface{}{
			"release": id,
		})
		if err != nil {
			return err
		}
		return nil
	})

}

func (s *imlReleaseService) List(ctx context.Context, service string) ([]*Release, error) {
	list, err := s.releaseStore.List(ctx, map[string]interface{}{"service": service}, "create_at desc")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}

func (s *imlReleaseService) GetReleaseInfos(ctx context.Context, id string) ([]*APICommit, []*APICommit, *APICommit, []*UpstreamCommit, *ServiceCommit, error) {
	commits, err := s.commitStore.List(ctx, map[string]interface{}{
		"release": id,
	})
	if err != nil {
		return nil, nil, nil, nil, nil, err
	}
	apiRequestCommits := make([]*APICommit, 0, len(commits))
	apiProxyCommits := make([]*APICommit, 0, len(commits))
	var apiDocCommit *APICommit
	upstreamCommits := make([]*UpstreamCommit, 0, len(commits))
	var serviceDocCommit *ServiceCommit
	for _, v := range commits {
		switch v.Type {
		case CommitApiRequest:
			apiRequestCommits = append(apiRequestCommits, &APICommit{
				Release: v.Release,
				API:     v.Target,
				Commit:  v.Commit,
			})
		case CommitApiProxy:
			apiProxyCommits = append(apiProxyCommits, &APICommit{
				Release: v.Release,
				API:     v.Target,
				Commit:  v.Commit,
			})

		case CommitApiDocument:
			apiDocCommit = &APICommit{
				Release: v.Release,
				API:     v.Target,
				Commit:  v.Commit,
			}

		case CommitUpstream:
			upstreamCommits = append(upstreamCommits, &UpstreamCommit{
				Release:   v.Release,
				Upstream:  v.Target,
				Partition: v.Key,
				Commit:    v.Commit,
			})
		case CommitServiceDoc:
			serviceDocCommit = &ServiceCommit{
				Release: v.Release,
				Service: v.Target,
				Commit:  v.Commit,
			}
		}

	}

	return apiRequestCommits, apiProxyCommits, apiDocCommit, upstreamCommits, serviceDocCommit, nil
}

func (s *imlReleaseService) GetRunning(ctx context.Context, service string) (*Release, error) {
	running, err := s.releaseRuntime.First(ctx, map[string]interface{}{
		"service": service,
	})
	if err != nil {
		return nil, err
	}
	return s.GetRelease(ctx, running.Release)
}
