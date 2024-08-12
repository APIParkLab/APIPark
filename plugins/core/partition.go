package core

import (
	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) partitionApi() []pm3.Api {
	return []pm3.Api{
		//pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/partitions", []string{"context", "query:keyword"}, []string{"partitions"}, p.partitionController.Search),
		//pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/partition", []string{"context", "query:id"}, []string{"partition"}, p.partitionController.Info),
		//pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/partition", []string{"context", "body"}, []string{"partition", "id", "update_time"}, p.partitionController.Create),
		//pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/partition", []string{"context", "query:id", "body"}, []string{"partition"}, p.partitionController.Update),
		//pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/partition", []string{"context", "query:id"}, []string{"id"}, p.partitionController.Delete),
		//pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/partitions", []string{"context"}, []string{"partitions"}, p.partitionController.Simple),
		//pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/partitions/cluster", []string{"context"}, []string{"partitions"}, p.partitionController.SimpleWithCluster),
	}
}
