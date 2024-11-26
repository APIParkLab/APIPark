package strategy

import "time"

type Strategy struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID     string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name     string    `gorm:"type:varchar(100);not null;column:name;comment:name"`
	Priority int       `gorm:"type:int(11);not null;column:priority;comment:优先级"`
	Desc     string    `gorm:"type:text;null;column:desc;comment:描述"`
	Filters  string    `gorm:"type:mediumtext;null;column:filters;comment:筛选条件"`
	Config   string    `gorm:"type:mediumtext;null;column:config;comment:配置"`
	Driver   string    `gorm:"type:varchar(100);not null;column:driver;comment:驱动"`
	Scope    int       `gorm:"type:tinyint(1);not null;column:scope;comment:范围 0:全局 1:团队 2:服务"`
	Target   string    `gorm:"type:varchar(36);null;column:target;comment:目标ID"`
	Creator  string    `gorm:"type:varchar(36);not null;column:creator;comment:创建人" aovalue:"creator"`
	Updater  string    `gorm:"type:varchar(36);null;column:updater;comment:更新人" aovalue:"updater"`
	CreateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:update_at;comment:更新时间"`
	IsStop   bool      `gorm:"type:tinyint(1);not null;column:enable;comment:是否禁用 0:否 1:是"`
	IsDelete bool      `gorm:"type:tinyint(1);not null;column:is_delete;comment:是否删除 0:未删除 1:已删除"`
}

func (s *Strategy) TableName() string {
	return "strategy"
}

func (s *Strategy) IdValue() int64 {
	return s.Id
}
