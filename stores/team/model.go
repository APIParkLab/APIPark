package team

import (
	"time"
)

type Team struct {
	Id          int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID        string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name        string    `gorm:"type:varchar(100);not null;column:name;comment:name"`
	Description string    `gorm:"size:255;not null;column:description;comment:description"`
	Creator     string    `gorm:"size:36;not null;column:creator;comment:创建人id" aovalue:"creator"` // 创建人id
	Updater     string    `gorm:"size:36;not null;column:updater;comment:修改人id" aovalue:"updater"` // 修改人id
	CreateAt    time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt    time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间" json:"update_at"`
	IsDelete    bool      `gorm:"type:tinyint(1);not null;column:is_delete;comment:是否删除"`
}

func (t *Team) IdValue() int64 {
	return t.Id
}
func (t *Team) TableName() string {
	return "team"
}

type Member struct {
	Id         int64     `gorm:"type:BIGINT(20);size:20;not null;auto_increment;primary_key;column:id;comment:主键ID;"`
	Tid        string    `gorm:"size:36;not null;column:tid;uniqueIndex:tid;comment:团队id;uniqueIndex:tid_uid;"`
	Uid        string    `gorm:"size:36;not null;column:uid;uniqueIndex:uid;comment:用户id;uniqueIndex:tid_uid;"`
	CreateTime time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
}

func (m *Member) IdValue() int64 {
	return m.Id
}
func (m *Member) TableName() string {
	return "team_member"
}
