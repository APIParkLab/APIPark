package subscribe

import "time"

type Subscribe struct {
	Id          int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID        string    `gorm:"size:36;not null;column:uuid;comment:uuid;uniqueIndex:uuid;"`
	Service     string    `gorm:"size:36;not null;column:service;comment:服务id;uniqueIndex:unique_subscribe"`
	Application string    `gorm:"size:36;not null;column:application;comment:应用id,项目id,系统id;uniqueIndex:unique_subscribe"`
	ApplyStatus int       `gorm:"type:tinyint(1);not null;column:apply_status;comment:申请状态;index:status;"`
	Applier     string    `gorm:"size:36;not null;column:applier;comment:申请人;index:applier"`
	From        int       `gorm:"type:tinyint(1);not null;column:from;comment:来源;index:status;"`
	CreateAt    time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	ApproveAt   time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:approve_at;comment:审批时间"`
}

func (s *Subscribe) IdValue() int64 {
	return s.Id
}

func (s *Subscribe) TableName() string {
	return "subscribe"
}

type Apply struct {
	Id          int64     `gorm:"column:id;type:BIGINT(20);NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Uuid        string    `gorm:"size:36;not null;column:uuid;comment:uuid;uniqueIndex:uuid;"`                  // uuid
	Service     string    `gorm:"size:36;not null;column:service;comment:服务id;index:service"`                   // 服务id
	Team        string    `gorm:"size:36;not null;column:team;comment:团队id;index:team;"`                        // 团队id
	Application string    `gorm:"size:36;not null;column:application;comment:应用id,项目id,系统id;index:application"` // 订阅应用id
	ApplyTeam   string    `gorm:"size:36;not null;column:apply_team;comment:申请团队id;index:apply_team;"`          // 申请团队id
	Applier     string    `gorm:"size:36;not null;column:applier;comment:申请人;index:applier;" aovalue:"creator"`
	ApplyAt     time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:apply_at;comment:申请时间"`
	Approver    string    `gorm:"size:36;not null;column:approver;comment:审批人;index:approver;"`
	ApproveAt   time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:approve_at;comment:审批时间"`
	Status      int       `gorm:"type:tinyint(1);not null;column:status;comment:审批状态;index:status;"`
	Opinion     string    `gorm:"type:text;not null;column:opinion;comment:审批意见;"`
	Reason      string    `gorm:"type:text;not null;column:reason;comment:申请原因;"`
}

func (a *Apply) IdValue() int64 {
	return a.Id
}

func (a *Apply) TableName() string {
	return "subscribe_apply"
}
