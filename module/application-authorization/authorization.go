package application_authorization

import (
	"context"
	"github.com/APIParkLab/APIPark/module/system"
	"reflect"

	application_authorization_dto "github.com/APIParkLab/APIPark/module/application-authorization/dto"

	"github.com/APIParkLab/APIPark/gateway"

	"github.com/eolinker/go-common/autowire"

	_ "github.com/APIParkLab/APIPark/module/application-authorization/auth-driver/aksk"
	_ "github.com/APIParkLab/APIPark/module/application-authorization/auth-driver/apikey"
	_ "github.com/APIParkLab/APIPark/module/application-authorization/auth-driver/basic"
	_ "github.com/APIParkLab/APIPark/module/application-authorization/auth-driver/jwt"
	_ "github.com/APIParkLab/APIPark/module/application-authorization/auth-driver/oauth2"
)

type IAuthorizationModule interface {
	// AddAuthorization 添加项目鉴权信息
	AddAuthorization(ctx context.Context, appId string, info *application_authorization_dto.CreateAuthorization) (*application_authorization_dto.Authorization, error)
	// EditAuthorization 修改项目鉴权信息
	EditAuthorization(ctx context.Context, appId string, aid string, info *application_authorization_dto.EditAuthorization) (*application_authorization_dto.Authorization, error)
	// DeleteAuthorization 删除项目鉴权
	DeleteAuthorization(ctx context.Context, appId string, aid string) error
	// Authorizations 获取项目鉴权列表
	Authorizations(ctx context.Context, appId string) ([]*application_authorization_dto.AuthorizationItem, error)
	// Detail 获取项目鉴权详情（弹窗用）
	Detail(ctx context.Context, appId string, aid string) ([]application_authorization_dto.DetailItem, error)
	// Info 获取项目鉴权详情
	Info(ctx context.Context, appId string, aid string) (*application_authorization_dto.Authorization, error)
	//ExportAll(ctx context.Context) ([]*application_authorization_dto.ExportAuthorization, error)
}

type IExportAuthorizationModule interface {
	system.IExportModule[application_authorization_dto.ExportAuthorization]
}

func init() {
	authModule := new(imlAuthorizationModule)
	autowire.Auto[IAuthorizationModule](func() reflect.Value {
		gateway.RegisterInitHandleFunc(authModule.initGateway)
		return reflect.ValueOf(authModule)
	})

	autowire.Auto[IExportAuthorizationModule](func() reflect.Value {
		return reflect.ValueOf(authModule)
	})
}
