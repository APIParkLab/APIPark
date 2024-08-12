package publish

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"
	
	"github.com/APIParkLab/APIPark/service/service_diff"
	"github.com/APIParkLab/APIPark/stores/publish"
	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"
)

var (
	_ IPublishService = (*imlPublishService)(nil)
)

type imlPublishService struct {
	store       publish.IPublishStore       `autowired:""`
	latestStore publish.IPublishLatestStore `autowired:""`
	diffStore   publish.IDiffStore          `autowired:""`
	statusStore publish.IPublishStatusStore `autowired:""`
}

func (s *imlPublishService) SetPublishStatus(ctx context.Context, status *Status) error {
	return s.statusStore.Save(ctx, &publish.Status{
		Publish:  status.Publish,
		Cluster:  status.Cluster,
		Status:   int(status.Status),
		Error:    status.Error,
		UpdateAt: time.Now(),
	})
}

func (s *imlPublishService) GetPublishStatus(ctx context.Context, id string) ([]*Status, error) {
	list, err := s.statusStore.List(ctx, map[string]interface{}{"publish": id})
	if err != nil {
		return nil, err
	}
	
	return utils.SliceToSlice(list, func(s *publish.Status) *Status {
		return &Status{
			Publish:  s.Publish,
			Cluster:  s.Cluster,
			Status:   StatusType(s.Status),
			Error:    s.Error,
			UpdateAt: s.UpdateAt,
		}
	}), nil
}

func (s *imlPublishService) setAction(ctx context.Context, service, id string, status StatusType, comments string) error {
	operator := utils.UserId(ctx)
	return s.store.Transaction(ctx, func(ctx context.Context) error {
		ev, err := s.store.GetByUUID(ctx, id)
		if err != nil {
			return err
		}
		if ev.Service != service {
			return errors.New("service not match")
		}
		ev.Status = int(status)
		ev.Comments = comments
		ev.Approver = operator
		ev.ApproveTime = time.Now()
		_, err = s.store.Update(ctx, ev)
		return err
	})
}
func (s *imlPublishService) Refuse(ctx context.Context, service, id string, comments string) error {
	return s.setAction(ctx, service, id, StatusRefuse, comments)
}

func (s *imlPublishService) Accept(ctx context.Context, service, id string, comments string) error {
	return s.setAction(ctx, service, id, StatusAccept, comments)
	
}

func (s *imlPublishService) SetLatest(ctx context.Context, release string, id string) error {
	if id == "" {
		return s.RemoveLatest(ctx, release)
	}
	e := &publish.Latest{
		Id:      0,
		Release: release,
		Latest:  id,
	}
	err := s.latestStore.Save(ctx, e)
	if err != nil {
		return err
	}
	return nil
}

func (s *imlPublishService) RemoveLatest(ctx context.Context, release string) error {
	//_, err := s.latestStore.DeleteQuery(ctx, "release = ?", release)
	_, err := s.latestStore.DeleteWhere(ctx, map[string]interface{}{"release": release})
	return err
}

func (s *imlPublishService) Latest(ctx context.Context, release ...string) ([]*Publish, error) {
	if len(release) == 0 {
		return nil, nil
	}
	var latestList []*publish.Latest
	var err error
	if len(release) == 1 {
		latestList, err = s.latestStore.ListQuery(ctx, "`release` = ?", []interface{}{release[0]}, "id asc")
	} else {
		latestList, err = s.latestStore.ListQuery(ctx, "`release` in (?)", []interface{}{release}, "id asc")
	}
	if err != nil {
		return nil, err
	}
	if len(latestList) == 0 {
		return nil, nil
	}
	var flows []*publish.Publish
	if len(latestList) == 1 {
		f, err := s.store.GetByUUID(ctx, latestList[0].Latest)
		if err != nil {
			return nil, err
		}
		flows = []*publish.Publish{f}
	} else {
		flowsIds := utils.SliceToSlice(latestList, func(v *publish.Latest) string {
			return v.Latest
		})
		flows, err = s.store.ListQuery(ctx, "uuid in (?)", []interface{}{flowsIds}, "id asc")
		if err != nil {
			return nil, err
		}
	}
	
	return utils.SliceToSlice(flows, FromEntity), nil
	
}

func (s *imlPublishService) GetLatest(ctx context.Context, id string) (*Publish, error) {
	latest, err := s.Latest(ctx, id)
	if err != nil {
		return nil, err
	}
	if len(latest) == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	return latest[0], nil
}

func (s *imlPublishService) Get(ctx context.Context, id string) (*Publish, error) {
	env, err := s.store.GetByUUID(ctx, id)
	if err != nil {
		return nil, err
	}
	return FromEntity(env), nil
}

func (s *imlPublishService) GetDiff(ctx context.Context, id string) (*service_diff.Diff, error) {
	ev, err := s.diffStore.GetByUUID(ctx, id)
	if err != nil {
		return nil, err
	}
	df := new(service_diff.Diff)
	err = json.Unmarshal(ev.Data, df)
	if err != nil {
		return nil, err
	}
	return df, nil
}

func (s *imlPublishService) ListProject(ctx context.Context, service string) ([]*Publish, error) {
	flows, err := s.store.ListQuery(ctx, "service = ?", []interface{}{service}, "apply_time desc")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(flows, FromEntity), nil
}

func (s *imlPublishService) ListProjectPage(ctx context.Context, service string, page int, pageSize int) ([]*Publish, int64, error) {
	flows, total, err := s.store.ListPage(ctx, "service = ?", page, pageSize, []interface{}{service}, "apply_time desc")
	if err != nil {
		return nil, 0, err
	}
	return utils.SliceToSlice(flows, FromEntity), total, nil
}

func (s *imlPublishService) ListForStatus(ctx context.Context, service string, status ...StatusType) ([]*Publish, error) {
	
	wheres := make([]string, 0, 2)
	args := make([]interface{}, 0, 2)
	if service != "" {
		wheres = append(wheres, "service = ?")
		args = append(args, service)
	}
	if len(status) == 1 {
		wheres = append(wheres, "status = ?")
		args = append(args, status[0])
	} else if len(status) > 1 {
		wheres = append(wheres, "status in (?)")
		args = append(args, status)
	}
	if len(wheres) == 0 {
		return nil, errors.New("required status")
	}
	
	flows, err := s.store.ListQuery(ctx, strings.Join(wheres, " and "), args, "id asc")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(flows, FromEntity), nil
}
func (s *imlPublishService) ListForStatusPage(ctx context.Context, page int, pageSize int, status ...StatusType) ([]*Publish, int64, error) {
	
	if len(status) == 0 {
		return nil, 0, errors.New("required status")
	}
	if len(status) == 1 {
		flows, total, err := s.store.ListPage(ctx, "status = ?", page, pageSize, []interface{}{status[0]}, "id asc")
		if err != nil {
			return nil, 0, err
		}
		return utils.SliceToSlice(flows, FromEntity), total, nil
	}
	flows, total, err := s.store.ListPage(ctx, "status in (?)", page, pageSize, []interface{}{status}, "id asc")
	if err != nil {
		return nil, 0, err
	}
	return utils.SliceToSlice(flows, FromEntity), total, nil
}

func (s *imlPublishService) Create(ctx context.Context, uuid, service, release, previous, version, remark string, df *service_diff.Diff) error {
	operator := utils.UserId(ctx)
	data, err := json.Marshal(df)
	if err != nil {
		return err
	}
	err = s.store.Transaction(ctx, func(ctx context.Context) error {
		nv := &publish.Publish{
			Id:          0,
			UUID:        uuid,
			Service:     service,
			Release:     release,
			Previous:    previous,
			Version:     version,
			ApplyTime:   time.Now(),
			Applicant:   operator,
			Remark:      remark,
			ApproveTime: time.Time{},
			Approver:    "",
			Comments:    "",
			Status:      int(StatusApply),
		}
		err := s.store.Insert(ctx, nv)
		if err != nil {
			return err
		}
		
		// diff
		err = s.diffStore.Insert(ctx, &publish.Diff{
			Id:   nv.Id,
			UUID: uuid,
			Data: data})
		if err != nil {
			return err
		}
		return s.latestStore.Save(ctx, &publish.Latest{
			Id:      0,
			Release: release,
			Latest:  uuid,
		})
	})
	if err != nil {
		return err
	}
	return nil
}

func (s *imlPublishService) SetStatus(ctx context.Context, service, id string, status StatusType) error {
	return s.store.Transaction(ctx, func(ctx context.Context) error {
		ev, err := s.store.GetByUUID(ctx, id)
		if err != nil {
			return err
		}
		if ev.Service != service {
			return errors.New("service not match")
		}
		ev.Status = int(status)
		_, err = s.store.Update(ctx, ev)
		if err != nil {
			return err
		}
		return err
	})
}
