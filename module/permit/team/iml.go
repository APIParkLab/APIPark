package team

import (
	"context"
	"errors"

	"github.com/eolinker/go-common/permit"

	"github.com/gin-gonic/gin"

	"github.com/eolinker/ap-account/service/role"
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/utils"
)

var (
	_ ITeamPermitModule = (*imlTeamPermitModule)(nil)
	_ autowire.Complete = (*imlTeamPermitModule)(nil)
)

type imlTeamPermitModule struct {
	roleService       role.IRoleService       `autowired:""`
	roleMemberService role.IRoleMemberService `autowired:""`
}

func (m *imlTeamPermitModule) Permissions(ctx context.Context, teamId string) ([]string, error) {

	uid := utils.UserId(ctx)
	roleMembers, err := m.roleMemberService.List(ctx, role.TeamTarget(teamId), uid)
	if err != nil {
		return nil, err
	}
	roleIds := utils.SliceToSlice(roleMembers, func(rm *role.Member) string {
		return rm.Role
	})
	if len(roleMembers) == 0 {
		return []string{}, nil
	}
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

func (m *imlTeamPermitModule) OnComplete() {
	permit.AddDomainHandler(role.GroupTeam, m.domain)
}

func (m *imlTeamPermitModule) accesses(ctx context.Context, teamId string) ([]string, error) {
	uid := utils.UserId(ctx)
	if uid == "" {
		return nil, errors.New("not login")
	}
	roleMembers, err := m.roleMemberService.List(ctx, role.TeamTarget(teamId), uid)
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

func (m *imlTeamPermitModule) domain(ctx *gin.Context) ([]string, []string, bool) {
	teamId := ctx.Query("team")
	if teamId == "" {
		return nil, nil, false
	}
	accesses, err := m.accesses(ctx, teamId)
	if err != nil {
		return nil, nil, false
	}
	return []string{role.GroupTeam}, accesses, true
}
