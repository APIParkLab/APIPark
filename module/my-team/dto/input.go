package team_dto

type EditTeam struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	Master      *string `json:"master" aocheck:"user"`
}

type UserIDs struct {
	Users []string `json:"users"`
}

type UpdateMemberRole struct {
	Roles []string `json:"roles" aocheck:"role"`
	Users []string `json:"users" aocheck:"user"`
}
