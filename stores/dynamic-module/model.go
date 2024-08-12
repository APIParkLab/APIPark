package dynamic_module

import "time"

type DynamicModule struct {
	Id          int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID        string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name        string    `gorm:"type:varchar(100);not null;column:name;comment:name"`
	Driver      string    `gorm:"column:driver;type:VARCHAR(255);NOT NULL;comment:驱动"`
	Description string    `gorm:"column:description;type:VARCHAR(255);comment:描述"`
	Version     string    `gorm:"column:version;type:VARCHAR(32);NOT NULL;comment:版本"`
	Config      string    `gorm:"column:config;type:TEXT;NOT NULL;comment:配置"`
	Module      string    `gorm:"column:module;type:VARCHAR(255);NOT NULL;comment:模块"`
	Profession  string    `gorm:"column:profession;type:VARCHAR(255);NOT NULL;comment:插件指定profession"`
	Skill       string    `gorm:"column:skill;type:VARCHAR(255);comment:模块提供能力"`
	Creator     string    `gorm:"type:varchar(36);not null;column:creator;comment:creator" aovalue:"creator"`
	Updater     string    `gorm:"type:varchar(36);not null;column:updater;comment:updater" aovalue:"updater"`
	CreateAt    time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt    time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间"`
}

func (c *DynamicModule) IdValue() int64 {
	return c.Id
}
func (c *DynamicModule) TableName() string {
	return "dynamic_module"
}

type DynamicModulePublish struct {
	Id            int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID          string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	DynamicModule string    `gorm:"column:dynamic_module;type:VARCHAR(255);NOT NULL;comment:动态模块ID"`
	Module        string    `gorm:"column:module;type:VARCHAR(255);NOT NULL;comment:模块"`
	Cluster       string    `gorm:"column:cluster;type:VARCHAR(255);NOT NULL;comment:集群"`
	Version       string    `gorm:"column:version;type:VARCHAR(32);NOT NULL;comment:版本"`
	Creator       string    `gorm:"type:varchar(36);not null;column:creator;comment:creator" aovalue:"creator"`
	CreateAt      time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
}

func (c *DynamicModulePublish) IdValue() int64 {
	return c.Id
}

func (c *DynamicModulePublish) TableName() string {
	return "dynamic_module_publish"
}
