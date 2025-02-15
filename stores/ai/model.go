package ai

import "time"

type Provider struct {
	Id         int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID       string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name       string    `gorm:"type:varchar(100);not null;column:name;comment:name"`
	DefaultLLM string    `gorm:"type:varchar(255);not null;column:default_llm;comment:默认模型ID"`
	Config     string    `gorm:"type:text;not null;column:config;comment:配置信息"`
	Status     int       `gorm:"type:tinyint(1);not null;column:status;comment:状态，0：停用；1：启用，2：异常;default:1"`
	Priority   int       `gorm:"type:int;not null;column:priority;comment:优先级，值越小优先级越高"`
	Creator    string    `gorm:"size:36;not null;column:creator;comment:创建人;index:creator" aovalue:"creator"` // 创建人
	Updater    string    `gorm:"size:36;not null;column:updater;comment:更新人;index:updater" aovalue:"updater"` // 更新人
	CreateAt   time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt   time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:update_at;comment:更新时间"`
}

func (i *Provider) TableName() string {
	return "ai_provider"
}

func (i *Provider) IdValue() int64 {
	return i.Id
}

type LogMetrics struct {
	Id          int64   `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID        string  `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Provider    string  `gorm:"type:varchar(36);not null;column:provider;comment:供应商ID"`
	Model       string  `gorm:"type:varchar(36);not null;column:model;comment:模型ID"`
	InputToken  int     `gorm:"type:int;not null;column:input_token;comment:输入token"`
	OutputToken int     `gorm:"type:int;not null;column:output_token;comment:输出token"`
	TotalToken  int     `gorm:"type:int;not null;column:total_token;comment:总token"`
	Cost        float64 `gorm:"type:int;not null;column:cost;comment:费用"`
	Per         float64 `gorm:"type:int;not null;column:per;comment:每个token的价格"`
}

func (i *LogMetrics) TableName() string {
	return "ai_log_metrics"
}

func (i *LogMetrics) IdValue() int64 {
	return i.Id
}

type Key struct {
	Id         int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Uuid       string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name       string    `gorm:"type:varchar(100);not null;column:name;comment:名称"`
	Config     string    `gorm:"type:text;not null;column:config;comment:配置"`
	Provider   string    `gorm:"type:varchar(36);not null;column:provider;comment:供应商ID"`
	Status     int       `gorm:"type:tinyint(1);not null;column:status;comment:状态,0：停用；1：启用，2：错误；3:超额；4：过期"`
	ExpireTime int       `gorm:"type:int;not null;column:expire_time;comment:过期时间"`
	UseToken   int       `gorm:"type:int;not null;column:use_token;comment:使用token数"`
	Sort       int       `gorm:"type:int;not null;column:sort;comment:排序"`
	Creator    string    `gorm:"size:36;not null;column:creator;comment:创建人;index:creator" aovalue:"creator"` // 创建人
	Updater    string    `gorm:"size:36;not null;column:updater;comment:更新人;index:updater" aovalue:"updater"` // 更新人
	CreateAt   time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt   time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:update_at;comment:更新时间"`
	Default    bool      `gorm:"type:tinyint(1);not null;column:default;comment:是否默认"`
}

func (i *Key) TableName() string {
	return "ai_key"
}

func (i *Key) IdValue() int64 {
	return i.Id
}

type Balance struct {
	Id           int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Uuid         string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Provider     string    `gorm:"type:varchar(100);not null;column:provider;comment:供应商ID;uniqueIndex:provider_model" aovalue:"provider`
	ProviderName string    `gorm:"type:varchar(100);not null;column:provider_name;comment:供应商名称"`
	Model        string    `gorm:"type:varchar(100);not null;column:model;comment:模型ID;uniqueIndex:provider_model"`
	ModelName    string    `gorm:"type:varchar(100);not null;column:model_name;comment:模型名称"`
	Type         int       `gorm:"type:tinyint(1);not null;column:type;comment:类型,0：online，1：local"`
	State        int       `gorm:"type:tinyint(1);not null;column:state;comment:状态,0：异常，1：正常;default:1"`
	Priority     int       `gorm:"type:int;not null;column:priority;comment:优先级，数字越小优先级越大"`
	Creator      string    `gorm:"size:36;not null;column:creator;comment:创建人;index:creator" aovalue:"creator"` // 创建人
	Updater      string    `gorm:"size:36;not null;column:updater;comment:更新人;index:updater" aovalue:"updater"` // 更新人
	CreateAt     time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt     time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:update_at;comment:更新时间"`
}

func (i *Balance) TableName() string {
	return "ai_balance"
}

func (i *Balance) IdValue() int64 {
	return i.Id
}

type LocalModel struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Uuid     string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name     string    `gorm:"type:varchar(100);not null;column:name;comment:名称"`
	Provider string    `gorm:"type:varchar(100);not null;column:provider;comment:供应商ID"`
	State    int       `gorm:"type:tinyint(1);not null;column:state;comment:状态,0：关闭，1：正常;default:1"`
	Creator  string    `gorm:"size:36;not null;column:creator;comment:创建人;index:creator" aovalue:"creator"` // 创建人
	Updater  string    `gorm:"size:36;not null;column:updater;comment:更新人;index:updater" aovalue:"updater"` // 更新人
	CreateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:update_at;comment:更新时间"`
}

func (i *LocalModel) TableName() string {
	return "ai_local_model"
}

func (i *LocalModel) IdValue() int64 {
	return i.Id
}

type LocalModelInstallState struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Uuid     string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Complete int64     `gorm:"type:BIGINT(20);not null;column:complete;comment:已下载大小"`
	Total    int64     `gorm:"type:BIGINT(20);not null;column:total;comment:总大小"`
	State    int       `gorm:"type:tinyint(1);not null;column:state;comment:状态"`
	LastMsg  string    `gorm:"type:text;not null;column:last_msg;comment:最后一次消息"`
	UpdateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:update_at;comment:更新时间"`
}

func (i *LocalModelInstallState) TableName() string {
	return "ai_local_model_install_state"
}

func (i *LocalModelInstallState) IdValue() int64 {
	return i.Id
}

type LocalModelPackage struct {
	Id          int64  `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Uuid        string `gorm:"type:varchar(100);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name        string `gorm:"type:varchar(100);not null;column:name;comment:名称"`
	Size        string `gorm:"type:varchar(100);not null;column:size;comment:模型大小"`
	Hash        string `gorm:"type:varchar(100);not null;column:hash;comment:模型hash"`
	Description string `gorm:"type:varchar(255);not null;column:description;comment:描述"`
	Version     string `gorm:"type:varchar(100);not null;column:version;comment:版本"`
	IsPopular   bool   `gorm:"type:tinyint(1);not null;column:is_popular;comment:是否热门"`
}

func (i *LocalModelPackage) TableName() string {
	return "ai_local_model_package"
}

func (i *LocalModelPackage) IdValue() int64 {
	return i.Id
}
