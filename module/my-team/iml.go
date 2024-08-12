package my_team

import (
	"context"
	"errors"
	"fmt"
	
	"github.com/eolinker/ap-account/service/role"
	
	"gorm.io/gorm"
	
	department_member "github.com/eolinker/ap-account/service/department-member"
	"github.com/eolinker/go-common/auto"
	
	"github.com/eolinker/ap-account/service/user"
	
	"github.com/eolinker/go-common/store"
	
	"github.com/APIParkLab/APIPark/service/service"
	team_member "github.com/APIParkLab/APIPark/service/team-member"
	
	team_dto "github.com/APIParkLab/APIPark/module/my-team/dto"
	"github.com/APIParkLab/APIPark/service/team"
	"github.com/eolinker/go-common/utils"
)

var (
	_ ITeamModule = (*imlTeamModule)(nil)
)

type imlTeamModule struct {
	teamService             team.ITeamService                `autowired:""`
	teamMemberService       team_member.ITeamMemberService   `autowired:""`
	roleService             role.IRoleService                `autowired:""`
	roleMemberService       role.IRoleMemberService          `autowired:""`
	userService             user.IUserService                `autowired:""`
	departmentMemberService department_member.IMemberService `autowired:""`
	serviceService          service.IServiceService          `autowired:""`
	transaction             store.ITransaction               `autowired:""`
}

func (m *imlTeamModule) UpdateMemberRole(ctx context.Context, id string, input *team_dto.UpdateMemberRole) error {
	_, err := m.teamService.Get(ctx, id)
	if err != nil {
		return err
	}
	return m.transaction.Transaction(ctx, func(ctx context.Context) error {
		if len(input.Roles) < 1 {
			return errors.New("at least one role")
		}
		err = m.roleMemberService.RemoveUserRole(ctx, role.TeamTarget(id), input.Users...)
		if err != nil {
			return err
		}
		for _, roleId := range input.Roles {
			for _, userId := range input.Users {
				err = m.roleMemberService.Add(ctx, &role.AddMember{
					Role:   roleId,
					User:   userId,
					Target: role.TeamTarget(id),
				})
				if err != nil {
					return err
				}
			}
		}
		return nil
	})
}

func (m *imlTeamModule) GetTeam(ctx context.Context, id string) (*team_dto.Team, error) {
	tv, err := m.teamService.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	
	return &team_dto.Team{
		Id:          tv.Id,
		Name:        tv.Name,
		Description: tv.Description,
		CreateTime:  auto.TimeLabel(tv.CreateTime),
		UpdateTime:  auto.TimeLabel(tv.UpdateTime),
		Creator:     auto.UUID(tv.Creator),
		Updater:     auto.UUID(tv.Updater),
	}, nil
}

func (m *imlTeamModule) Search(ctx context.Context, keyword string) ([]*team_dto.Item, error) {
	userID := utils.UserId(ctx)
	memberMap, err := m.teamMemberService.FilterMembersForUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	teamIDs, ok := memberMap[userID]
	if !ok || len(teamIDs) == 0 {
		return make([]*team_dto.Item, 0), nil
	}
	list, err := m.teamService.Search(ctx, keyword, map[string]interface{}{
		"uuid": teamIDs,
	})
	if err != nil {
		return nil, err
	}
	serviceNumMap, err := m.serviceService.ServiceCountByTeam(ctx, teamIDs...)
	if err != nil {
		return nil, err
	}
	appNumMap, err := m.serviceService.AppCountByTeam(ctx, teamIDs...)
	if err != nil {
		return nil, err
	}
	
	outList := make([]*team_dto.Item, 0, len(list))
	for _, v := range list {
		outList = append(outList, team_dto.ToItem(v, serviceNumMap[v.Id], appNumMap[v.Id]))
	}
	return outList, nil
}

func (m *imlTeamModule) Edit(ctx context.Context, id string, input *team_dto.EditTeam) (*team_dto.Team, error) {
	err := m.transaction.Transaction(ctx, func(ctx context.Context) error {
		if input.Master != nil {
			// 负责人是否在团队内，若不在，则新增
			members, err := m.teamMemberService.Members(ctx, []string{id}, []string{*input.Master})
			if err != nil {
				return err
			}
			if len(members) == 0 {
				err = m.teamMemberService.AddMemberTo(ctx, id, *input.Master)
				if err != nil {
					return err
				}
			}
		}
		return m.teamService.Save(ctx, id, &team.EditTeam{
			Name:        input.Name,
			Description: input.Description,
		})
	})
	
	if err != nil {
		return nil, err
	}
	return m.GetTeam(ctx, id)
}

func (m *imlTeamModule) SimpleTeams(ctx context.Context, keyword string) ([]*team_dto.SimpleTeam, error) {
	userID := utils.UserId(ctx)
	memberMap, err := m.teamMemberService.FilterMembersForUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	teamIDs, ok := memberMap[userID]
	if !ok || len(teamIDs) == 0 {
		return make([]*team_dto.SimpleTeam, 0), nil
	}
	list, err := m.teamService.Search(ctx, keyword, map[string]interface{}{
		"uuid": teamIDs,
	})
	if err != nil {
		return nil, err
	}
	
	projects, err := m.serviceService.Search(ctx, "", map[string]interface{}{
		"team": teamIDs,
	})
	projectCount := make(map[string]int64)
	appCount := make(map[string]int64)
	for _, p := range projects {
		if p.AsServer {
			if _, ok := projectCount[p.Team]; !ok {
				projectCount[p.Team] = 0
			}
			projectCount[p.Team]++
		}
		if p.AsApp {
			if _, ok := appCount[p.Team]; !ok {
				appCount[p.Team] = 0
			}
			appCount[p.Team]++
		}
	}
	
	outList := utils.SliceToSlice(list, func(s *team.Team) *team_dto.SimpleTeam {
		return &team_dto.SimpleTeam{
			Id:          s.Id,
			Name:        s.Name,
			Description: s.Description,
			ServiceNum:  projectCount[s.Id],
			AppNum:      appCount[s.Id],
		}
	})
	return outList, nil
}

func (m *imlTeamModule) AddMember(ctx context.Context, id string, uuids ...string) error {
	_, err := m.teamService.Get(ctx, id)
	if err != nil {
		return err
	}
	return m.transaction.Transaction(ctx, func(ctx context.Context) error {
		err = m.teamMemberService.AddMemberTo(ctx, id, uuids...)
		if err != nil {
			return err
		}
		r, err := m.roleService.GetDefaultRole(ctx, role.GroupTeam)
		if err != nil {
			return err
		}
		for _, uid := range uuids {
			err = m.roleMemberService.Add(ctx, &role.AddMember{Role: r.Id, User: uid, Target: role.TeamTarget(id)})
			if err != nil {
				return err
			}
		}
		return nil
	})
	
}

func (m *imlTeamModule) RemoveMember(ctx context.Context, id string, uuids ...string) error {
	_, err := m.teamService.Get(ctx, id)
	if err != nil {
		return err
	}
	
	supperRole, err := m.roleService.GetSupperRole(ctx, role.GroupTeam)
	if err != nil {
		return err
	}
	count, err := m.roleMemberService.CountByRole(ctx, role.TeamTarget(id), supperRole.Id)
	if err != nil {
		return err
	}
	members, err := m.roleMemberService.List(ctx, role.TeamTarget(id), uuids...)
	if err != nil {
		return err
	}
	if len(members) >= int(count) {
		supperRoleCount := 0
		for _, member := range members {
			if member.Role == supperRole.Id {
				supperRoleCount++
			}
		}
		
		if supperRoleCount == int(count) {
			return errors.New("can not delete all team admin")
		}
	}
	
	return m.transaction.Transaction(ctx, func(ctx context.Context) error {
		err = m.roleMemberService.RemoveUserRole(ctx, role.TeamTarget(id), uuids...)
		if err != nil {
			return err
		}
		return m.teamMemberService.RemoveMemberFrom(ctx, id, uuids...)
	})
	
}

func (m *imlTeamModule) Members(ctx context.Context, id string, keyword string) ([]*team_dto.Member, error) {
	_, err := m.teamService.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	users, err := m.userService.Search(ctx, keyword, -1)
	if err != nil {
		return nil, err
	}
	if len(users) == 0 {
		return make([]*team_dto.Member, 0), nil
	}
	userIds := utils.SliceToSlice(users, func(s *user.User) string {
		return s.UID
	})
	members, err := m.teamMemberService.Members(ctx, []string{id}, userIds)
	if err != nil {
		return nil, err
	}
	roleMembers, err := m.roleMemberService.List(ctx, role.TeamTarget(id))
	if err != nil {
		return nil, err
	}
	roleMemberMap := utils.SliceToMapArrayO(roleMembers, func(r *role.Member) (string, string) {
		return r.User, r.Role
	})
	
	out := make([]*team_dto.Member, 0, len(members))
	for _, member := range members {
		out = append(out, team_dto.ToMember(member, roleMemberMap[member.UID]...))
	}
	
	return out, nil
}

func (m *imlTeamModule) SimpleMembers(ctx context.Context, id string, keyword string) ([]*team_dto.SimpleMember, error) {
	if id == "" {
		return nil, fmt.Errorf("team id is empty")
	}
	teamInfo, err := m.teamService.Get(ctx, id)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if teamInfo == nil {
		return nil, fmt.Errorf("team %s not extist", id)
	}
	users, err := m.userService.Search(ctx, keyword, -1)
	if err != nil {
		return nil, err
	}
	userMap := make(map[string]*user.User)
	userIds := make([]string, 0, len(users))
	for _, u := range users {
		userIds = append(userIds, u.UID)
		userMap[u.UID] = u
	}
	teamMembers, err := m.teamMemberService.Members(ctx, []string{id}, userIds)
	if err != nil {
		return nil, err
	}
	departmentMembers, err := m.departmentMemberService.Members(ctx, nil, userIds)
	if err != nil {
		return nil, err
	}
	departmentMemberMap := make(map[string][]string)
	for _, member := range departmentMembers {
		if _, ok := departmentMemberMap[member.UID]; !ok {
			departmentMemberMap[member.UID] = make([]string, 0)
		}
		departmentMemberMap[member.UID] = append(departmentMemberMap[member.UID], member.Come)
	}
	
	out := make([]*team_dto.SimpleMember, 0, len(teamMembers))
	for _, member := range teamMembers {
		u, ok := userMap[member.UID]
		if !ok {
			continue
		}
		
		out = append(out, &team_dto.SimpleMember{
			User:       auto.UUID(u.UID),
			Mail:       u.Email,
			Department: auto.List(departmentMemberMap[member.UID]),
		})
	}
	
	return out, nil
}
