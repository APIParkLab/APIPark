package permit_type

var (
	AnyOne        = Special.Target("any", "所有人")
	All           = Special.Target("all", "所有人")
	TeamMember    = Special.Target("team_member", "团队成员")
	TeamMaster    = Special.Target("team_master", "团队负责人")
	ProjectMember = Special.Target("project_member", "系统成员")
	ProjectMaster = Special.Target("project_master", "系统负责人")
)

var (
	specialRoles = map[string]*Target{
		All.Name:           All,
		AnyOne.Name:        AnyOne,
		TeamMember.Name:    TeamMember,
		TeamMaster.Name:    TeamMaster,
		ProjectMember.Name: ProjectMember,
		ProjectMaster.Name: ProjectMaster,
	}
)
