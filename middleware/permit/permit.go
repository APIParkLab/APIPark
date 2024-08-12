package permit_middleware

import (
	"net/http"
	"reflect"
	
	permit_identity "github.com/APIParkLab/APIPark/middleware/permit/identity"
	"github.com/eolinker/eosc/log"
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/permit"
	"github.com/eolinker/go-common/pm3"
	"github.com/eolinker/go-common/utils"
	"github.com/gin-gonic/gin"
)

var (
	checkSort = []string{permit_identity.TeamGroup, permit_identity.SystemGroup}
)

type IPermitMiddleware interface {
	pm3.IMiddleware
}

func init() {
	autowire.Auto[IPermitMiddleware](func() reflect.Value {
		return reflect.ValueOf(new(PermitMiddleware))
	})
}

var (
	_ IPermitMiddleware = (*PermitMiddleware)(nil)
)

type PermitMiddleware struct {
	permitService permit.IPermit `autowired:""`
}

func (p *PermitMiddleware) Sort() int {
	return 99
}

func (p *PermitMiddleware) Check(method string, path string) (bool, []gin.HandlerFunc) {
	// 当前路径是否有配置权限
	accessRules, has := permit.GetPathRule(method, path)
	
	if !has || len(accessRules) == 0 {
		return false, nil
	}
	
	return true, []gin.HandlerFunc{
		func(ginCtx *gin.Context) {
			userId := utils.UserId(ginCtx)
			if userId == "" {
				ginCtx.AbortWithStatusJSON(http.StatusForbidden, gin.H{"code": http.StatusForbidden, "msg": "not login", "success": "fail"})
				ginCtx.Abort()
				return
			}
			
			//if userId == "admin" {
			//	// 超级管理员不校验
			//	return
			//}
			
			for _, group := range checkSort {
				accessList, has := accessRules[group]
				if !has {
					// 当前分组没有配置权限
					continue
				}
				domainHandler, has := permit.SelectDomain(group)
				if !has {
					// 当前分组没有配置身份handler
					continue
				}
				_, myAccess, ok := domainHandler(ginCtx)
				if !ok {
					continue
				}
				accessMap := utils.SliceToMapO(myAccess, func(s string) (string, struct{}) {
					return s, struct{}{}
				})
				for _, acc := range accessList {
					if _, ok := accessMap[acc]; ok {
						return
					}
				}
			}
			//所有group都校验不通过
			log.DebugF("no permission:%s", ginCtx.FullPath())
			ginCtx.AbortWithStatusJSON(http.StatusForbidden, gin.H{"code": http.StatusForbidden, "msg": "no permission", "success": "fail"})
		},
	}
}

func (p *PermitMiddleware) Name() string {
	return "permit"
}
