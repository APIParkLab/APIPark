package release

import "time"

type Release struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID     string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name     string    `gorm:"type:varchar(100);not null;column:name;comment:name"`
	Service  string    `gorm:"type:varchar(50);not null;column:service;comment:服务ID;index:service"`
	Remark   string    `gorm:"size:255;not null;column:remark;comment:备注"`
	Creator  string    `gorm:"size:36;not null;column:creator;comment:创建人;index:creator"` // 创建人
	CreateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
}

func (r *Release) IdValue() int64 {
	return r.Id
}
func (r *Release) TableName() string {
	return "release"
}

type Commit struct {
	Id      int64  `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Release string `gorm:"type:varchar(36);not null;column:release;comment:release id; index:release; uniqueIndex:type_release_type_key"`
	Type    string `gorm:"type:varchar(10);not null;column:type;comment:类型;index:type;uniqueIndex:type_release_type_key"`
	Target  string `gorm:"type:varchar(36);not null;column:target;comment:目标;index:target;uniqueIndex:type_release_type_key"`
	Key     string `gorm:"type:varchar(36);not null;column:api;comment:api id;uniqueIndex:type_release_type_key"`
	Commit  string `gorm:"type:varchar(36);not null;column:commit;comment:commit;"`
}

func (t *Commit) IdValue() int64 {
	return t.Id
}
func (t *Commit) TableName() string {
	return "release_commit"
}
