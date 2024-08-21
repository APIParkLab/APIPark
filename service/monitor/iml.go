package monitor

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/eolinker/eosc/log"

	"github.com/eolinker/go-common/cache"

	"github.com/google/uuid"

	"gorm.io/gorm"

	"github.com/eolinker/go-common/utils"

	"github.com/APIParkLab/APIPark/stores/monitor"
)

var (
	_ IMonitorService = (*imlMonitorService)(nil)
)

type imlMonitorService struct {
	store monitor.IMonitorStore `autowired:""`
}

func (i *imlMonitorService) DeleteByPartition(ctx context.Context, partitionId string) error {
	_, err := i.store.DeleteWhere(ctx, map[string]interface{}{
		"partition": partitionId,
	})
	return err
}

func (i *imlMonitorService) GetByCluster(ctx context.Context, partitionId string) (*Monitor, error) {
	info, err := i.store.First(ctx, map[string]interface{}{
		"partition": partitionId,
	})
	if err != nil {
		return nil, err
	}
	return &Monitor{
		ID:       info.UUID,
		Cluster:  info.Cluster,
		Driver:   info.Driver,
		Config:   info.Config,
		Creator:  info.Creator,
		Updater:  info.Updater,
		CreateAt: info.CreateAt,
		UpdateAt: info.UpdateAt,
	}, nil
}

func (i *imlMonitorService) Get(ctx context.Context, id string) (*Monitor, error) {
	info, err := i.store.First(ctx, map[string]interface{}{
		"uuid": id,
	})
	if err != nil {
		return nil, err
	}
	return &Monitor{
		ID:       info.UUID,
		Cluster:  info.Cluster,
		Driver:   info.Driver,
		Config:   info.Config,
		Creator:  info.Creator,
		Updater:  info.Updater,
		CreateAt: info.CreateAt,
		UpdateAt: info.UpdateAt,
	}, nil
}

func (i *imlMonitorService) MapByCluster(ctx context.Context, partitionIds ...string) (map[string]*Monitor, error) {
	if len(partitionIds) == 0 {
		return make(map[string]*Monitor), nil
	}
	list, err := i.store.List(ctx, map[string]interface{}{
		"partition": partitionIds,
	})
	if err != nil {
		return nil, err
	}
	return utils.SliceToMapO(list, func(m *monitor.Monitor) (string, *Monitor) {
		return m.Cluster, &Monitor{
			ID:       m.UUID,
			Cluster:  m.Cluster,
			Driver:   m.Driver,
			Config:   m.Config,
			Creator:  m.Creator,
			Updater:  m.Updater,
			CreateAt: m.CreateAt,
			UpdateAt: m.UpdateAt,
		}
	}), nil
}

func (i *imlMonitorService) Save(ctx context.Context, m *SaveMonitor) error {
	userId := utils.UserId(ctx)
	now := time.Now()
	info, err := i.store.First(ctx, map[string]interface{}{
		"partition": m.Cluster,
	})
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		info = &monitor.Monitor{
			UUID:     uuid.New().String(),
			Cluster:  m.Cluster,
			Driver:   m.Driver,
			Config:   m.Config,
			Creator:  userId,
			Updater:  userId,
			CreateAt: now,
			UpdateAt: now,
		}
	} else {
		info.Config = m.Config
		info.Updater = userId
		info.UpdateAt = now
	}
	return i.store.Save(ctx, info)
}

var (
	_ IMonitorStatisticsCache = (*imlMonitorStatisticsCacheService)(nil)
)

type imlMonitorStatisticsCacheService struct {
	commonCache cache.ICommonCache `autowired:""`
}

func (i *imlMonitorStatisticsCacheService) GetStatisticsCache(ctx context.Context, partitionId string, start, end time.Time, groupBy string, wheres []MonWhereItem, limit int) (map[string]MonCommonData, error) {
	key := fmt.Sprintf("monitor:statistics:%s:%d_%d:%s:%s:%d", partitionId, start.Unix(), end.Unix(), groupBy, formatWhereKey(wheres), limit)

	maps, err := i.commonCache.HGetAll(ctx, key)
	if err != nil {
		log.Errorf("GetStatisticsCache cache.HGetAll key=%s err=%s", key, err.Error())
		return nil, err
	}
	valMap := make(map[string]MonCommonData)
	for k, v := range maps {
		commonData := &MonCommonData{}
		if err = json.Unmarshal([]byte(v), commonData); err != nil {
			log.Errorf("GetStatisticsCache json.Unmarshal err=%s", err.Error())
			return nil, err
		}
		valMap[k] = *commonData
	}

	return valMap, nil
}

func (i *imlMonitorStatisticsCacheService) SetStatisticsCache(ctx context.Context, partitionId string, start, end time.Time, groupBy string, wheres []MonWhereItem, limit int, values map[string]MonCommonData) error {
	key := fmt.Sprintf("monitor:statistics:%s:%d_%d:%s:%s:%d", partitionId, start.Unix(), end.Unix(), groupBy, formatWhereKey(wheres), limit)

	maps := make(map[string][]byte)
	for k, data := range values {
		bytes, err := json.Marshal(data)
		if err != nil {
			log.Errorf("SetStatisticsCache json.Marshal key=%s err=%s", key, err.Error())
			return err
		}
		maps[k] = bytes
	}

	return i.commonCache.HMSet(ctx, key, maps, 5*time.Minute)
}

func (i *imlMonitorStatisticsCacheService) GetTrendCache(ctx context.Context, partitionId string, start, end time.Time, wheres []MonWhereItem) (*MonInvokeCountTrend, error) {
	key := fmt.Sprintf("monitor:trend:%s:%d_%d:%s", partitionId, start.Unix(), end.Unix(), formatWhereKey(wheres))

	bytes, err := i.commonCache.Get(ctx, key)
	if err != nil {
		log.Errorf("GetTrendCache cache.Get key=%s err=%s", key, err.Error())
		return nil, err
	}

	val := new(MonInvokeCountTrend)

	if err = json.Unmarshal(bytes, val); err != nil {
		log.Errorf("GetTrendCache json.Unmarshal key=%s bytes=%v err=%s", key, bytes, err.Error())
		return nil, err
	}

	return val, nil
}

func (i *imlMonitorStatisticsCacheService) SetTrendCache(ctx context.Context, partitionId string, start, end time.Time, wheres []MonWhereItem, value *MonInvokeCountTrend) error {
	key := fmt.Sprintf("monitor:trend:%s:%d_%d:%s", partitionId, start.Unix(), end.Unix(), formatWhereKey(wheres))

	bytes, err := json.Marshal(value)
	if err != nil {
		log.Errorf("SetTrendCache json.Marshal key=%s val=%v err=%s", key, value, err.Error())
		return err
	}

	return i.commonCache.Set(ctx, key, bytes, 5*time.Minute)
}

func (i *imlMonitorStatisticsCacheService) GetMessageTrend(ctx context.Context, partitionId string, start, end time.Time, wheres []MonWhereItem) (*MonMessageTrend, error) {
	key := fmt.Sprintf("monitor:message_trend:%s:%d_%d:%s", partitionId, start.Unix(), end.Unix(), formatWhereKey(wheres))

	bytes, err := i.commonCache.Get(ctx, key)
	if err != nil {
		log.Errorf("GetMessageTrend cache.Get key=%s err=%s", key, err.Error())
		return nil, err
	}

	val := new(MonMessageTrend)

	if err = json.Unmarshal(bytes, val); err != nil {
		log.Errorf("GetMessageTrend json.Unmarshal key=%s bytes=%v err=%s", key, bytes, err.Error())
		return nil, err
	}

	return val, nil
}

func (i *imlMonitorStatisticsCacheService) SetMessageTrend(ctx context.Context, partitionId string, start, end time.Time, wheres []MonWhereItem, val *MonMessageTrend) error {
	key := fmt.Sprintf("monitor:message_trend:%s:%d_%d:%s", partitionId, start.Unix(), end.Unix(), formatWhereKey(wheres))

	bytes, err := json.Marshal(val)
	if err != nil {
		log.Errorf("SetMessageTrend json.Marshal key=%s val=%v err=%s", key, val, err.Error())
		return err
	}

	return i.commonCache.Set(ctx, key, bytes, 5*time.Minute)
}

func formatWhereKey(wheres []MonWhereItem) string {

	whereMap := make(map[string]MonWhereItem)
	keys := make([]string, 0, len(wheres))
	for _, where := range wheres {
		whereMap[where.Key] = where
		keys = append(keys, where.Key)
	}

	sort.Strings(keys)

	redisKeys := make([]string, 0)
	for _, key := range keys {
		if v, ok := whereMap[key]; ok {
			sort.Strings(v.Values)
			redisKeys = append(redisKeys, fmt.Sprintf("%v", strings.Join(v.Values, "_")))
		}
	}

	return strings.Join(redisKeys, ":")
}
