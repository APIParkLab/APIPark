package upstream

import (
	"time"
)

type Upstream struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID     string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name     string    `gorm:"size:255;not null;column:name;comment:名称"`
	Project  string    `gorm:"size:36;not null;column:project;comment:项目;index:project;"` // 项目id
	Team     string    `gorm:"size:36;not null;column:team;comment:团队;index:team;"`       // 团队id
	Remark   string    `gorm:"size:255;not null;column:remark;comment:备注"`
	Creator  string    `gorm:"size:36;not null;column:creator;comment:创建人;index:creator;"` // 创建人
	Updater  string    `gorm:"size:36;not null;column:updater;comment:更新人;index:updater;"` // 更新人
	CreateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:更新时间"`
}

func (u *Upstream) IdValue() int64 {
	return u.Id
}

func (u *Upstream) TableName() string {
	return "upstream"
}
