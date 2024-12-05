package log_source

import "time"

type Log struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID     string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Cluster  string    `gorm:"column:cluster;type:varchar(36);NOT NULL;comment:集群ID"`
	Driver   string    `gorm:"column:driver;type:VARCHAR(36);NOT NULL;comment:驱动"`
	Config   string    `gorm:"column:config;type:TEXT;NOT NULL;comment:配置"`
	Creator  string    `gorm:"type:varchar(36);not null;column:creator;comment:creator" aovalue:"creator"`
	Updater  string    `gorm:"type:varchar(36);not null;column:updater;comment:updater" aovalue:"updater"`
	CreateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间" json:"update_at"`
}

func (c *Log) IdValue() int64 {
	return c.Id
}

func (c *Log) TableName() string {
	return "log"
}
