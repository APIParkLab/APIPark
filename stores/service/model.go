package service

import (
	"time"
)

type Service struct {
	Id   int64  `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID string `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name string `gorm:"type:varchar(100);not null;column:name;comment:name"`

	Description      string    `gorm:"size:255;not null;column:description;comment:description"`
	Prefix           string    `gorm:"size:255;not null;column:prefix;comment:前缀"`
	Team             string    `gorm:"size:36;not null;column:team;comment:团队id;index:team"` // 团队id
	Logo             string    `gorm:"type:text;not null;column:logo;comment:logo"`
	ServiceType      int       `gorm:"type:int(11);not null;column:service_type;comment:服务类型"`
	Catalogue        string    `gorm:"type:text;not null;column:catalogue;comment:目录"`
	CreateAt         time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt         time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间"`
	IsDelete         bool      `gorm:"type:tinyint(1);not null;column:is_delete;comment:是否删除"`
	Kind             int       `gorm:"type:tinyint(4);not null;column:kind;comment:服务种类，0:Rest服务，1:AI服务"`
	State            int       `gorm:"type:tinyint(4);not null;column:state;comment:状态"`
	AdditionalConfig string    `gorm:"type:text;not null;column:additional_config;comment:额外配置"`
	ApprovalType     int       `gorm:"type:tinyint(4);not null;column:approval_type;comment:审核类型"`
	AsServer         bool      `gorm:"type:tinyint(1);not null;column:as_server;comment:是否为服务端项目"`
	AsApp            bool      `gorm:"type:tinyint(1);not null;column:as_app;comment:是否为应用项目"`
	EnableMCP        bool      `gorm:"type:tinyint(1);not null;column:enable_mcp;comment:是否启用MCP"`
}

func (p *Service) IdValue() int64 {
	return p.Id
}

func (p *Service) TableName() string {
	return "service"
}

type Authorization struct {
	Id             int64     `gorm:"type:BIGINT(20);size:20;not null;auto_increment;primary_key;column:id;comment:主键ID;"`
	UUID           string    `gorm:"size:36;not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name           string    `gorm:"size:100;not null;column:name;comment:名称"`
	Application    string    `gorm:"size:100;not null;column:application;comment:应用"`
	Type           string    `gorm:"size:100;not null;column:type;comment:类型"`
	Position       string    `gorm:"size:100;not null;column:position;comment:位置"`
	TokenName      string    `gorm:"size:100;not null;column:token_name;comment:token名称"`
	Config         string    `gorm:"type:text;not null;column:config;comment:配置"`
	Creator        string    `gorm:"size:36;not null;column:creator;comment:创建者" aovalue:"creator"`
	Updater        string    `gorm:"size:36;not null;column:updater;comment:修改者" aovalue:"updater"`
	ExpireTime     int64     `gorm:"type:BIGINT(20);not null;column:expire_time;comment:过期时间"`
	CreateAt       time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt       time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间"`
	HideCredential bool      `gorm:"type:tinyint(1);not null;column:hide_credential;comment:隐藏凭证"`
}

func (a *Authorization) IdValue() int64 {
	return a.Id
}

func (a *Authorization) TableName() string {
	return "service_authorization"
}

type Tag struct {
	Id  int64  `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Tid string `gorm:"size:36;not null;column:tid;comment:标签id;uniqueIndex:sid_tid;index:tid;"`
	Sid string `gorm:"size:36;not null;column:sid;comment:服务id;uniqueIndex:sid_tid;index:sid;"`
}

func (t *Tag) IdValue() int64 {
	return t.Id
}

func (t *Tag) TableName() string {
	return "server_tag"
}

type Doc struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Sid      string    `gorm:"size:36;not null;column:sid;comment:服务id;uniqueIndex:unique_sid;"`
	Doc      string    `gorm:"type:text;column:content;comment:内容"`
	CreateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间" json:"update_at"`
	Creator  string    `gorm:"type:varchar(36);not null;column:creator;comment:创建者"`
	Updater  string    `gorm:"type:varchar(36);not null;column:updater;comment:修改者"`
}

func (d *Doc) IdValue() int64 {
	return d.Id
}

func (d *Doc) TableName() string {
	return "server_doc"
}

type ModelMapping struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:PRIMARY ID;primary_key"`
	Sid      string    `gorm:"size:36;not null;column:sid;comment:service uuid;uniqueIndex:unique_sid;"`
	Content  string    `gorm:"type:text;not null;column:content;comment:mapping json"`
	Creator  string    `gorm:"type:varchar(36);not null;column:creator;comment:creator" aovalue:"creator"`
	Updater  string    `gorm:"type:varchar(36);not null;column:updater;comment:updater" aovalue:"updater"`
	CreateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:create_at"`
	UpdateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:update_at"`
}

func (m *ModelMapping) TableName() string {
	return "service_model_mapping"
}

func (m *ModelMapping) IdValue() int64 {
	return m.Id
}
