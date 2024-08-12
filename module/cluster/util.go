package cluster

import (
	"context"
	"sync"
	
	cluster_dto "github.com/APIParkLab/APIPark/module/cluster/dto"
	
	"github.com/APIParkLab/APIPark/gateway/admin"
)

func nodeStatus(ctx context.Context, nodes []*cluster_dto.Node) {
	if len(nodes) == 0 {
		return
	}
	
	if len(nodes) == 1 {
		nodes[0].Status = ping(ctx, nodes[0].Admins...)
	}
	
	wg := sync.WaitGroup{}
	wg.Add(len(nodes))
	
	for _, n := range nodes {
		go doPingRouting(ctx, n, &wg)
	}
	wg.Wait()
}
func doPingRouting(ctx context.Context, n *cluster_dto.Node, wg *sync.WaitGroup) {
	n.Status = ping(ctx, n.Admins...)
	wg.Done()
}
func ping(ctx context.Context, address ...string) int {
	if len(address) == 0 {
		return 0
	}
	err := admin.Admin(address...).Ping(ctx)
	if err != nil {
		return 0
	}
	
	return 1
}
