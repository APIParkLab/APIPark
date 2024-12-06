package commit

import "time"

type Commit[H any] struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID     string    `gorm:"size:36;not null;column:uuid;comment:uuid;uniqueIndex:uuid;"`
	Target   string    `gorm:"column:target;type:varchar(36);NOT NULL;comment:目标id;index:target;"`
	Key      string    `gorm:"size:50;not null;column:key;comment:类型;index:key;"`
	Data     *H        `gorm:"type:text;not null;column:data;comment:数据;charset=utf8mb4;serializer:json"`
	CreateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	Operator string    `gorm:"size:36;not null;column:operator;comment:操作人;index:operator;"`
}
type Latest struct {
	Id     int64  `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Target string `gorm:"column:target;type:varchar(36);NOT NULL;comment:目标id;index:target;uniqueIndex:target_type;"`
	Key    string `gorm:"size:50;not null;column:key;comment:类型;index:key;uniqueIndex:target_type;"`
	Latest string `gorm:"size:36;not null;column:latest;comment:最新版本 id"`
}
