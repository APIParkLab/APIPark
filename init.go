package main

// init module
import (
	_ "github.com/APIParkLab/APIPark/frontend"
	_ "github.com/APIParkLab/APIPark/gateway/apinto"
	_ "github.com/APIParkLab/APIPark/plugins/core"
	_ "github.com/APIParkLab/APIPark/plugins/openapi"
	_ "github.com/APIParkLab/APIPark/plugins/permit"
	_ "github.com/APIParkLab/APIPark/plugins/publish_flow"
	_ "github.com/APIParkLab/APIPark/resources/locale"
	_ "github.com/eolinker/ap-account/plugin"
	_ "github.com/eolinker/go-common/cache/cache_redis"
	_ "github.com/eolinker/go-common/log-init"
	_ "github.com/eolinker/go-common/store/store_mysql"
)
