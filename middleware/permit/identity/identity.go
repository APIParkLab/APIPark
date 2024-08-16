package permit_identity

import (
	"context"
)

const (
	SystemGroup = "system"
	TeamGroup   = "team"
)

type IdentityTeamService interface {
	IdentifyTeam(ctx context.Context, team string, uid string) ([]string, error)
}

//	type IdentityProjectService interface {
//		IdentifyProject(ctx context.Context, project string, uid string) ([]string, error)
//	}
type IdentitySystemService interface {
	IdentifySystem(ctx context.Context, uid string) ([]string, error)
}
