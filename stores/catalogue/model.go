package catalogue

import "time"

type Catalogue struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID     string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name     string    `gorm:"type:varchar(100);not null;column:name;comment:name"`
	Sort     int       `gorm:"type:int;not null;column:sort;comment:排序"`
	CreateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间" json:"update_at"`

	Parent string `gorm:"size:36;not null;column:parent;comment:父组id"`
}

func (o *Catalogue) TableName() string {
	return "catalogue"
}

func (o *Catalogue) IdValue() int64 {
	return o.Id
}
