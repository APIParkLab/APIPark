package cluster

import "time"

type Cluster struct {
	Id       int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID     string    `gorm:"type:varchar(36);not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name     string    `gorm:"type:varchar(100);not null;column:name;comment:name"`
	Cluster  string    `gorm:"type:varchar(36);not null;column:cluster;comment:cluster id"`
	Resume   string    `gorm:"type:varchar(255);not null;column:resume;comment:resume"`
	Creator  string    `gorm:"type:varchar(36);not null;column:creator;comment:creator" aovalue:"creator"`
	Updater  string    `gorm:"type:varchar(36);not null;column:updater;comment:updater" aovalue:"updater"`
	CreateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:create_at;comment:创建时间"`
	UpdateAt time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间" json:"update_at"`
}

func (c *Cluster) IdValue() int64 {
	return c.Id
}
func (c *Cluster) TableName() string {
	return "cluster"
}

type Node struct {
	Id         int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	UUID       string    `gorm:"size:36;not null;column:uuid;uniqueIndex:uuid;comment:UUID;"`
	Name       string    `gorm:"size:100;not null;column:name;comment:name"`
	Cluster    string    `gorm:"column:cluster;type:varchar(36);NOT NULL;comment:cluster id;"`
	UpdateTime time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间" json:"update_at"`
}

func (c *Node) IdValue() int64 {
	return c.Id
}
func (c *Node) TableName() string {
	return "cluster_node"
}

type NodeAddr struct {
	Id         int64     `gorm:"column:id;type:BIGINT(20);AUTO_INCREMENT;NOT NULL;comment:id;primary_key;comment:主键ID;"`
	Cluster    string    `gorm:"column:cluster;type:varchar(36);NOT NULL;comment:cluster id;"`
	Node       string    `gorm:"column:node;type:varchar(36);NOT NULL;comment:node id;"`
	Type       string    `gorm:"size:32;not null;column:type;comment:type;uniqueIndex:node_type_addr;"`
	Addr       string    `gorm:"size:255;not null;column:addr;comment:addr;uniqueIndex:node_type_addr;"`
	UpdateTime time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:update_at;comment:修改时间" json:"update_at"`
}

func (c *NodeAddr) IdValue() int64 {
	return c.Id
}
func (c *NodeAddr) TableName() string {
	return "cluster_node_addr"
}
