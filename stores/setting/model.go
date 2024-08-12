package setting

import "time"

type Setting struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Name     string    `gorm:"size:255;not null;column:name;comment:name;uniqueIndex:name;"`
	Value    string    `gorm:"type:text;not null;column:value;comment:value;"`
	CreateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间"`
	Operator string    `gorm:"type:varchar(36);not null;column:operator;comment:操作人;"`
}

func (s *Setting) IdValue() int64 {
	return s.Id
}
func (s *Setting) TableName() string {
	return "apinto_setting"
}
