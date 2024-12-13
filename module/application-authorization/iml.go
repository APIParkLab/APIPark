package application_authorization

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	application_authorization "github.com/APIParkLab/APIPark/service/application-authorization"

	"github.com/eolinker/eosc/log"

	authDriver "github.com/APIParkLab/APIPark/module/application-authorization/auth-driver"

	"github.com/eolinker/go-common/utils"

	"github.com/APIParkLab/APIPark/gateway"

	"github.com/APIParkLab/APIPark/service/cluster"
	"github.com/APIParkLab/APIPark/service/service"

	"github.com/eolinker/go-common/auto"

	"github.com/google/uuid"

	"github.com/eolinker/go-common/store"

	application_authorization_dto "github.com/APIParkLab/APIPark/module/application-authorization/dto"
)

var (
	_ IAuthorizationModule       = (*imlAuthorizationModule)(nil)
	_ IExportAuthorizationModule = (*imlAuthorizationModule)(nil)
)

type imlAuthorizationModule struct {
	serviceService       service.IServiceService                         `autowired:""`
	authorizationService application_authorization.IAuthorizationService `autowired:""`
	clusterService       cluster.IClusterService                         `autowired:""`
	transaction          store.ITransaction                              `autowired:""`
}

func (i *imlAuthorizationModule) ExportAll(ctx context.Context) ([]*application_authorization_dto.ExportAuthorization, error) {
	list, err := i.authorizationService.List(ctx)
	if err != nil {
		return nil, err
	}

	return utils.SliceToSlice(list, func(a *application_authorization.Authorization) *application_authorization_dto.ExportAuthorization {
		cfg := make(map[string]interface{})
		json.Unmarshal([]byte(a.Config), &cfg)
		return &application_authorization_dto.ExportAuthorization{
			Application:    a.Application,
			UUID:           a.UUID,
			Name:           a.Name,
			Driver:         a.Type,
			Position:       a.Position,
			TokenName:      a.TokenName,
			Config:         cfg,
			ExpireTime:     a.ExpireTime,
			HideCredential: a.HideCredential,
		}
	}), nil
}

func (i *imlAuthorizationModule) getApplications(ctx context.Context, appIds []string, appMap map[string]*service.Service) ([]*gateway.ApplicationRelease, error) {
	authorizations, err := i.authorizationService.ListByApp(ctx, appIds...)
	if err != nil {
		return nil, err
	}
	authMap := utils.SliceToMapArray(authorizations, func(a *application_authorization.Authorization) string {
		return a.Application
	})
	return utils.SliceToSlice(appIds, func(id string) *gateway.ApplicationRelease {
		auths := authMap[id]
		description := ""
		info, ok := appMap[id]
		if ok {
			description = info.Description
		}
		return &gateway.ApplicationRelease{
			BasicItem: &gateway.BasicItem{
				ID:          id,
				Description: description,
				Version:     time.Now().Format("20060102150405"),
				MatchLabels: map[string]string{
					"service": id,
				},
			},

			Authorizations: utils.SliceToSlice(auths, func(a *application_authorization.Authorization) *gateway.Authorization {
				authCfg := make(map[string]interface{})
				_ = json.Unmarshal([]byte(a.Config), &authCfg)
				return &gateway.Authorization{
					Type:           a.Type,
					Position:       a.Position,
					TokenName:      a.TokenName,
					Expire:         a.ExpireTime,
					Config:         authCfg,
					HideCredential: a.HideCredential,
					Label: map[string]string{
						"authorization": a.UUID,
					},
				}
			}),
		}
	}), nil
}

func (i *imlAuthorizationModule) initGateway(ctx context.Context, partitionId string, clientDriver gateway.IClientDriver) error {
	services, err := i.serviceService.List(ctx)
	if err != nil {
		return err
	}
	serviceIds := make([]string, 0, len(services))
	serviceMap := make(map[string]*service.Service)
	for _, p := range services {
		serviceIds = append(serviceIds, p.Id)
		serviceMap[p.Id] = p
	}

	applications, err := i.getApplications(ctx, serviceIds, serviceMap)
	if err != nil {
		return err
	}
	return clientDriver.Application().Online(ctx, applications...)
}

func (i *imlAuthorizationModule) online(ctx context.Context, s *service.Service) error {

	clusters, err := i.clusterService.List(ctx)
	if err != nil {
		return err
	}
	authorizations, err := i.authorizationService.ListByApp(ctx, s.Id)
	if err != nil {
		return err
	}
	app := &gateway.ApplicationRelease{
		BasicItem: &gateway.BasicItem{
			ID:          s.Id,
			Description: s.Description,
			Version:     time.Now().Format("20060102150405"),
			MatchLabels: map[string]string{
				"service": s.Id,
			},
		},
		Authorizations: utils.SliceToSlice(authorizations, func(a *application_authorization.Authorization) *gateway.Authorization {
			authCfg := make(map[string]interface{})
			_ = json.Unmarshal([]byte(a.Config), &authCfg)
			return &gateway.Authorization{
				Type:           a.Type,
				Position:       a.Position,
				TokenName:      a.TokenName,
				Expire:         a.ExpireTime,
				Config:         authCfg,
				HideCredential: a.HideCredential,
				Label: map[string]string{
					"authorization": a.UUID,
				},
			}
		}),
	}

	for _, c := range clusters {
		err := i.doOnline(ctx, c.Uuid, app)
		if err != nil {
			log.Warnf("service authorization online for cluster[%s] %v", c.Name, err)
		}
	}
	return nil
}
func (i *imlAuthorizationModule) doOnline(ctx context.Context, clusterId string, app *gateway.ApplicationRelease) error {
	client, err := i.clusterService.GatewayClient(ctx, clusterId)
	if err != nil {
		return err
	}
	defer func() {
		_ = client.Close(ctx)
	}()
	return client.Application().Online(ctx, app)

}
func (i *imlAuthorizationModule) AddAuthorization(ctx context.Context, appId string, info *application_authorization_dto.CreateAuthorization) (*application_authorization_dto.Authorization, error) {
	authFactory, has := authDriver.GetAuthFactory(info.Driver)
	if !has {
		return nil, fmt.Errorf("unknown driver %s", info.Driver)
	}
	auth, err := authFactory.Create(info.Config)
	if err != nil {
		return nil, err
	}
	cfg, err := auth.AuthConfig().Valid()
	if err != nil {
		return nil, err
	}

	s, err := i.serviceService.Get(ctx, appId)
	if err != nil {
		return nil, err
	}

	if info.UUID == "" {
		info.UUID = uuid.New().String()
	}

	// 缺少配置查重操作
	err = i.transaction.Transaction(ctx, func(ctx context.Context) error {
		err = i.authorizationService.Create(ctx, &application_authorization.Create{
			UUID:           info.UUID,
			Application:    appId,
			Name:           info.Name,
			Type:           info.Driver,
			Position:       info.Position,
			TokenName:      info.TokenName,
			Config:         string(cfg),
			ExpireTime:     info.ExpireTime,
			HideCredential: info.HideCredential,
			AuthID:         auth.GenerateID(info.Position, info.TokenName),
		})
		if err != nil {
			return err
		}

		return i.online(ctx, s)
	})
	if err != nil {
		return nil, err
	}

	return i.Info(ctx, appId, info.UUID)
}

func (i *imlAuthorizationModule) EditAuthorization(ctx context.Context, appId string, aid string, info *application_authorization_dto.EditAuthorization) (*application_authorization_dto.Authorization, error) {
	authInfo, err := i.authorizationService.Get(ctx, aid)
	if err != nil {
		return nil, err
	}
	authFactory, has := authDriver.GetAuthFactory(authInfo.Type)
	if !has {
		return nil, fmt.Errorf("unknown driver %s", authInfo.Type)
	}
	auth, err := authFactory.Create(info.Config)
	if err != nil {
		return nil, err
	}
	cfg, err := auth.AuthConfig().Valid()
	if err != nil {
		return nil, err
	}

	appInfo, err := i.serviceService.Get(ctx, appId)
	if err != nil {
		return nil, err
	}

	err = i.transaction.Transaction(ctx, func(ctx context.Context) error {
		authId := auth.GenerateID(authInfo.Position, authInfo.TokenName)
		cfgStr := string(cfg)
		err = i.authorizationService.Save(ctx, aid, &application_authorization.Edit{
			Name:           info.Name,
			Position:       info.Position,
			TokenName:      info.TokenName,
			ExpireTime:     info.ExpireTime,
			HideCredential: info.HideCredential,
			AuthID:         &authId,
			Config:         &cfgStr,
		})
		if err != nil {
			return err
		}
		return i.online(ctx, appInfo)
	})

	if err != nil {
		return nil, err
	}
	return i.Info(ctx, appId, aid)
}

func (i *imlAuthorizationModule) DeleteAuthorization(ctx context.Context, pid string, aid string) error {
	_, err := i.serviceService.Get(ctx, pid)
	if err != nil {
		return err
	}

	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		err = i.authorizationService.Delete(ctx, aid)
		if err != nil {
			return err
		}
		clusters, err := i.clusterService.List(ctx)
		if err != nil {
			return err
		}
		app := &gateway.ApplicationRelease{
			BasicItem: &gateway.BasicItem{
				ID: pid,
			},
		}
		for _, c := range clusters {
			err := i.doOffline(ctx, c.Uuid, app)
			if err != nil {
				log.Warnf("service authorization offline for cluster[%s] %v", c.Name, err)
			}
		}
		return nil
	})
}
func (i *imlAuthorizationModule) doOffline(ctx context.Context, clusterId string, app *gateway.ApplicationRelease) error {
	client, err := i.clusterService.GatewayClient(ctx, clusterId)
	if err != nil {
		return err
	}
	defer func() {
		_ = client.Close(ctx)
	}()
	return client.Application().Offline(ctx, app)

}
func (i *imlAuthorizationModule) Authorizations(ctx context.Context, pid string) ([]*application_authorization_dto.AuthorizationItem, error) {
	_, err := i.serviceService.Get(ctx, pid)
	if err != nil {
		return nil, err
	}
	authorizations, err := i.authorizationService.ListByApp(ctx, pid)
	if err != nil {
		return nil, err
	}
	result := make([]*application_authorization_dto.AuthorizationItem, 0, len(authorizations))
	for _, a := range authorizations {
		result = append(result, &application_authorization_dto.AuthorizationItem{
			Id:             a.UUID,
			Name:           a.Name,
			Driver:         a.Type,
			ExpireTime:     a.ExpireTime,
			Position:       a.Position,
			TokenName:      a.TokenName,
			Creator:        auto.UUID(a.Creator),
			Updater:        auto.UUID(a.Updater),
			CreateTime:     auto.TimeLabel(a.CreateTime),
			UpdateTime:     auto.TimeLabel(a.UpdateTime),
			HideCredential: a.HideCredential,
		})
	}
	return result, nil
}

func (i *imlAuthorizationModule) Detail(ctx context.Context, pid string, aid string) ([]application_authorization_dto.DetailItem, error) {
	_, err := i.serviceService.Get(ctx, pid)
	if err != nil {
		return nil, err
	}
	authInfo, err := i.authorizationService.Get(ctx, aid)
	if err != nil {
		return nil, err
	}
	authFactory, has := authDriver.GetAuthFactory(authInfo.Type)
	if !has {
		return nil, errors.New("unknown driver")
	}
	auth, err := authFactory.Create(authInfo.Config)
	if err != nil {
		return nil, err
	}
	cfgItems := auth.AuthConfig().Detail()
	details := make([]application_authorization_dto.DetailItem, 0, 6+len(cfgItems))
	details = append(details, application_authorization_dto.DetailItem{Key: "名称", Value: authInfo.Name})
	details = append(details, application_authorization_dto.DetailItem{Key: "鉴权类型", Value: authInfo.Type})
	details = append(details, application_authorization_dto.DetailItem{Key: "参数位置", Value: authInfo.Position})
	details = append(details, application_authorization_dto.DetailItem{Key: "参数名", Value: authInfo.TokenName})
	details = append(details, cfgItems...)
	dateStr := "永久"
	if authInfo.ExpireTime != 0 {
		dateStr = time.Unix(authInfo.ExpireTime, 0).Format("2006-01-02")
	}
	details = append(details, application_authorization_dto.DetailItem{Key: "过期日期", Value: dateStr})
	hideAuthStr := "是"
	if !authInfo.HideCredential {
		hideAuthStr = "否"
	}
	details = append(details, application_authorization_dto.DetailItem{Key: "隐藏鉴权信息", Value: hideAuthStr})

	return details, nil
}

func (i *imlAuthorizationModule) Info(ctx context.Context, pid string, aid string) (*application_authorization_dto.Authorization, error) {
	_, err := i.serviceService.Get(ctx, pid)
	if err != nil {
		return nil, err
	}
	auth, err := i.authorizationService.Get(ctx, aid)
	if err != nil {
		return nil, err
	}
	var cfg map[string]interface{}
	if auth.Config != "" {
		_ = json.Unmarshal([]byte(auth.Config), &cfg)
	}

	return &application_authorization_dto.Authorization{
		UUID:           auth.UUID,
		Name:           auth.Name,
		Driver:         auth.Type,
		Position:       auth.Position,
		TokenName:      auth.TokenName,
		ExpireTime:     auth.ExpireTime,
		HideCredential: auth.HideCredential,
		Config:         cfg,
	}, nil
}
