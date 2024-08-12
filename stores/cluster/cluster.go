package cluster

import (
	"context"

	"github.com/eolinker/go-common/store"
)

var (
	_ IClusterStore = (*storeCluster)(nil)
)

type countByPartition struct {
	Partition string
	Count     int
}
type IClusterStore interface {
	store.IBaseStore[Cluster]
	Count(ctx context.Context) (map[string]int, error)
}
type storeCluster struct {
	store.Store[Cluster] // 用struct方式继承,会自动填充并初始化表
}

func (s *storeCluster) Count(ctx context.Context) (map[string]int, error) {
	rows, err := s.DB(ctx).Model(&Cluster{}).Select([]string{`partition`, "count(*)"}).Group("partition").Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	rs := make(map[string]int)
	for rows.Next() {
		var partition string
		var count int
		err := rows.Scan(&partition, &count)
		if err != nil {
			return nil, err
		}
		rs[partition] = count
	}
	return rs, nil
}
