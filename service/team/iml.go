package team

import (
	"context"
	"time"
	
	"github.com/eolinker/go-common/utils"
	
	"github.com/eolinker/go-common/auto"
	
	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/APIParkLab/APIPark/stores/team"
)

var (
	_ ITeamService = (*imlTeamService)(nil)
)

type imlTeamService struct {
	teamStore team.ITeamStore `autowired:""`
	universally.IServiceGet[Team]
	universally.IServiceDelete
	universally.IServiceCreate[CreateTeam]
	universally.IServiceEdit[EditTeam]
}

func (s *imlTeamService) OnComplete() {
	s.IServiceGet = universally.NewGetSoftDelete[Team, team.Team](s.teamStore, FromEntity)
	
	s.IServiceDelete = universally.NewSoftDelete[team.Team](s.teamStore)
	
	s.IServiceCreate = universally.NewCreatorSoftDelete[CreateTeam, team.Team](s.teamStore, "team", createEntityHandler, uniquestHandler, labelHandler)
	
	s.IServiceEdit = universally.NewEdit[EditTeam, team.Team](s.teamStore, updateHandler, labelHandler)
	auto.RegisterService("team", s)
}

func (s *imlTeamService) GetLabels(ctx context.Context, ids ...string) map[string]string {
	if len(ids) == 0 {
		return nil
	}
	list, err := s.teamStore.ListQuery(ctx, "`uuid` in (?)", []interface{}{ids}, "id")
	if err != nil {
		return nil
	}
	return utils.SliceToMapO(list, func(i *team.Team) (string, string) {
		return i.UUID, i.Name
	})
}
func labelHandler(e *team.Team) []string {
	return []string{e.Name, e.UUID, e.Description}
}
func uniquestHandler(i *CreateTeam) []map[string]interface{} {
	return []map[string]interface{}{{"uuid": i.Id}, {"name": i.Name}}
}
func createEntityHandler(i *CreateTeam) *team.Team {
	return &team.Team{
		Id:          0,
		UUID:        i.Id,
		Name:        i.Name,
		Description: i.Description,
		CreateAt:    time.Now(),
		UpdateAt:    time.Now(),
	}
}
func updateHandler(e *team.Team, i *EditTeam) {
	if i.Name != nil {
		e.Name = *i.Name
	}
	if i.Description != nil {
		e.Description = *i.Description
	}
	
	e.UpdateAt = time.Now()
}
