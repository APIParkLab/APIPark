package ai

import "time"

type Provider struct {
	Id         int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID       string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name       string    `gorm:"type:varchar(100);not null;column:name;comment:name"`
	DefaultLLM string    `gorm:"type:varchar(255);not null;column:default_llm;comment:默认模型ID"`
	Config     string    `gorm:"type:text;not null;column:config;comment:配置信息"`
	Status     int       `gorm:"type:tinyint(1);not null;column:status;comment:状态，0：停用；1：启用，2：异常"`
	Priority   int       `gorm:"type:int;not null;column:priority;comment:优先级，值越小优先级越高"`
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

type LogMetrics struct {
	Id          int64   `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID        string  `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Provider    string  `gorm:"type:varchar(36);not null;column:provider;comment:供应商ID"`
	Model       string  `gorm:"type:varchar(36);not null;column:model;comment:模型ID"`
	InputToken  int     `gorm:"type:int;not null;column:input_token;comment:输入token"`
	OutputToken int     `gorm:"type:int;not null;column:output_token;comment:输出token"`
	TotalToken  int     `gorm:"type:int;not null;column:total_token;comment:总token"`
	Cost        float64 `gorm:"type:int;not null;column:cost;comment:费用"`
	Per         float64 `gorm:"type:int;not null;column:per;comment:每个token的价格"`
}

func (i *LogMetrics) TableName() string {
	return "ai_log_metrics"
}

func (i *LogMetrics) IdValue() int64 {
	return i.Id
}

type Key struct {
	Id         int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Uuid       string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name       string    `gorm:"type:varchar(100);not null;column:name;comment:名称"`
	Config     string    `gorm:"type:text;not null;column:config;comment:配置"`
	Provider   string    `gorm:"type:varchar(36);not null;column:provider;comment:供应商ID"`
	Status     int       `gorm:"type:tinyint(1);not null;column:status;comment:状态,0：停用；1：启用，2：错误；3:超额；4：过期"`
	ExpireTime int       `gorm:"type:int;not null;column:expire_time;comment:过期时间"`
	UseToken   int       `gorm:"type:int;not null;column:use_token;comment:使用token数"`
	Sort       int       `gorm:"type:int;not null;column:sort;comment:排序"`
	Creator    string    `gorm:"size:36;not null;column:creator;comment:创建人;index:creator" aovalue:"creator"` // 创建人
	Updater    string    `gorm:"size:36;not null;column:updater;comment:更新人;index:updater" aovalue:"updater"` // 更新人
	CreateAt   time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt   time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:update_at;comment:更新时间"`
	Default    bool      `gorm:"type:tinyint(1);not null;column:default;comment:是否默认"`
}

func (i *Key) TableName() string {
	return "ai_key"
}

func (i *Key) IdValue() int64 {
	return i.Id
}
