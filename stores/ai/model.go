package ai

import "time"

type Provider struct {
	Id         int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID       string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name       string    `gorm:"type:varchar(100);not null;column:name;comment:name"`
	DefaultLLM string    `gorm:"type:varchar(255);not null;column:default_llm;comment:默认模型ID"`
	Config     string    `gorm:"type:text;not null;column:config;comment:配置信息"`
	Status     bool      `gorm:"type:tinyint(1);not null;column:status;comment:状态"`
	Creator    string    `gorm:"size:36;not null;column:creator;comment:创建人;index:creator" aovalue:"creator"` // 创建人
	Updater    string    `gorm:"size:36;not null;column:updater;comment:更新人;index:updater" aovalue:"updater"` // 更新人
	CreateAt   time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt   time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:update_at;comment:更新时间"`
}

func (i *Provider) TableName() string {
	return "ai_provider"
}

func (i *Provider) IdValue() int64 {
	return i.Id
}
