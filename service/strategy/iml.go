package strategy

import (
	"context"
	"fmt"
	"time"

	"github.com/APIParkLab/APIPark/service/universally/commit"

	"github.com/eolinker/go-common/utils"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/APIParkLab/APIPark/stores/strategy"
)

var _ IStrategyService = (*imlStrategyService)(nil)

type imlStrategyService struct {
	store         strategy.IStrategyStore       `autowired:""`
	commitService commit.ICommitService[Commit] `autowired:""`
	universally.IServiceCreate[Create]
	universally.IServiceEdit[Edit]
}

func (i *imlStrategyService) All(ctx context.Context, scope int, target string) ([]*Strategy, error) {
	w := make(map[string]interface{})
	w["scope"] = scope
	if target != "" {
		w["target"] = target
	}
	list, err := i.store.List(ctx, w)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}

func (i *imlStrategyService) Restore(ctx context.Context, id string) error {
	_, err := i.store.UpdateWhere(ctx, map[string]interface{}{"uuid": id}, map[string]interface{}{"is_delete": false})
	return err
}

func (i *imlStrategyService) SearchAllByDriver(ctx context.Context, keyword string, driver string, scope int, target string) ([]*Strategy, error) {
	w := make(map[string]interface{})
	w["scope"] = scope
	if target != "" {
		w["target"] = target
	}
	list, err := i.store.Search(ctx, keyword, w, "update_at")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}

func (i *imlStrategyService) AllByDriver(ctx context.Context, driver string, scope int, target string) ([]*Strategy, error) {
	w := make(map[string]interface{})
	w["scope"] = scope
	if target != "" {
		w["target"] = target
	}
	w["driver"] = driver
	list, err := i.store.List(ctx, w)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}

func (i *imlStrategyService) CommitStrategy(ctx context.Context, scope string, target string, strategyId string, data *Strategy) error {
	key := scope
	if target != "" {
		key = fmt.Sprintf("%s-%s", scope, target)
	}

	return i.commitService.Save(ctx, strategyId, key, &Commit{
		Id:       data.Id,
		Name:     data.Name,
		Priority: data.Priority,
		Filters:  data.Filters,
		Config:   data.Config,
		Driver:   data.Driver,
		IsDelete: data.IsDelete,
		IsStop:   data.IsStop,
		Version:  data.UpdateAt.Format("20060102150405"),
	})
}

func (i *imlStrategyService) GetStrategyCommit(ctx context.Context, commitId string) (*commit.Commit[Commit], error) {
	return i.commitService.Get(ctx, commitId)
}

func (i *imlStrategyService) LatestStrategyCommit(ctx context.Context, scope string, target string, strategyId string) (*commit.Commit[Commit], error) {
	key := scope
	if target != "" {
		key = fmt.Sprintf("%s-%s", scope, target)
	}
	return i.commitService.Latest(ctx, strategyId, key)
}

func (i *imlStrategyService) ListLatestStrategyCommit(ctx context.Context, scope string, target string, strategyIds ...string) ([]*commit.Commit[Commit], error) {
	key := scope
	if target != "" {
		key = fmt.Sprintf("%s-%s", scope, target)
	}
	return i.commitService.ListLatest(ctx, key, strategyIds...)
}

func (i *imlStrategyService) ListStrategyCommit(ctx context.Context, commitIds ...string) ([]*commit.Commit[Commit], error) {
	if len(commitIds) < 1 {
		return nil, fmt.Errorf("commit ids is empty")
	}

	return i.commitService.List(ctx, commitIds...)
}

func (i *imlStrategyService) SearchByDriver(ctx context.Context, keyword string, driver string, scope int, target string, page int, pageSize int, filters []string, order ...string) ([]*Strategy, int64, error) {
	w := map[string]interface{}{
		"scope":  scope,
		"driver": driver,
	}
	if target != "" {
		w["target"] = target
	}
	for _, f := range filters {
		switch f {
		case "enable":
			w["enable"] = true
		case "disable":
			w["enable"] = false
		}
	}
	if len(order) < 1 {
		order = []string{"update_at desc"}
	}
	list, total, err := i.store.SearchByPage(ctx, keyword, w, page, pageSize, order...)
	if err != nil {
		return nil, 0, err
	}
	return utils.SliceToSlice(list, FromEntity), total, nil
}

func (i *imlStrategyService) Get(ctx context.Context, id string) (*Strategy, error) {
	info, err := i.store.GetByUUID(ctx, id)
	if err != nil {
		return nil, err
	}
	return FromEntity(info), nil
}

func (i *imlStrategyService) SortDelete(ctx context.Context, id string) error {
	return i.store.SoftDelete(ctx, map[string]interface{}{"uuid": id})
}

func (i *imlStrategyService) Delete(ctx context.Context, id ...string) error {
	if len(id) == 0 {
		return nil
	}
	_, err := i.store.DeleteWhere(ctx, map[string]interface{}{"uuid": id})
	if err != nil {
		return err
	}
	return nil
}

func (i *imlStrategyService) OnComplete() {

	i.IServiceCreate = universally.NewCreator[Create, strategy.Strategy](i.store, "strategy", createEntityHandler, uniquestHandler, labelHandler)

	i.IServiceEdit = universally.NewEdit[Edit, strategy.Strategy](i.store, updateHandler, labelHandler)
}

func labelHandler(e *strategy.Strategy) []string {
	return []string{e.Name, e.UUID, e.Desc}
}
func uniquestHandler(i *Create) []map[string]interface{} {
	return []map[string]interface{}{{"uuid": i.Id}}
}
func createEntityHandler(i *Create) *strategy.Strategy {
	now := time.Now()
	return &strategy.Strategy{
		UUID:     i.Id,
		Name:     i.Name,
		Priority: i.Priority,
		Desc:     i.Desc,
		Filters:  i.Filters,
		Config:   i.Config,
		Driver:   i.Driver,
		Scope:    i.Scope,
		Target:   i.Target,
		CreateAt: now,
		UpdateAt: now,
		IsStop:   false,
		IsDelete: false,
	}
}
func updateHandler(e *strategy.Strategy, i *Edit) {
	if i.Name != nil {
		e.Name = *i.Name
	}
	if i.Priority != nil {
		e.Priority = *i.Priority
	}
	if i.Desc != nil {
		e.Desc = *i.Desc
	}
	if i.Filters != nil {
		e.Filters = *i.Filters
	}
	if i.Config != nil {
		e.Config = *i.Config
	}
	if i.IsStop != nil {
		e.IsStop = *i.IsStop
	}
	e.UpdateAt = time.Now()
}
