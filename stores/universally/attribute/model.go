package attribute

type Attribute struct {
	Id        int64  `gorm:"type:BIGINT(20);size:20;not null;auto_increment;primary_key;column:id;comment:主键ID;"`
	Target    int64  `gorm:"type:BIGINT(20);size:20;not null;column:target;comment:target id;index:tid; uniqueIndex:target_attribute;"`
	Attribute string `gorm:"type:varchar(20);not null;column:attribute;comment:属性;uniqueIndex:target_attribute;"`
	Value     string `gorm:"type:varchar(255);not null;column:value;comment:属性值;"`
}

func (t *Attribute) IdValue() int64 {
	return t.Id
}
