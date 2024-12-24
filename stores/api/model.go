package api

import "time"

type API struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID     string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name     string    `gorm:"type:varchar(100);not null;column:name;comment:name"`
	Driver   string    `gorm:"size:36;not null;column:driver;comment:驱动;index:driver"`                      // 驱动
	Service  string    `gorm:"size:36;not null;column:service;comment:服务;index:service"`                    // 服务
	Team     string    `gorm:"size:36;not null;column:team;comment:团队;index:team"`                          // 团队id
	Upstream string    `gorm:"size:36;not null;column:upstream;comment:上游;index:upstream"`                  // 上游ID
	Creator  string    `gorm:"size:36;not null;column:creator;comment:创建人;index:creator" aovalue:"creator"` // 创建人
	CreateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	IsDelete int       `gorm:"type:tinyint(1);not null;column:is_delete;comment:是否删除 0:未删除 1:已删除"`
	Method   []string  `gorm:"size:255;not null;column:method;comment:请求方法;serializer:json"`
	Protocol []string  `gorm:"type:text;not null;column:protocol;comment:协议;serializer:json"`
	Path     string    `gorm:"size:255;not null;column:path;comment:请求路径"`
}
type Info struct {
	Id          int64     `gorm:"column:id;type:BIGINT(20);NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID        string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name        string    `gorm:"type:varchar(100);not null;column:name;comment:name"`
	Description string    `gorm:"size:255;not null;column:description;comment:description"`
	Service     string    `gorm:"size:36;not null;column:service;comment:服务;index:service"`
	Team        string    `gorm:"size:36;not null;column:team;comment:团队;index:team"` // 团队id
	Upstream    string    `gorm:"size:36;not null;column:upstream;comment:上游;index:upstream"`
	Method      []string  `gorm:"size:255;not null;column:method;comment:请求方法;serializer:json" `
	Path        string    `gorm:"size:255;not null;column:path;comment:请求路径"`
	Protocol    []string  `gorm:"type:text;null;column:protocol;comment:协议;serializer:json"`
	Match       string    `gorm:"type:text;null;column:match;comment:匹配规则"`
	Creator     string    `gorm:"size:36;not null;column:creator;comment:创建人;index:creator" aovalue:"creator"` // 创建人
	CreateAt    time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	Updater     string    `gorm:"size:36;not null;column:updater;comment:更新人;index:updater" aovalue:"updater"` // 更新人
	UpdateAt    time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:update_at;comment:更新时间"`
	Disable     bool      `gorm:"type:tinyint(1);not null;column:disable;comment:是否禁用 0:否 1:是"`
}

func (i *Info) TableName() string {
	return "api_info"
}

func (i *Info) IdValue() int64 {
	return i.Id
}

func (a *API) IdValue() int64 {
	return a.Id
}
func (a *API) TableName() string {
	return "api"
}

type Doc struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID     string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Service  string    `gorm:"size:36;not null;column:service;comment:服务;index:service"`
	Content  string    `gorm:"type:text;null;column:content;comment:文档内容"`
	Updater  string    `gorm:"size:36;not null;column:updater;comment:更新人;index:updater" aovalue:"updater"`
	UpdateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:update_at;comment:更新时间"`
	APICount int64     `gorm:"type:int(11);not null;column:api_count;comment:接口数量"`
}

func (i *Doc) TableName() string {
	return "api_doc"
}

func (i *Doc) IdValue() int64 {
	return i.Id
}

type AiAPIInfo struct {
	Id               int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Uuid             string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID"`
	Name             string    `gorm:"type:varchar(100);not null;column:name;comment:name"`
	Service          string    `gorm:"size:36;not null;column:service;comment:服务;index:service"`
	Path             string    `gorm:"size:255;not null;column:path;comment:请求路径"`
	Description      string    `gorm:"size:255;not null;column:description;comment:description"`
	Timeout          int       `gorm:"type:int(11);not null;column:timeout;comment:超时时间"`
	Retry            int       `gorm:"type:int(11);not null;column:retry;comment:重试次数"`
	Model            string    `gorm:"size:255;not null;column:model;comment:模型"`
	Provider         string    `gorm:"size:36;not null;column:provider;comment:提供者;index:provider"`
	Creator          string    `gorm:"size:36;not null;column:creator;comment:创建人;index:creator" aovalue:"creator"`
	CreateAt         time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	Updater          string    `gorm:"size:36;not null;column:updater;comment:更新人;index:updater" aovalue:"updater"`
	UpdateAt         time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:update_at;comment:更新时间"`
	AdditionalConfig string    `gorm:"type:text;null;column:additional_config;comment:额外配置"`
	UseToken         int       `gorm:"type:int(11);not null;column:use_token;comment:使用token"`
	Disable          bool      `gorm:"type:tinyint(1);not null;column:disable;comment:是否禁用 0:否 1:是"`
	IsDelete         bool      `gorm:"type:tinyint(1);not null;column:is_delete;comment:是否删除 0:否 1:是"`
}

func (a *AiAPIInfo) TableName() string {
	return "ai_api_info"
}

func (a *AiAPIInfo) IdValue() int64 {
	return a.Id
}

type AiAPIUse struct {
	Id          int64  `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	API         string `gorm:"size:36;not null;column:api;comment:API;index:api"`
	Service     string `gorm:"size:36;not null;column:service;comment:服务;index:service"`
	Provider    string `gorm:"size:36;not null;column:provider;comment:提供者;index:provider"`
	Day         int    `gorm:"type:int(11);not null;column:day;comment:当前日期"`
	Hour        int    `gorm:"type:int(11);not null;column:hour;comment:当前小时"`
	Minute      int    `gorm:"type:int(11);not null;column:minute;comment:当前分钟"`
	InputToken  int    `gorm:"type:int(11);not null;column:input_token;comment:输入token"`
	OutputToken int    `gorm:"type:int(11);not null;column:output_token;comment:输出token"`
	TotalToken  int    `gorm:"type:int(11);not null;column:total_token;comment:总token"`
}

func (a *AiAPIUse) TableName() string {
	return "ai_api_use"
}

func (a *AiAPIUse) IdValue() int64 {
	return a.Id
}
