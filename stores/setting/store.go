package setting

import (
	"context"
	"errors"
	"reflect"
	"time"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
	"gorm.io/gorm"
)

var (
	_ ISettingStore = (*imlSettingStore)(nil)
)

type ISettingStore interface {
	Get(ctx context.Context, name string) (*Setting, error)
	Set(ctx context.Context, name string, value string, operator string) error
	All(ctx context.Context) ([]*Setting, error)
}
type imlSettingStore struct {
	store.Store[Setting]
}

func (i *imlSettingStore) All(ctx context.Context) ([]*Setting, error) {
	return i.Store.List(ctx, nil)
}

func (i *imlSettingStore) Get(ctx context.Context, name string) (*Setting, error) {
	return i.Store.First(ctx, map[string]interface{}{"name": name})
}

func (i *imlSettingStore) Set(ctx context.Context, name string, value string, operator string) error {
	return i.Store.Transaction(ctx, func(ctx context.Context) error {
		v, err := i.Store.First(ctx, map[string]interface{}{"name": name})
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		if v == nil {
			v = &Setting{
				Name:     name,
				CreateAt: time.Now(),
				UpdateAt: time.Now(),
				Value:    value,
				Operator: operator,
			}
			return i.Store.Insert(ctx, v)
		}
		v.Value = value
		v.Operator = operator
		v.UpdateAt = time.Now()
		_, err = i.Store.Update(ctx, v)
		return err

	})
}

func init() {
	autowire.Auto[ISettingStore](func() reflect.Value {
		return reflect.ValueOf(new(imlSettingStore))
	})
}
