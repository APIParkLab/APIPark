package server

import "time"

type ServerCommit struct {
	Description string `json:"description,omitempty"`
	Logo        string `json:"logo,omitempty"`
	Group       string `json:"group,omitempty"`
	GroupName   string `json:"groupName,omitempty"`
	Online      bool   `json:"online,omitempty"`
}

type Server struct {
	Id   int64  `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID string `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name string `gorm:"type:varchar(100);not null;column:name;comment:name"`

	Project  string    `gorm:"size:36;not null;column:project;comment:项目名称"`
	Team     string    `gorm:"size:36;not null;column:team;comment:团队id"`
	Group    string    `gorm:"size:36;not null;column:group;comment:组id"`
	Delete   string    `gorm:"size:36;not null;column:delete;comment:是否删除 0:未删除 1:已删除"`
	Creator  string    `gorm:"size:36;not null;column:creator;comment:创建人;index:creator"` // 创建人
	CreateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
}

func (s *Server) IdValue() int64 {
	return s.Id
}
func (s *Server) TableName() string {
	return "server"
}

type Group struct {
	Id    int64  `gorm:"column:id;type:BIGINT(20);NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Group string `gorm:"size:36;not null;column:group;comment:组id"`
}

func (g *Group) IdValue() int64 {
	return g.Id
}
func (g *Group) TableName() string {
	return "server_group"
}

type Partition struct {
	Id  int64  `gorm:"type:BIGINT(20);size:20;not null;auto_increment;primary_key;column:id;comment:主键ID;"`
	Sid string `gorm:"size:36;not null;column:sid;comment:服务id;uniqueIndex:sid_pid; index:sid;"`
	Pid string `gorm:"size:36;not null;column:pid;comment:分区id;uniqueIndex:sid_pid;index:pid;"`
}

func (p *Partition) IdValue() int64 {
	return p.Id
}
func (p *Partition) TableName() string {
	return "server_partition"
}

type Online struct {
	Id  int64  `gorm:"type:BIGINT(20);size:20;not null;auto_increment;primary_key;column:id;comment:主键ID;"`
	Sid string `gorm:"size:36;not null;column:sid;uniqueIndex:sid;comment:服务id;uniqueIndex:sid;"`
}

func (o *Online) IdValue() int64 {
	return o.Id
}
func (o *Online) TableName() string {
	return "server_online"
}

type Api struct {
	Id   int64  `gorm:"type:BIGINT(20);size:20;not null;auto_increment;primary_key;column:id;comment:主键ID;"`
	Suid string `gorm:"size:36;not null;column:suid;uniqueIndex:suid_api;index:suid;comment:服务id;"`
	Api  string `gorm:"size:36;not null;column:api;uniqueIndex:sid_api;comment:api id;index:api;"`
}

func (a *Api) IdValue() int64 {
	return a.Id
}
func (a *Api) TableName() string {
	return "server_api"
}
