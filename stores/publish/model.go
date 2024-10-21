package publish

import "time"

type Publish struct {
	Id          int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID        string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Service     string    `gorm:"type:varchar(50);not null;column:service;comment:服务名;index:service"`
	Release     string    `gorm:"type:varchar(36);not null;column:release;comment:release id;"`
	Previous    string    `gorm:"type:varchar(50);not null;column:previous;comment:上一个版本release id;index:previous"`
	Version     string    `gorm:"type:varchar(50);not null;column:version;comment:版本号(冗余);index:version;"`
	ApplyTime   time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:apply_time;comment:申请时间"`
	Applicant   string    `gorm:"size:36;not null;column:applicant;comment:申请人;index:applicant"`
	Remark      string    `gorm:"type:text;not null;column:remark;comment:备注"`
	ApproveTime time.Time `gorm:"type:timestamp;DEFAULT:CURRENT_TIMESTAMP;column:approve_time;comment:审核时间"`
	Approver    string    `gorm:"size:36;not null;column:approver;comment:审核人;index:approver"`
	Comments    string    `gorm:"type:text;not null;column:comments;comment:审核意见"`
	Status      int       `gorm:"type:int(11);not null;column:status;index:status; comment:状态, 0: 申请中, 1: 审核中, 2: 审核通过, 3: 审核拒绝, 4: 已发布 5: 已中止 6: 已关闭 7: 发布中 8：发布失败"`
}

func (t *Publish) IdValue() int64 {
	return t.Id
}
func (t *Publish) TableName() string {
	return "service_publish"
}

type Diff struct {
	Id   int64  `gorm:"column:id;type:BIGINT(20);NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID string `gorm:"type:varchar(36);not null;column:uuid;comment:UUID;index:uuid"`
	Data []byte `gorm:"type:text;not null;column:data;comment:版本差异,包含api和upstream"`
}

func (t *Diff) IdValue() int64 {
	return t.Id
}
func (t *Diff) TableName() string {
	return "service_publish_diff"
}

type Latest struct {
	Id      int64  `gorm:"column:id;type:BIGINT(20);NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Release string `gorm:"type:varchar(36);not null;column:release;comment:release id;uniqueIndex:release"`
	Latest  string `gorm:"type:varchar(36);not null;column:latest;comment:latest id;"`
}

func (t *Latest) IdValue() int64 {
	return t.Id
}
func (t *Latest) TableName() string {
	return "service_publish_latest"
}

type Status struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Publish  string    `gorm:"type:varchar(36);not null;column:publish;comment:publish id;uniqueIndex:unique"`
	Cluster  string    `gorm:"type:varchar(36);not null;column:cluster;comment:cluster;uniqueIndex:unique"`
	Status   int       `gorm:"type:int(11);not null;column:status;index:status; comment:状态, 0: 申请中, 1: 审核中, 2: 审核通过, 3: 审核拒绝, 4: 已发布 5: 已中止 6: 已关闭 7: 发布中 8：发布失败"`
	Error    string    `gorm:"type:text;not null;column:error;comment:错误信息"`
	UpdateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:update_at;comment:更新时间"`
}

func (t *Status) IdValue() int64 {
	return t.Id
}
func (t *Status) TableName() string {
	return "service_publish_status"
}
