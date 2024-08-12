package release

import "time"

type Runtime struct {
	Id         int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Service    string    `gorm:"type:varchar(50);not null;column:service;comment:服务ID;index:service"`
	Release    string    `gorm:"type:varchar(36);not null;column:release;comment:release id;"`
	UpdateTime time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:update_time;comment:更新时间"`
	Operator   string    `gorm:"size:36;not null;column:operator;comment:操作人;index:operator"`
}

func (t *Runtime) IdValue() int64 {
	return t.Id
}
func (t *Runtime) TableName() string {
	return "service_runtime"
}
