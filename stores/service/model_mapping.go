package service

import (
	"reflect"
	"time"

	"github.com/eolinker/go-common/store"
	"github.com/eolinker/go-common/autowire"
)

type ModelMapping struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:PRIMARY ID;primary_key"`
	UUID     string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:uuid"`
	Service  string    `gorm:"type:varchar(36);not null;column:service;index:service;comment:service:uuid"`
	Content  string    `gorm:"type:text;not null;column:content;comment:mapping json"`
	Creator  string    `gorm:"type:varchar(36);not null;column:creator;comment:creator" aovalue:"creator"`
	Updater  string    `gorm:"type:varchar(36);not null;column:updater;comment:updater" aovalue:"updater"`
	CreateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:create_at"`
	UpdateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:update_at"`
}

func (m *ModelMapping) TableName() string {
	return "service_model_mapping"
}

func (m *ModelMapping) IdValue() int64 {
	return m.Id
}

type IModelMappingStore interface {
	store.ISearchStore[ModelMapping]
}

type imlModelMappingStore struct {
	store.SearchStore[ModelMapping]
}

func init() {
	autowire.Auto[IModelMappingStore](func() reflect.Value {
		return reflect.ValueOf(new(imlModelMappingStore))
	})
}
