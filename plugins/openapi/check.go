package openapi

import (
	"strings"

	"github.com/eolinker/eosc/env"

	"github.com/gin-gonic/gin"
)

var (
	defaultAPIKey = "37eb0ebf"
	openCheck     = newOpenapiCheck()
)

type openapiCheck struct {
	apikey string
}

func newOpenapiCheck() *openapiCheck {
	apikey, has := env.GetEnv("API_KEY")
	if !has {
		apikey = defaultAPIKey
	}
	return &openapiCheck{apikey: apikey}
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
	authorization := ginCtx.GetHeader("Authorization")
	if authorization == "" {
		ginCtx.AbortWithStatusJSON(403, gin.H{"code": -8, "msg": "invalid token", "success": "fail"})
		return
	}
}
