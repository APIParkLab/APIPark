package plugin

import (
	"github.com/APIParkLab/APIPark/model/plugin_model"
	"time"
)

type Define struct {
	Id          int64                   `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Extend      string                  `gorm:"type:text;not null;column:extend;comment:扩展字段"`
	Name        string                  `gorm:"type:varchar(36);not null;column:name;uniqueIndex:name;comment:name;"`
	Cname       string                  `gorm:"type:varchar(100);not null;column:name;comment:cname"`
	Description string                  `gorm:"size:255;not null;column:description;comment:描述"`
	Kind        plugin_model.Kind       `gorm:"type:tinyint(2);not null;column:kind;comment:类型;index:kind;"`
	Status      plugin_model.Status     `gorm:"type:tinyint(2);not null;column:status;comment:状态;index:status;"`
	Render      plugin_model.Render     `gorm:"type:text;not null;column:render;comment:render;serializer:json"`
	Config      plugin_model.ConfigType `gorm:"type:text;not null;column:config;comment:配置; serializer:json"`
	Sort        int                     `gorm:"type:int(11);not null;column:sort;comment:排序"`
	UpdateTime  time.Time               `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间"`
}

func (m *Define) IdValue() int64 {
	return m.Id
}
func (m *Define) TableName() string {
	return "plugin_define"
}

type Partition struct {
	Id         int64                   `gorm:"type:BIGINT(20);size:20;not null;auto_increment;primary_key;column:id;comment:主键ID;"`
	Partition  string                  `gorm:"size:36;not null;column:partition;comment:分区id;uniqueIndex:partition_plugin,partition_pluginId;index:partition"`
	Plugin     string                  `gorm:"size:36;not null;column:plugin;comment:插件name;uniqueIndex:partition_plugin;index:plugin"`
	Config     plugin_model.ConfigType `gorm:"type:text;not null;column:config;comment:配置; serializer:json"`
	Status     plugin_model.Status     `gorm:"type:tinyint(2);not null;column:status;comment:状态;index:status;"`
	CreateTime time.Time               `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateTime time.Time               `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间"`
	Operator   string                  `gorm:"type:varchar(36);not null;column:operator;comment:操作人;"`
}

func (p *Partition) TableName() string {
	return "plugin_partition"
}
func (p *Partition) IdValue() int64 {
	return p.Id
}
