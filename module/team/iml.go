package team

import (
	"context"
	"fmt"
	"github.com/eolinker/go-common/utils"

	"github.com/eolinker/ap-account/service/role"

	"github.com/eolinker/go-common/store"

	"github.com/eolinker/ap-account/service/user"

	"github.com/APIParkLab/APIPark/service/service"
	team_member "github.com/APIParkLab/APIPark/service/team-member"

	"github.com/google/uuid"

	team_dto "github.com/APIParkLab/APIPark/module/team/dto"
	"github.com/APIParkLab/APIPark/service/team"
)

var (
	_ ITeamModule       = (*imlTeamModule)(nil)
	_ ITeamExportModule = (*imlTeamModule)(nil)
)

type imlTeamModule struct {
	service           team.ITeamService              `autowired:""`
	memberService     team_member.ITeamMemberService `autowired:""`
	userService       user.IUserService              `autowired:""`
	serviceService    service.IServiceService        `autowired:""`
	roleService       role.IRoleService              `autowired:""`
	roleMemberService role.IRoleMemberService        `autowired:""`
	transaction       store.ITransaction             `autowired:""`
}

func (m *imlTeamModule) ExportAll(ctx context.Context) ([]*team_dto.ExportTeam, error) {
	teams, err := m.service.List(ctx)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(teams, func(t *team.Team) *team_dto.ExportTeam {
		return &team_dto.ExportTeam{
			Id:          t.Id,
			Name:        t.Name,
			Description: t.Description,
		}
	}), nil
}

func (m *imlTeamModule) GetTeam(ctx context.Context, id string) (*team_dto.Team, error) {
	tv, err := m.service.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	serviceCountMap, err := m.serviceService.ServiceCountByTeam(ctx, id)
	if err != nil {
		return nil, err
	}
	appCountMap, err := m.serviceService.ServiceCountByTeam(ctx, id)
	if err != nil {
		return nil, err
	}

	return team_dto.ToTeam(tv, serviceCountMap[id], appCountMap[id]), nil

}

func (m *imlTeamModule) Search(ctx context.Context, keyword string) ([]*team_dto.Item, error) {
	list, err := m.service.Search(ctx, keyword, nil)
	if err != nil {
		return nil, err
	}

	serviceCountMap, err := m.serviceService.ServiceCountByTeam(ctx)
	if err != nil {
		return nil, err
	}
	appCountMap, err := m.serviceService.AppCountByTeam(ctx)
	if err != nil {
		return nil, err
	}
	outList := make([]*team_dto.Item, 0, len(list))
	for _, v := range list {
		outList = append(outList, team_dto.ToItem(v, serviceCountMap[v.Id], appCountMap[v.Id]))
	}
	return outList, nil
}

func (m *imlTeamModule) Create(ctx context.Context, input *team_dto.CreateTeam) (*team_dto.Team, error) {
	if input.Id == "" {
		input.Id = uuid.New().String()
	}

	err := m.transaction.Transaction(ctx, func(ctx context.Context) error {
		if input.Master == "" {
			input.Master = utils.UserId(ctx)
		}
		err := m.service.Create(ctx, &team.CreateTeam{
			Id:          input.Id,
			Name:        input.Name,
			Description: input.Description,
		})
		if err != nil {
			return err
		}

		err = m.memberService.AddMemberTo(ctx, input.Id, input.Master)
		if err != nil {
			return err
		}
		supperRole, err := m.roleService.GetSupperRole(ctx, role.GroupTeam)
		if err != nil {
			return err
		}

		return m.roleMemberService.Add(ctx, &role.AddMember{
			Role:   supperRole.Id,
			User:   input.Master,
			Target: role.TeamTarget(input.Id),
		})
	})
	if err != nil {
		return nil, err
	}
	return m.GetTeam(ctx, input.Id)
}

func (m *imlTeamModule) Edit(ctx context.Context, id string, input *team_dto.EditTeam) (*team_dto.Team, error) {
	err := m.transaction.Transaction(ctx, func(ctx context.Context) error {
		return m.service.Save(ctx, id, &team.EditTeam{
			Name:        input.Name,
			Description: input.Description,
		})
	})

	if err != nil {
		return nil, err
	}
	return m.GetTeam(ctx, id)
}

func (m *imlTeamModule) Delete(ctx context.Context, id string) error {
	err := m.transaction.Transaction(ctx, func(ctx context.Context) error {
		count, err := m.serviceService.Count(ctx, "", map[string]interface{}{
			"team": id,
		})
		if err != nil {
			return err
		}
		if count != 0 {
			return fmt.Errorf("team has projects,cannot delete")
		}
		err = m.service.Delete(ctx, id)
		if err != nil {
			return err
		}
		return nil
	})
	return err
}
