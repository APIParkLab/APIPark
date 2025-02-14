package ai_balance

import (
	"context"
	"fmt"
	"sort"
	"time"

	"github.com/eolinker/go-common/store"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/APIParkLab/APIPark/stores/ai"
)

var _ IBalanceService = (*imlBalanceService)(nil)

type imlBalanceService struct {
	store       ai.IBalanceStore   `autowired:""`
	transaction store.ITransaction `autowired:""`
	universally.IServiceGet[Balance]
	universally.IServiceCreate[Create]
	universally.IServiceEdit[Edit]
	universally.IServiceDelete
}

func (i *imlBalanceService) OnComplete() {
	i.IServiceGet = universally.NewGet[Balance, ai.Balance](i.store, FromEntity)
	i.IServiceCreate = universally.NewCreator[Create, ai.Balance](i.store, "ai_balance", createEntityHandler, uniquestHandler, labelHandler)
	i.IServiceEdit = universally.NewEdit[Edit, ai.Balance](i.store, updateHandler, labelHandler)
	i.IServiceDelete = universally.NewDelete[ai.Balance](i.store)
}

func (i *imlBalanceService) MaxPriority(ctx context.Context) (int, error) {
	info, err := i.store.First(ctx, nil, "priority desc")
	if err != nil {
		return 0, err
	}
	return info.Priority, nil
}

func (i *imlBalanceService) SortBefore(ctx context.Context, originID string, targetID string) ([]*Balance, error) {
	originKey, err := i.store.GetByUUID(ctx, originID)
	if err != nil {
		return nil, fmt.Errorf("get key error: %v,id is %s", err, originID)
	}
	targetKey, err := i.store.GetByUUID(ctx, targetID)
	if err != nil {
		return nil, fmt.Errorf("get key error: %v,id is %s", err, targetID)
	}
	originKeySort, targetKeySort := originKey.Priority, targetKey.Priority
	// 初始化顺序，假设原始Key在目标Key之后，中间的key往后移动，原始Key移动到`targetKeySort`位置
	originKey.Priority = targetKeySort
	fn := func(priority int) int {
		return priority + 1
	}
	sql := "sort < ? and sort >= ?"
	if originKeySort < targetKeySort {
		// 如果原始Key在目标Key之前，中间的key往前移动，原始Key移动到`targetKeySort - 1`位置
		sql = "sort > ? and sort < ?"
		originKey.Priority = targetKeySort - 1
		fn = func(priority int) int {
			return priority - 1
		}
	}
	list, err := i.store.ListQuery(ctx, sql, []interface{}{originKeySort, targetKeySort}, "sort asc")
	if err != nil {
		return nil, err
	}
	result := make([]*Balance, 0, len(list)+1)
	err = i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		for _, l := range list {
			l.Priority = fn(l.Priority)
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
	sort.Slice(list, func(i, j int) bool { return list[i].Priority < list[j].Priority })
	return result, nil
}

func (i *imlBalanceService) SortAfter(ctx context.Context, originID string, targetID string) ([]*Balance, error) {
	originKey, err := i.store.GetByUUID(ctx, originID)
	if err != nil {
		return nil, fmt.Errorf("get key error: %v,id is %s", err, originID)
	}
	targetKey, err := i.store.GetByUUID(ctx, targetID)
	if err != nil {
		return nil, fmt.Errorf("get key error: %v,id is %s", err, targetID)
	}
	originKeySort, targetKeySort := originKey.Priority, targetKey.Priority
	// 初始化顺序，假设原始Key在目标Key之后，中间的Key往后移动，原始Key移动到`targetKeySort + 1`位置
	originKey.Priority = targetKeySort + 1
	fn := func(priority int) int {
		return priority + 1
	}
	sql := "sort < ? and sort > ?"
	if originKeySort < targetKeySort {
		// 如果原始Key在目标Key之前，中间的Key往前移动，原始Key移动到`targetKeySort`位置
		sql = "sort > ? and sort <= ?"
		originKey.Priority = targetKeySort
		fn = func(priority int) int {
			return priority - 1
		}
	}
	list, err := i.store.ListQuery(ctx, sql, []interface{}{originKeySort, targetKeySort}, "sort asc")
	if err != nil {
		return nil, err
	}
	result := make([]*Balance, 0, len(list)+1)
	err = i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		for _, l := range list {
			l.Priority = fn(l.Priority)
			_, err = i.store.Update(ctx, l)
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
	sort.Slice(list, func(i, j int) bool { return list[i].Priority < list[j].Priority })
	return result, nil
}

func createEntityHandler(i *Create) *ai.Balance {
	now := time.Now()
	return &ai.Balance{
		Uuid:         i.Id,
		Provider:     i.Provider,
		ProviderName: i.ProviderName,
		Model:        i.Model,
		ModelName:    i.ModelName,
		Type:         i.Type,
		Priority:     i.Priority,
		CreateAt:     now,
		UpdateAt:     now,
	}
}

func uniquestHandler(i *Create) []map[string]interface{} {
	return []map[string]interface{}{{"uuid": i.Id}}
}

func labelHandler(e *ai.Balance) []string {
	return []string{e.ProviderName, e.ModelName}
}

func updateHandler(e *ai.Balance, i *Edit) {
	if i.Priority != nil {
		e.Priority = *i.Priority
	}

	if i.State != nil {
		e.State = *i.State
	}

	e.UpdateAt = time.Now()
}
