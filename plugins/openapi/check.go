package openapi

import (
	"strings"
	"time"

	"github.com/eolinker/go-common/ignore"

	"github.com/eolinker/go-common/autowire"

	system_apikey "github.com/APIParkLab/APIPark/module/system-apikey"

	"github.com/eolinker/eosc/env"

	"github.com/gin-gonic/gin"
)

var (
	defaultAPIKey = "37eb0ebf"
	openCheck     = newOpenapiCheck()
)

type openapiCheck struct {
	apikey       string
	apikeyModule system_apikey.IAPIKeyModule `autowired:""`
}

func newOpenapiCheck() *openapiCheck {
	apikey, has := env.GetEnv("API_KEY")
	if !has {
		apikey = defaultAPIKey
	}
	p := &openapiCheck{apikey: apikey}
	autowire.Autowired(p)
	return p
}

func (o *openapiCheck) Check(method string, path string) (bool, []gin.HandlerFunc) {
	if strings.HasPrefix(path, "/openapi/") {
		return true, []gin.HandlerFunc{o.Handler}
	}
	return false, nil
}

func (o *openapiCheck) Sort() int {
	return -1
}

func (o *openapiCheck) Handler(ginCtx *gin.Context) {
	notIgnore := !ignore.IsIgnorePath("openapi", ginCtx.Request.Method, ginCtx.FullPath())
	if !notIgnore {
		return
	}
	authorization := ginCtx.GetHeader("Authorization")
	if authorization == "" {
		apikey, has := ginCtx.GetQuery("apikey")
		if !has {
			ginCtx.AbortWithStatusJSON(403, gin.H{"code": -8, "msg": "invalid token", "success": "fail"})
			return
		}
		authorization = apikey
	}
	authorization = strings.TrimPrefix(authorization, "Bearer ")
	if authorization == o.apikey {
		return
	}
	list, err := o.apikeyModule.SimpleList(ginCtx)
	if err != nil {
		ginCtx.AbortWithStatusJSON(403, gin.H{"code": -8, "msg": "invalid token", "success": "fail"})
		return
	}
	if len(list) == 0 {
		ginCtx.AbortWithStatusJSON(403, gin.H{"code": -8, "msg": "invalid token", "success": "fail"})
		return
	}
	for _, item := range list {
		if item.Value == authorization {
			if item.Expired != 0 && item.Expired < time.Now().Unix() {
				continue
			}
			return
		}
	}
	ginCtx.AbortWithStatusJSON(403, gin.H{"code": -8, "msg": "invalid token", "success": "fail"})
}
