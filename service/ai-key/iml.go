package ai_key

import (
	"context"
	"fmt"
	"sort"
	"time"

	"github.com/eolinker/go-common/store"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/APIParkLab/APIPark/stores/ai"
)

var _ IKeyService = &imlAIKeyService{}

type imlAIKeyService struct {
	store       ai.IKeyStore       `autowired:""`
	transaction store.ITransaction `autowired:""`
	universally.IServiceGet[Key]
	universally.IServiceCreate[Create]
	universally.IServiceEdit[Edit]
	universally.IServiceDelete
}

func (i *imlAIKeyService) KeysAfterPriority(ctx context.Context, providerId string, priority int) ([]*Key, error) {
	list, err := i.store.ListQuery(ctx, "sort > ? and provider = ?", []interface{}{priority, providerId}, "sort asc")
	if err != nil {
		return nil, err
	}
	var result []*Key
	for _, item := range list {
		result = append(result, FromEntity(item))
	}
	return result, nil
}

func (i *imlAIKeyService) MaxPriority(ctx context.Context, providerId string) (int, error) {
	info, err := i.store.First(ctx, map[string]interface{}{"provider": providerId}, "sort desc")
	if err != nil {
		return 0, err
	}
	return info.Sort, nil
}

func (i *imlAIKeyService) DefaultKey(ctx context.Context, providerId string) (*Key, error) {
	info, err := i.store.First(ctx, map[string]interface{}{"provider": providerId, "default": true})
	if err != nil {
		return nil, err
	}
	return FromEntity(info), nil
}

func (i *imlAIKeyService) KeysByProvider(ctx context.Context, providerId string) ([]*Key, error) {
	list, err := i.store.List(ctx, map[string]interface{}{"provider": providerId})
	if err != nil {
		return nil, err
	}
	var result []*Key
	for _, item := range list {
		result = append(result, FromEntity(item))
	}
	return result, nil
}

func (i *imlAIKeyService) SortBefore(ctx context.Context, provider string, originID string, targetID string) ([]*Key, error) {
	originKey, err := i.store.GetByUUID(ctx, originID)
	if err != nil {
		return nil, fmt.Errorf("get key error: %v,id is %s", err, originID)
	}
	targetKey, err := i.store.GetByUUID(ctx, targetID)
	if err != nil {
		return nil, fmt.Errorf("get key error: %v,id is %s", err, targetID)
	}
	originKeySort, targetKeySort := originKey.Sort, targetKey.Sort
	// 初始化顺序，假设原始Key在目标Key之后，中间的key往后移动，原始Key移动到`targetKeySort`位置
	originKey.Sort = targetKeySort
	fn := func(priority int) int {
		return priority + 1
	}
	sql := "sort < ? and sort >= ?"
	if originKeySort < targetKeySort {
		// 如果原始Key在目标Key之前，中间的key往前移动，原始Key移动到`targetKeySort - 1`位置
		sql = "sort > ? and sort < ?"
		originKey.Sort = targetKeySort - 1
		fn = func(priority int) int {
			return priority - 1
		}
	}
	list, err := i.store.ListQuery(ctx, sql, []interface{}{originKeySort, targetKeySort}, "sort asc")
	if err != nil {
		return nil, err
	}
	result := make([]*Key, 0, len(list)+1)
	err = i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		for _, l := range list {
			l.Sort = fn(l.Sort)
			_, err := i.store.Update(ctx, l)
			if err != nil {
				return err
			}
			result = append(result, FromEntity(l))
		}
		_, err = i.store.Update(ctx, originKey)
		return err
	})
	if err != nil {
		return nil, err
	}
	result = append(result, FromEntity(originKey))
	sort.Slice(list, func(i, j int) bool { return list[i].Sort < list[j].Sort })
	return result, nil
}

func (i *imlAIKeyService) SortAfter(ctx context.Context, provider string, originID string, targetID string) ([]*Key, error) {
	originKey, err := i.store.GetByUUID(ctx, originID)
	if err != nil {
		return nil, fmt.Errorf("get key error: %v,id is %s", err, originID)
	}
	targetKey, err := i.store.GetByUUID(ctx, targetID)
	if err != nil {
		return nil, fmt.Errorf("get key error: %v,id is %s", err, targetID)
	}
	originKeySort, targetKeySort := originKey.Sort, targetKey.Sort
	// 初始化顺序，假设原始Key在目标Key之后，中间的Key往后移动，原始Key移动到`targetKeySort + 1`位置
	originKey.Sort = targetKeySort + 1
	fn := func(priority int) int {
		return priority + 1
	}
	sql := "sort < ? and sort > ?"
	if originKeySort < targetKeySort {
		// 如果原始Key在目标Key之前，中间的Key往前移动，原始Key移动到`targetKeySort`位置
		sql = "sort > ? and sort <= ?"
		originKey.Sort = targetKeySort
		fn = func(priority int) int {
			return priority - 1
		}
	}
	list, err := i.store.ListQuery(ctx, sql, []interface{}{originKeySort, targetKeySort}, "sort asc")
	if err != nil {
		return nil, err
	}
	result := make([]*Key, 0, len(list)+1)
	err = i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		for _, l := range list {
			l.Sort = fn(l.Sort)
			_, err := i.store.Update(ctx, l)
			if err != nil {
				return err
			}
			result = append(result, FromEntity(l))
		}
		_, err = i.store.Update(ctx, originKey)
		return err
	})
	if err != nil {
		return nil, err
	}
	result = append(result, FromEntity(originKey))
	sort.Slice(list, func(i, j int) bool { return list[i].Sort < list[j].Sort })
	return result, nil
}

func (i *imlAIKeyService) OnComplete() {
	i.IServiceGet = universally.NewGet[Key, ai.Key](i.store, FromEntity)
	i.IServiceCreate = universally.NewCreator[Create, ai.Key](i.store, "ai_api_info", createEntityHandler, uniquestHandler, labelHandler)
	i.IServiceEdit = universally.NewEdit[Edit, ai.Key](i.store, updateHandler)
	i.IServiceDelete = universally.NewDelete[ai.Key](i.store)
}

func labelHandler(e *ai.Key) []string {
	return []string{e.Name, e.Uuid}
}
func uniquestHandler(i *Create) []map[string]interface{} {
	return []map[string]interface{}{{"uuid": i.ID}}
}
func createEntityHandler(i *Create) *ai.Key {
	now := time.Now()
	return &ai.Key{
		Uuid:       i.ID,
		Name:       i.Name,
		Config:     i.Config,
		Provider:   i.Provider,
		Status:     i.Status,
		ExpireTime: i.ExpireTime,
		Sort:       i.Priority,
		UseToken:   0,
		CreateAt:   now,
		UpdateAt:   now,
		Default:    i.Default,
	}
}
func updateHandler(e *ai.Key, i *Edit) {
	if i.Name != nil {
		e.Name = *i.Name
	}
	if i.Config != nil {
		e.Config = *i.Config
	}
	if i.Status != nil {
		e.Status = *i.Status
	}
	if i.ExpireTime != nil {
		e.ExpireTime = *i.ExpireTime
	}
	if i.Priority != nil {
		e.Sort = *i.Priority
	}
	e.UpdateAt = time.Now()
}
