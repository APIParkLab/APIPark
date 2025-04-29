package log_source

import "time"

type LogSource struct {
	Id         int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID       string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Cluster    string    `gorm:"column:cluster;type:varchar(36);NOT NULL;comment:集群ID"`
	Driver     string    `gorm:"column:driver;type:VARCHAR(36);NOT NULL;comment:驱动"`
	Config     string    `gorm:"column:config;type:TEXT;NOT NULL;comment:配置"`
	Creator    string    `gorm:"type:varchar(36);not null;column:creator;comment:creator" aovalue:"creator"`
	Updater    string    `gorm:"type:varchar(36);not null;column:updater;comment:updater" aovalue:"updater"`
	LastPullAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:last_pull_at;comment:最后拉取时间"`
	CreateAt   time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt   time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间" json:"update_at"`
}

func (c *LogSource) IdValue() int64 {
	return c.Id
}

func (c *LogSource) TableName() string {
	return "log"
}

type LogRecord struct {
	Id            int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID          string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Driver        string    `gorm:"column:driver;type:VARCHAR(36);NOT NULL;comment:驱动"`
	Service       string    `gorm:"column:service;type:varchar(36);NOT NULL;comment:服务ID"`
	API           string    `gorm:"column:api;type:varchar(36);NOT NULL;comment:接口ID"`
	Strategy      string    `gorm:"column:strategy;type:varchar(36);NOT NULL;comment:策略ID"`
	Method        string    `gorm:"column:method;type:varchar(36);NOT NULL;comment:请求方法"`
	Url           string    `gorm:"column:url;type:varchar(255);NOT NULL;comment:请求URL"`
	RemoteIP      string    `gorm:"column:remote_ip;type:varchar(255);NOT NULL;comment:请求IP"`
	Consumer      string    `gorm:"column:consumer;type:varchar(255);NOT NULL;comment:消费者ID"`
	Authorization string    `gorm:"column:authorization;type:varchar(255);NOT NULL;comment:鉴权ID"`
	InputToken    int64     `gorm:"column:input_token;type:int(11);NOT NULL;comment:输入令牌"`
	OutputToken   int64     `gorm:"column:output_token;type:int(11);NOT NULL;comment:输出令牌"`
	TotalToken    int64     `gorm:"column:total_token;type:int(11);NOT NULL;comment:总令牌"`
	AIProvider    string    `gorm:"column:ai_provider;type:varchar(255);NOT NULL;comment:AI提供商"`
	AIModel       string    `gorm:"column:ai_model;type:varchar(255);NOT NULL;comment:AI模型"`
	StatusCode    int64     `gorm:"column:status_code;type:int(11);NOT NULL;comment:请求状态码"`
	ResponseTime  int64     `gorm:"column:response_time;type:int(11);NOT NULL;comment:响应时间"`
	Traffic       int64     `gorm:"column:traffic;type:BIGINT(20);NOT NULL;comment:流量"`
	RecordTime    time.Time `gorm:"column:record_time;type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;comment:记录时间"`
}

func (c *LogRecord) IdValue() int64 {
	return c.Id
}

func (c *LogRecord) TableName() string {
	return "log_record"
}
