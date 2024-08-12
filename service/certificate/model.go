package certificate

import "time"

type Certificate struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	Domains    []string  `json:"domains"`
	Cluster    string    `json:"cluster"`
	NotBefore  time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:not_before;comment:生效时间"`
	NotAfter   time.Time `gorm:"type:timestamp;NOT NULL;DEFAULT:CURRENT_TIMESTAMP;column:not_after;comment:失效时间"`
	Updater    string    `json:"updater"`
	UpdateTime time.Time `json:"update_time"`
}

type File struct {
	ID   string `json:"id"`
	Key  []byte `json:"key"`
	Cert []byte `json:"cert"`
}
