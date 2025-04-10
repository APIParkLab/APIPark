package system

import "time"

type APIKey struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID     string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name     string    `gorm:"type:varchar(100);not null;column:name;comment:name"`
	Value    string    `gorm:"type:text;not null;column:value;comment:value;"`
	Expired  int64     `gorm:"type:int(11);not null;column:expired;comment:过期时间"`               // 过期时间
	Creator  string    `gorm:"size:36;not null;column:creator;comment:创建人id" aovalue:"creator"` // 创建人id
	Updater  string    `gorm:"size:36;not null;column:updater;comment:修改人id" aovalue:"updater"` // 修改人id
	CreateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间"`
}

func (a *APIKey) IdValue() int64 {
	return a.Id
}
func (a *APIKey) TableName() string {
	return "system_apikey"
}
