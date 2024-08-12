package my_team

import (
	"context"
	"reflect"
	
	"github.com/eolinker/go-common/autowire"
	
	team_dto "github.com/APIParkLab/APIPark/module/my-team/dto"
)

type ITeamModule interface {
	// GetTeam 获取团队信息
	GetTeam(ctx context.Context, id string) (*team_dto.Team, error)
	// Search 搜索团队
	Search(ctx context.Context, keyword string) ([]*team_dto.Item, error)
	// Edit 编辑团队
	Edit(ctx context.Context, id string, input *team_dto.EditTeam) (*team_dto.Team, error)
	// SimpleTeams 简易搜索团队
	SimpleTeams(ctx context.Context, keyword string) ([]*team_dto.SimpleTeam, error)
	// AddMember 添加团队成员
	AddMember(ctx context.Context, id string, uuids ...string) error
	// RemoveMember 移除团队成员
	RemoveMember(ctx context.Context, id string, uuids ...string) error
	// Members 获取团队成员列表
	Members(ctx context.Context, id string, keyword string) ([]*team_dto.Member, error)
	// SimpleMembers 获取团队成员简易列表
	SimpleMembers(ctx context.Context, id string, keyword string) ([]*team_dto.SimpleMember, error)
	
	// UpdateMemberRole 更新成员角色
	UpdateMemberRole(ctx context.Context, id string, input *team_dto.UpdateMemberRole) error
}

func init() {
	autowire.Auto[ITeamModule](func() reflect.Value {
		return reflect.ValueOf(new(imlTeamModule))
	})
}
