package system

import (
	"context"
	"github.com/eolinker/go-common/access"
	"reflect"

	"github.com/gin-gonic/gin"

	"github.com/eolinker/ap-account/service/role"
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/permit"
	"github.com/eolinker/go-common/utils"
)

var (
	_ ISystemPermitModule = (*imlSystemPermitModule)(nil)
	_ autowire.Complete   = (*imlSystemPermitModule)(nil)
)

type imlSystemPermitModule struct {
	permitService     permit.IPermit          `autowired:""`
	roleService       role.IRoleService       `autowired:""`
	roleMemberService role.IRoleMemberService `autowired:""`
}

func (m *imlSystemPermitModule) accesses(ctx context.Context) ([]string, error) {

	// 判断是否是访客，如果是，直接返回访客权限
	if utils.GuestAllow() && utils.IsGuest(ctx) {
		return access.GuestAccess(role.SystemTarget()), nil
	}
	uid := utils.UserId(ctx)
	roleMembers, err := m.roleMemberService.List(ctx, role.SystemTarget(), uid)
	if err != nil {
		return nil, err
	}
	if len(roleMembers) == 0 {
		return []string{}, nil
	}
	roleIds := utils.SliceToSlice(roleMembers, func(rm *role.Member) string {
		return rm.Role
	})
	roles, err := m.roleService.List(ctx, roleIds...)
	if err != nil {
		return nil, err
	}
	permits := make(map[string]struct{})
	for _, r := range roles {
		for _, p := range r.Permit {
			permits[p] = struct{}{}
		}
	}
	return utils.MapToSlice(permits, func(k string, v struct{}) string {
		return k
	}), nil
}

func (m *imlSystemPermitModule) Permissions(ctx context.Context) ([]string, error) {
	return m.accesses(ctx)
}

func (m *imlSystemPermitModule) domain(ctx *gin.Context) ([]string, []string, bool) {

	system, err := m.accesses(ctx)
	if err != nil {
		return nil, nil, false
	}
	return []string{role.GroupSystem}, system, true
}

func (m *imlSystemPermitModule) OnComplete() {
	permit.AddDomainHandler(role.GroupSystem, m.domain)
}

func init() {
	autowire.Auto[ISystemPermitModule](func() reflect.Value {
		return reflect.ValueOf(new(imlSystemPermitModule))
	})
}
