package certificate

import "time"

type Certificate struct {
	Id         int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID       string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name       string    `gorm:"type:varchar(100);not null;column:name;comment:name"`
	Cluster    string    `gorm:"type:varchar(36);not null;column:cluster;comment:集群;index:cluster"`
	Domains    []string  `gorm:"type:text;not null;column:domains;comment:域名;serializer:json"`
	NotBefore  time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:not_before;comment:生效时间"`
	NotAfter   time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:not_after;comment:失效时间"`
	Updater    string    `gorm:"size:36;not null;column:updater;comment:更新人;index:updater"` // 更新人
	UpdateTime time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间"`
}

func (c *Certificate) IdValue() int64 {
	return c.Id
}
func (c *Certificate) TableName() string {
	return "certificate"
}

type File struct {
	Id   int64  `gorm:"column:id;type:BIGINT(20);NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID string `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Key  []byte `gorm:"type:blob;not null;column:key;comment:证书key"`
	Cert []byte `gorm:"type:blob;not null;column:cert;comment:证书cert"`
}

func (f *File) IdValue() int64 {
	return f.Id
}
func (f *File) TableName() string {
	return "certificate_file"
}
