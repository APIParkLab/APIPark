package log

import (
	"context"
	"errors"
	"time"

	log_print "github.com/eolinker/eosc/log"

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
	store          log_source.ILogSourceStore `autowired:""`
	logRecordStore log_source.ILogRecordStore `autowired:""`
}

func (i *imlLogService) LogRecordsByService(ctx context.Context, serviceId string, start time.Time, end time.Time, page int, size int) ([]*Item, int64, error) {
	list, total, err := i.logRecordStore.ListPage(ctx, "`record_time` between ? and ? and `service` = ?", page, size, []interface{}{
		start,
		end,
		serviceId,
	}, "record_time desc")
	if err != nil {
		return nil, 0, err
	}
	return utils.SliceToSlice(list, func(s *log_source.LogRecord) *Item {
		return &Item{
			ID:            s.UUID,
			Strategy:      s.Strategy,
			Service:       s.Service,
			API:           s.API,
			Method:        s.Method,
			Url:           s.Url,
			RemoteIP:      s.RemoteIP,
			Consumer:      s.Consumer,
			Authorization: s.Authorization,
			InputToken:    s.InputToken,
			OutputToken:   s.OutputToken,
			TotalToken:    s.TotalToken,
			AIProvider:    s.AIProvider,
			AIModel:       s.AIModel,
			StatusCode:    s.StatusCode,
			ResponseTime:  s.ResponseTime,
			Traffic:       s.Traffic,
			RecordTime:    s.RecordTime,
		}
	}), total, nil

}

func (i *imlLogService) InsertLog(ctx context.Context, driver string, input *InsertLog) error {
	// 判断日志是否已存在，若已存在，则不插入
	_, err := i.logRecordStore.First(ctx, map[string]interface{}{"uuid": input.ID})
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log_print.Errorf("get log record %s error: %s", input.ID, err)
			return err
		}
		return i.logRecordStore.Insert(ctx, &log_source.LogRecord{
			UUID:          input.ID,
			Driver:        input.Driver,
			Service:       input.Service,
			API:           input.API,
			Strategy:      input.Strategy,
			Method:        input.Method,
			Url:           input.Url,
			RemoteIP:      input.RemoteIP,
			Consumer:      input.Consumer,
			Authorization: input.Authorization,
			InputToken:    input.InputToken,
			OutputToken:   input.OutputToken,
			TotalToken:    input.TotalToken,
			AIProvider:    input.AIProvider,
			AIModel:       input.AIModel,
			StatusCode:    input.StatusCode,
			ResponseTime:  input.ResponseTime,

			Traffic:    input.Traffic,
			RecordTime: input.RecordTime,
		})
	}
	return nil

}

func (i *imlLogService) OnComplete() {
	drivers := log_driver.Drivers()
	if len(drivers) < 1 {
		return
	}
	ctx := context.Background()
	for _, driver := range drivers {
		factory, has := log_driver.GetFactory(driver)
		if !has {
			log_print.Errorf("driver %s not found", driver)
			continue
		}
		info, err := i.GetLogSource(ctx, driver)
		if err != nil {
			log_print.Errorf("get log source %s error: %s", driver, err)
			continue
		}
		d, _, err := factory.Create(info.Config)
		if err != nil {
			log_print.Errorf("create driver %s error: %s,config: %s", driver, err, info.Config)
			continue
		}
		log_driver.SetDriver(driver, d)
	}
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
		s = &log_source.LogSource{
			UUID:     input.ID,
			Cluster:  *input.Cluster,
			Driver:   driver,
			Config:   *input.Config,
			Creator:  userId,
			Updater:  userId,
			CreateAt: now,
			UpdateAt: now,
		}
		if input.LastPullTime == nil {
			s.LastPullAt = time.Now().Add(-24 * time.Hour)
		} else {
			s.LastPullAt = *input.LastPullTime
		}

	} else {
		if input.Config != nil && *input.Config != "" {
			s.Config = *input.Config
		}
		if input.LastPullTime != nil {
			s.LastPullAt = *input.LastPullTime
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

func (i *imlLogService) LogRecords(ctx context.Context, driver string, keyword string, start time.Time, end time.Time) ([]*Item, int64, error) {
	panic(errors.New("not implemented"))
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
		Item: Item{
			ID:            info.ID,
			Strategy:      info.Strategy,
			Service:       info.Service,
			API:           info.API,
			Method:        info.Method,
			Url:           info.Url,
			RemoteIP:      info.RemoteIP,
			Consumer:      info.Consumer,
			Authorization: info.Authorization,
			InputToken:    info.InputToken,
			OutputToken:   info.OutputToken,
			TotalToken:    info.TotalToken,
			AIProvider:    info.AIProvider,
			AIModel:       info.AIModel,
			StatusCode:    info.StatusCode,
			ResponseTime:  info.ResponseTime,
			Traffic:       info.Traffic,
			RecordTime:    info.RecordTime,
		},
		ContentType:       info.ContentType,
		RequestBody:       info.RequestBody,
		ProxyBody:         info.ProxyBody,
		ProxyResponseBody: info.ProxyResponseBody,
		ResponseBody:      info.ResponseBody,
		RequestHeader:     info.RequestHeader,
		ResponseHeader:    info.ResponseHeader,
	}, nil
}
