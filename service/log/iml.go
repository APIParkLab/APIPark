package log

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"

	log_driver "github.com/APIParkLab/APIPark/log-driver"

	"github.com/eolinker/go-common/utils"

	"gorm.io/gorm"

	log_source "github.com/APIParkLab/APIPark/stores/log-source"
)

var (
	_ ILogService = (*imlLogService)(nil)
)

type imlLogService struct {
	store log_source.ILogSourceStore `autowired:""`
}

func (i *imlLogService) OnComplete() {

}

func (i *imlLogService) UpdateLogSource(ctx context.Context, driver string, input *Save) error {
	s, err := i.store.First(ctx, map[string]interface{}{"driver": driver})
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		if input.ID == "" {
			input.ID = uuid.NewString()
		}
		if input.Cluster == nil || *input.Cluster == "" {
			return errors.New("cluster is required")
		}
		if input.Config == nil || *input.Config == "" {
			return errors.New("config is required")
		}
		now := time.Now()
		userId := utils.UserId(ctx)
		s = &log_source.Log{
			UUID:     input.ID,
			Cluster:  *input.Cluster,
			Driver:   driver,
			Config:   *input.Config,
			Creator:  userId,
			Updater:  userId,
			CreateAt: now,
			UpdateAt: now,
		}

	} else {
		if input.Config != nil && *input.Config != "" {
			s.Config = *input.Config
		}
		s.Updater = utils.UserId(ctx)
		s.UpdateAt = time.Now()
	}

	err = i.store.Save(ctx, s)
	if err != nil {
		return err
	}

	return nil
}

func (i *imlLogService) GetLogSource(ctx context.Context, driver string) (*Source, error) {
	s, err := i.store.First(ctx, map[string]interface{}{"driver": driver})
	if err != nil {
		return nil, err
	}
	return FromEntity(s), nil
}

func (i *imlLogService) Logs(ctx context.Context, driver string, cluster string, conditions map[string]string, start time.Time, end time.Time, limit int64, offset int64) ([]*Item, int64, error) {
	d, has := log_driver.GetDriver(driver)
	if !has {
		return nil, 0, errors.New("driver not found")
	}
	list, count, err := d.Logs(cluster, conditions, start, end, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	result := make([]*Item, 0, len(list))
	for _, l := range list {
		result = append(result, &Item{
			ID:            l.ID,
			Service:       l.Service,
			Method:        l.Method,
			Url:           l.Url,
			RemoteIP:      l.RemoteIP,
			Consumer:      l.Consumer,
			Authorization: l.Authorization,
			RecordTime:    l.RecordTime,
		})
	}
	return result, count, nil
}

func (i *imlLogService) LogCount(ctx context.Context, driver string, cluster string, conditions map[string]string, spendHour int64, group string) (map[string]int64, error) {
	d, has := log_driver.GetDriver(driver)
	if !has {
		return nil, errors.New("driver not found")
	}
	return d.LogCount(cluster, conditions, spendHour, group)
}

func (i *imlLogService) LogInfo(ctx context.Context, driver string, cluster string, id string) (*Info, error) {
	d, has := log_driver.GetDriver(driver)
	if !has {
		return nil, errors.New("driver not found")
	}
	info, err := d.LogInfo(cluster, id)
	if err != nil {
		return nil, err
	}
	return &Info{
		ID:                info.ID,
		ContentType:       info.ContentType,
		RequestBody:       info.RequestBody,
		ProxyBody:         info.ProxyBody,
		ProxyResponseBody: info.ProxyResponseBody,
		ResponseBody:      info.ResponseBody,
	}, nil
}
