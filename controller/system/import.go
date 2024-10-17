package system

import (
	"context"
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	application_authorization "github.com/APIParkLab/APIPark/module/application-authorization"
	application_authorization_dto "github.com/APIParkLab/APIPark/module/application-authorization/dto"
	"github.com/APIParkLab/APIPark/module/catalogue"
	catalogue_dto "github.com/APIParkLab/APIPark/module/catalogue/dto"
	"github.com/APIParkLab/APIPark/module/publish"
	"github.com/APIParkLab/APIPark/module/publish/dto"
	"github.com/APIParkLab/APIPark/module/release"
	dto2 "github.com/APIParkLab/APIPark/module/release/dto"
	"github.com/APIParkLab/APIPark/module/router"
	router_dto "github.com/APIParkLab/APIPark/module/router/dto"
	"github.com/APIParkLab/APIPark/module/service"
	service_dto "github.com/APIParkLab/APIPark/module/service/dto"
	"github.com/APIParkLab/APIPark/module/subscribe"
	subscribe_dto "github.com/APIParkLab/APIPark/module/subscribe/dto"
	"github.com/APIParkLab/APIPark/module/team"
	team_dto "github.com/APIParkLab/APIPark/module/team/dto"
	"github.com/APIParkLab/APIPark/module/upstream"
	upstream_dto "github.com/APIParkLab/APIPark/module/upstream/dto"
	"github.com/eolinker/go-common/store"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var (
	//go:embed config/*.json
	importConfigs embed.FS
)

func unmarshal[T any](name string) ([]*T, error) {
	data, err := importConfigs.ReadFile(fmt.Sprintf("config/%s.json", name))
	if err != nil {
		return nil, fmt.Errorf("fail to read file(%s): %v", name, err)
	}
	t := make([]*T, 0)
	err = json.Unmarshal(data, &t)
	return t, err
}

var (
	_ IImportConfigController = (*imlImportConfigController)(nil)
)

type imlImportConfigController struct {
	teamModule                     team.ITeamModule                               `autowired:""`
	serviceModule                  service.IServiceModule                         `autowired:""`
	appModule                      service.IAppModule                             `autowired:""`
	apiModule                      router.IRouterModule                           `autowired:""`
	upstreamModule                 upstream.IUpstreamModule                       `autowired:""`
	applicationAuthorizationModule application_authorization.IAuthorizationModule `autowired:""`
	catalogueModule                catalogue.ICatalogueModule                     `autowired:""`
	subscribeModule                subscribe.ISubscribeModule                     `autowired:""`
	applyModule                    subscribe.ISubscribeApprovalModule             `autowired:""`
	publishModule                  publish.IPublishModule                         `autowired:""`
	releaseModule                  release.IReleaseModule                         `autowired:""`
	transaction                    store.ITransaction                             `autowired:""`
}

func (i *imlImportConfigController) ImportAll(ctx *gin.Context) error {
	return i.transaction.Transaction(ctx, func(transCtx context.Context) error {
		err := i.importTeams(transCtx)
		if err != nil {
			return err
		}

		err = i.importCatalogues(transCtx)
		if err != nil {
			return err
		}

		err = i.importServices(transCtx)
		if err != nil {
			return err
		}

		err = i.importApplications(transCtx)
		if err != nil {
			return err
		}

		err = i.importApplicationAuth(transCtx)
		if err != nil {
			return err
		}

		err = i.importApis(transCtx)
		if err != nil {
			return err
		}

		err = i.importUpstreams(transCtx)
		if err != nil {
			return err
		}

		err = i.publish(transCtx)
		if err != nil {
			return err
		}

		err = i.importSubscribers(transCtx)
		if err != nil {
			return err
		}

		return nil
	})

}

func (i *imlImportConfigController) importTeams(ctx context.Context) error {
	data, err := unmarshal[team_dto.ExportTeam]("team")
	if err != nil {
		return err
	}
	for _, d := range data {
		// 判断是否存在，如果存在，则更新
		_, err = i.teamModule.GetTeam(ctx, d.Id)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
			_, err = i.teamModule.Create(ctx, &team_dto.CreateTeam{
				Id:          d.Id,
				Name:        d.Name,
				Description: d.Description,
			})
			if err != nil {
				return fmt.Errorf("create team(%s) error: %v", d.Id, err)
			}
			continue
		}
		_, err = i.teamModule.Edit(ctx, d.Id, &team_dto.EditTeam{
			Name:        &d.Name,
			Description: &d.Description,
		})
		if err != nil {
			return fmt.Errorf("update team(%s) error: %v", d.Id, err)
		}
	}
	return nil
}

func (i *imlImportConfigController) importServices(ctx context.Context) error {
	data, err := unmarshal[service_dto.ExportService]("service")
	if err != nil {
		return err
	}
	for _, d := range data {
		// 判断是否存在，如果存在，则更新
		_, err = i.serviceModule.Get(ctx, d.Id)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
			_, err = i.serviceModule.Create(ctx, d.Team, &service_dto.CreateService{
				Id:          d.Id,
				Name:        d.Name,
				Prefix:      d.Prefix,
				Description: d.Description,
				ServiceType: d.ServiceType,
				Logo:        d.Logo,
				Tags:        d.Tags,
				Catalogue:   d.Catalogue,
			})
			if err != nil {
				return fmt.Errorf("create service(%s) error: %v", d.Id, err)
			}
		} else {
			_, err = i.serviceModule.Edit(ctx, d.Id, &service_dto.EditService{
				Name:        &d.Name,
				Description: &d.Description,
				ServiceType: &d.ServiceType,
				Catalogue:   &d.Catalogue,
				Logo:        &d.Logo,
				Tags:        &d.Tags,
			})
			if err != nil {
				return fmt.Errorf("update service(%s) error: %v", d.Id, err)
			}
		}

		//err = i.serviceModule.SaveServiceDoc(ctx, d.Id, &service_dto.SaveServiceDoc{Doc: d.Doc})
		//if err != nil {
		//	return fmt.Errorf("save service(%s) doc error: %v", d.Id, err)
		//}
	}
	return nil
}

func (i *imlImportConfigController) importApplications(ctx context.Context) error {
	data, err := unmarshal[service_dto.ExportApp]("app")
	if err != nil {
		return err
	}
	for _, d := range data {
		// 判断是否存在，如果存在，则更新
		_, err = i.appModule.GetApp(ctx, d.Id)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
			_, err = i.appModule.CreateApp(ctx, d.Team, &service_dto.CreateApp{
				Id:          d.Id,
				Name:        d.Name,
				Description: d.Description,
			})
			if err != nil {
				return fmt.Errorf("create app(%s) error: %v", d.Id, err)
			}

			continue
		}
		_, err = i.appModule.UpdateApp(ctx, d.Id, &service_dto.UpdateApp{
			Name:        &d.Name,
			Description: &d.Description,
		})
		if err != nil {
			return fmt.Errorf("update app(%s) error: %v", d.Id, err)
		}

	}
	return nil
}

func (i *imlImportConfigController) importApis(ctx context.Context) error {
	data, err := unmarshal[router_dto.Export]("api")
	if err != nil {
		return err
	}
	for _, d := range data {
		var proxy *router_dto.InputProxy
		if d.Proxy != nil {
			proxy = &router_dto.InputProxy{
				Path:    d.Proxy.Path,
				Timeout: d.Proxy.Timeout,
				Retry:   d.Proxy.Retry,
				Headers: d.Proxy.Headers,
				Extends: d.Proxy.Extends,
				Plugins: d.Proxy.Plugins,
			}
		}
		// 判断是否存在，如果存在，则更新
		_, err = i.apiModule.Detail(ctx, d.Service, d.Id)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
			_, err = i.apiModule.Create(ctx, d.Service, &router_dto.Create{
				Id:          d.Id,
				Path:        d.Path,
				Methods:     d.Method,
				Description: d.Description,
				MatchRules:  d.MatchRules,
				Proxy:       proxy,
			})
			if err != nil {
				return fmt.Errorf("create api(%s) error: %v", d.Id, err)
			}

			continue
		}
		info := &router_dto.Edit{

			Proxy: proxy,
			//Doc:   &d.Doc,
		}

		_, err = i.apiModule.Edit(ctx, d.Service, d.Id, info)
		if err != nil {
			return fmt.Errorf("update api(%s) error: %v", d.Id, err)
		}

	}
	return nil
}

func (i *imlImportConfigController) importCatalogues(ctx context.Context) error {
	data, err := unmarshal[catalogue_dto.ExportCatalogue]("catalogue")
	if err != nil {
		return err
	}
	for _, d := range data {
		_, err = i.catalogueModule.Get(ctx, d.Id)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
			err = i.catalogueModule.Create(ctx, &catalogue_dto.CreateCatalogue{
				Id:     d.Id,
				Name:   d.Name,
				Parent: &d.Parent,
				Sort:   &d.Sort,
			})
			if err != nil {
				return fmt.Errorf("create catalogue(%s) error: %v", d.Id, err)
			}
			continue
		}
		err = i.catalogueModule.Edit(ctx, d.Id, &catalogue_dto.EditCatalogue{
			Name:   &d.Name,
			Parent: &d.Parent,
			Sort:   &d.Sort,
		})
		if err != nil {
			return fmt.Errorf("update catalogue(%s) error: %v", d.Id, err)
		}

	}
	return nil
}

func (i *imlImportConfigController) importUpstreams(ctx context.Context) error {
	data, err := unmarshal[upstream_dto.ExportUpstream]("upstream")
	if err != nil {
		return err
	}
	for _, d := range data {
		_, err = i.upstreamModule.Save(ctx, d.Service, d.Upstream)
		if err != nil {
			return fmt.Errorf("update upstream(%s) error: %v", d.Service, err)
		}
	}
	return nil
}

func (i *imlImportConfigController) importApplicationAuth(ctx context.Context) error {
	data, err := unmarshal[application_authorization_dto.ExportAuthorization]("authorization")
	if err != nil {
		return err
	}
	for _, d := range data {
		_, err := i.applicationAuthorizationModule.Info(ctx, d.Application, d.UUID)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
			_, err = i.applicationAuthorizationModule.AddAuthorization(ctx, d.Application, &application_authorization_dto.CreateAuthorization{
				UUID:           d.UUID,
				Name:           d.Name,
				Driver:         d.Driver,
				Position:       d.Position,
				TokenName:      d.TokenName,
				ExpireTime:     d.ExpireTime,
				Config:         d.Config,
				HideCredential: d.HideCredential,
			})
			if err != nil {
				return fmt.Errorf("create authorization(%s) error: %v", d.UUID, err)
			}

			continue
		}
		_, err = i.applicationAuthorizationModule.EditAuthorization(ctx, d.Application, d.UUID, &application_authorization_dto.EditAuthorization{
			Name:           &d.Name,
			Position:       &d.Position,
			TokenName:      &d.TokenName,
			ExpireTime:     &d.ExpireTime,
			Config:         &d.Config,
			HideCredential: &d.HideCredential,
		})
		if err != nil {
			return fmt.Errorf("update authorization(%s) error: %v", d.UUID, err)
		}

	}
	return nil
}

func (i *imlImportConfigController) publish(ctx context.Context) error {
	data, err := unmarshal[service_dto.ExportService]("service")
	if err != nil {
		return err
	}
	for _, d := range data {
		serviceId := d.Id
		newReleaseId, err := i.releaseModule.Create(ctx, serviceId, &dto2.CreateInput{
			Version: "v1",
			Remark:  "demo release",
		})
		if err != nil {
			continue
		}
		apply, err := i.publishModule.Apply(ctx, serviceId, &dto.ApplyInput{
			Release: newReleaseId,
			Remark:  "发布申请",
		})
		if err != nil {
			return err
		}
		err = i.publishModule.Accept(ctx, serviceId, apply.Id, "")
		if err != nil {
			i.releaseModule.Delete(ctx, serviceId, newReleaseId)
			return err
		}
		err = i.publishModule.Publish(ctx, serviceId, apply.Id)
		if err != nil {
			i.releaseModule.Delete(ctx, serviceId, newReleaseId)
			return err
		}
		err = i.publishModule.Publish(ctx, serviceId, apply.Id)
		if err != nil {
			i.releaseModule.Delete(ctx, serviceId, newReleaseId)
			return err
		}
	}
	return nil
}

func (i *imlImportConfigController) importSubscribers(ctx context.Context) error {

	applyData, err := unmarshal[subscribe_dto.ExportApproval]("apply")
	if err != nil {
		return err
	}
	for _, d := range applyData {
		err = i.catalogueModule.Subscribe(ctx, &catalogue_dto.SubscribeService{
			Service: d.Service,
			Applications: []string{
				d.Application,
			},
			Reason: d.Reason,
		})
		if err != nil {
			return fmt.Errorf("application(%s) subscribe service(%s) error: %v", d.Application, d.Service, err)
		}
	}
	data, err := unmarshal[subscribe_dto.ExportSubscriber]("subscribe")
	if err != nil {
		return err
	}
	for _, d := range data {
		err = i.subscribeModule.ExistSubscriber(ctx, d.Service, d.Subscriber)
		if err == nil {
			continue
		}
		err = i.subscribeModule.AddSubscriber(ctx, d.Service, &subscribe_dto.AddSubscriber{
			Application: d.Subscriber,
		})
		if err != nil {
			return fmt.Errorf("update subscriber(%s) error: %v", d.Id, err)
		}

	}

	return nil
}
