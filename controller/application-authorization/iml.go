package application_authorization

import (
	application_authorization "github.com/APIParkLab/APIPark/module/application-authorization"
	application_authorization_dto "github.com/APIParkLab/APIPark/module/application-authorization/dto"
	"github.com/gin-gonic/gin"
)

var _ IAuthorizationController = (*imlAuthorizationController)(nil)

type imlAuthorizationController struct {
	module application_authorization.IAuthorizationModule `autowired:""`
}

func (i *imlAuthorizationController) AddAuthorization(ctx *gin.Context, pid string, info *application_authorization_dto.CreateAuthorization) (*application_authorization_dto.Authorization, error) {
	return i.module.AddAuthorization(ctx, pid, info)
}

func (i *imlAuthorizationController) EditAuthorization(ctx *gin.Context, pid string, aid string, info *application_authorization_dto.EditAuthorization) (*application_authorization_dto.Authorization, error) {
	return i.module.EditAuthorization(ctx, pid, aid, info)
}

func (i *imlAuthorizationController) DeleteAuthorization(ctx *gin.Context, pid string, aid string) error {
	return i.module.DeleteAuthorization(ctx, pid, aid)
}

func (i *imlAuthorizationController) Authorizations(ctx *gin.Context, pid string) ([]*application_authorization_dto.AuthorizationItem, error) {
	return i.module.Authorizations(ctx, pid)
}

func (i *imlAuthorizationController) Detail(ctx *gin.Context, pid string, aid string) ([]application_authorization_dto.DetailItem, error) {
	return i.module.Detail(ctx, pid, aid)
}

func (i *imlAuthorizationController) Info(ctx *gin.Context, pid string, aid string) (*application_authorization_dto.Authorization, error) {
	return i.module.Info(ctx, pid, aid)
}
