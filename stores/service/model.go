package service

import "time"

type Service struct {
	Id   int64  `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID string `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name string `gorm:"type:varchar(100);not null;column:name;comment:name"`

	Description string    `gorm:"size:255;not null;column:description;comment:description"`
	Prefix      string    `gorm:"size:255;not null;column:prefix;comment:前缀"`
	Team        string    `gorm:"size:36;not null;column:team;comment:团队id;index:team"` // 团队id
	Logo        string    `gorm:"type:text;not null;column:logo;comment:logo"`
	ServiceType int       `gorm:"type:int(11);not null;column:service_type;comment:服务类型"`
	Catalogue   string    `gorm:"type:text;not null;column:catalogue;comment:目录"`
	CreateAt    time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt    time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间"`
	IsDelete    int       `gorm:"type:tinyint(1);not null;column:is_delete;comment:是否删除"`
	AsServer    bool      `gorm:"type:tinyint(1);not null;column:as_server;comment:是否为服务端项目"`
	AsApp       bool      `gorm:"type:tinyint(1);not null;column:as_app;comment:是否为应用项目"`
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
