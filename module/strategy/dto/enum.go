package strategy_dto

const (
	ScopeSystem  = "system"
	ScopeTeam    = "team"
	ScopeService = "service"

	PublishStatusOnline  = "online"
	PublishStatusOffline = "offline"
	PublishStatusUpdate  = "update"
	PublishStatusDelete  = "delete"
)

type Scope int

func (s Scope) String() string {
	switch s {
	case 0:
		return ScopeSystem
	case 1:
		return ScopeTeam
	case 2:
		return ScopeService
	default:
		return ScopeSystem
	}
}

func (s Scope) Int() int {
	return int(s)
}

func ToScope(s string) Scope {
	switch s {
	case ScopeSystem:
		return 0
	case ScopeTeam:
		return 1
	case ScopeService:
		return 2
	default:
		return 0
	}
}
