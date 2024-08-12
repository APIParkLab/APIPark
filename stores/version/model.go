package version

import (
	"time"
)

type Version struct {
	Id int64 `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`

	Version     string    `gorm:"size:36;not null;column:version;uniqueIndex:Version;comment:Version;"`
	Description string    `gorm:"size:255;not null;column:description;comment:description;"`
	CreateAt    time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
}

func (v *Version) IdValue() int64 {
	return v.Id
}
func (v *Version) TableName() string {
	return "version"
}
