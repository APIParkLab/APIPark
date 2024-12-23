package access_log

import "time"

type Log struct {
	Id           int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID         string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Cluster      string    `gorm:"column:cluster;type:varchar(36);NOT NULL;comment:集群ID"`
	Node         string    `gorm:"column:node;type:varchar(36);NOT NULL;comment:节点ID"`
	Service      string    `gorm:"column:service;type:varchar(36);NOT NULL;comment:服务ID"`
	API          string    `gorm:"column:api;type:varchar(36);NOT NULL;comment:API ID"`
	Application  string    `gorm:"column:application;type:varchar(36);NOT NULL;comment:应用ID"`
	Auth         string    `gorm:"column:auth;type:varchar(36);NOT NULL;comment:认证ID"`
	Type         string    `gorm:"column:type;type:varchar(36);NOT NULL;comment:日志类型;index:idx_type"`
	Target       string    `gorm:"column:target;type:varchar(36);NOT NULL;comment:目标ID"`
	IP           string    `gorm:"column:ip;type:varchar(36);NOT NULL;comment:IP"`
	RequestPath  string    `gorm:"column:request_path;type:varchar(255);NOT NULL;comment:请求路径"`
	Method       string    `gorm:"column:method;type:varchar(36);NOT NULL;comment:请求方法"`
	ResponseTime float64   `gorm:"column:response_time;type:float;NOT NULL;comment:响应时间"`
	StatusCode   int64     `gorm:"column:status_code;type:BIGINT(20);NOT NULL;comment:响应状态码"`
	ReportTime   time.Time `gorm:"column:report_time;type:timestamp;NOT NULL;comment:上报时间;index:idx_report_time"`
}

func (c *Log) IdValue() int64 {
	return c.Id
}

func (c *Log) TableName() string {
	return "access_log"
}
