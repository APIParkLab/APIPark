package api

import "time"

type Api struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID     string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name     string    `gorm:"type:varchar(100);not null;column:name;comment:name"`
	Driver   string    `gorm:"size:36;not null;column:driver;comment:驱动;index:driver"`                      // 驱动
	Service  string    `gorm:"size:36;not null;column:service;comment:服务;index:service"`                    // 服务
	Team     string    `gorm:"size:36;not null;column:team;comment:团队;index:team"`                          // 团队id
	Creator  string    `gorm:"size:36;not null;column:creator;comment:创建人;index:creator" aovalue:"creator"` // 创建人
	CreateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	IsDelete int       `gorm:"type:tinyint(1);not null;column:is_delete;comment:是否删除 0:未删除 1:已删除"`
	Method   string    `gorm:"size:36;not null;column:method;comment:请求方法"`
	Path     string    `gorm:"size:512;not null;column:path;comment:请求路径"`
}
type Info struct {
	Id          int64     `gorm:"column:id;type:BIGINT(20);NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID        string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name        string    `gorm:"type:varchar(100);not null;column:name;comment:name"`
	Description string    `gorm:"size:255;not null;column:description;comment:description"`
	Service     string    `gorm:"size:36;not null;column:service;comment:服务;index:service"`
	Team        string    `gorm:"size:36;not null;column:team;comment:团队;index:team"` // 团队id
	Method      string    `gorm:"size:36;not null;column:method;comment:请求方法"`
	Path        string    `gorm:"size:512;not null;column:path;comment:请求路径"`
	Match       string    `gorm:"type:text;null;column:match;comment:匹配规则"`
	Creator     string    `gorm:"size:36;not null;column:creator;comment:创建人;index:creator" aovalue:"creator"` // 创建人
	CreateAt    time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	Updater     string    `gorm:"size:36;not null;column:updater;comment:更新人;index:updater" aovalue:"updater"` // 更新人
	UpdateAt    time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:update_at;comment:更新时间"`
}

func (i *Info) TableName() string {
	return "api_info"
}

func (i *Info) IdValue() int64 {
	return i.Id
}

func (a *Api) IdValue() int64 {
	return a.Id
}
func (a *Api) TableName() string {
	return "api"
}
