/*
处理cors扩展, 对启用了cors的api,添加 cors信息
从apinto移除api时, 移除对应的cors信息
*/
package extends

import (
	"context"
	"github.com/APIParkLab/APIPark/gateway/apinto/driver"
	"github.com/APIParkLab/APIPark/gateway/apinto/entity"
	admin_client "github.com/eolinker/eosc/process-admin/client"
)

func init() {
	driver.RegisterApiPublishHandler(func(ctx context.Context, client admin_client.Client, api *entity.Router, extends map[string]any) error {
		return nil
	})
	driver.RegisterApiDeleteHandler(func(ctx context.Context, client admin_client.Client, api *entity.Router) error {
		return nil
	})
}
