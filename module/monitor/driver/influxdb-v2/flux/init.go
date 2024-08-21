package flux

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
)

func init() {
	autowire.Auto[IFluxQuery](func() reflect.Value {
		return reflect.ValueOf(new(fluxQuery))
	})

	//初始化buckets配置
	initBucketsConfig()
	//初始化tasks定时脚本配置
	initTasksConfig()
}
