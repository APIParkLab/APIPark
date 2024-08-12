package team_dto

type CreateTeam struct {
	Id          string `json:"id"`
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Master      string `json:"master"`
}
type EditTeam struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
}
