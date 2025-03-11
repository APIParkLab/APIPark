package ai_local

import (
	"context"
	"errors"
	"fmt"

	ai_balance "github.com/APIParkLab/APIPark/service/ai-balance"

	"github.com/APIParkLab/APIPark/service/setting"

	"github.com/APIParkLab/APIPark/service/api"

	"github.com/APIParkLab/APIPark/gateway"
	"github.com/eolinker/eosc/log"

	"github.com/APIParkLab/APIPark/service/cluster"

	"github.com/APIParkLab/APIPark/service/service"

	"github.com/eolinker/go-common/auto"

	ai_api "github.com/APIParkLab/APIPark/service/ai-api"

	"github.com/eolinker/go-common/register"
	"github.com/eolinker/go-common/server"

	"github.com/eolinker/go-common/utils"

	"gorm.io/gorm"

	ai_local "github.com/APIParkLab/APIPark/service/ai-local"

	"github.com/eolinker/go-common/store"

	ai_provider_local "github.com/APIParkLab/APIPark/ai-provider/local"
	ai_local_dto "github.com/APIParkLab/APIPark/module/ai-local/dto"
)

var (
	_ ILocalModelModule = (*imlLocalModel)(nil)
)

type imlLocalModel struct {
	localModelService        ai_local.ILocalModelService             `autowired:""`
	localModelPackageService ai_local.ILocalModelPackageService      `autowired:""`
	localModelStateService   ai_local.ILocalModelInstallStateService `autowired:""`
	localModelCacheService   ai_local.ILocalModelCacheService        `autowired:""`
	balanceService           ai_balance.IBalanceService              `autowired:""`
	clusterService           cluster.IClusterService                 `autowired:""`
	aiAPIService             ai_api.IAPIService                      `autowired:""`
	routerService            api.IAPIService                         `autowired:""`
	serviceService           service.IServiceService                 `autowired:""`
	settingService           setting.ISettingService                 `autowired:""`
	transaction              store.ITransaction                      `autowired:""`
}

func (i *imlLocalModel) SyncLocalModels(ctx context.Context, address string) error {
	releases, err := i.getLocalModels(ctx, address)
	if err != nil {
		return err
	}
	return i.syncGateway(ctx, cluster.DefaultClusterID, releases, true)
}

func (i *imlLocalModel) SimpleList(ctx context.Context) ([]*ai_local_dto.SimpleItem, error) {
	list, err := i.localModelService.List(ctx)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, func(s *ai_local.LocalModel) *ai_local_dto.SimpleItem {
		return &ai_local_dto.SimpleItem{
			Id:            s.Id,
			Name:          s.Name,
			DefaultConfig: ai_provider_local.LocalConfig,
			Logo:          ai_provider_local.LocalSvg,
		}
	}, func(l *ai_local.LocalModel) bool {
		if l.State != ai_local_dto.LocalModelStateNormal.Int() && l.State != ai_local_dto.LocalModelStateDisable.Int() {
			return false
		}
		return true
	}), nil
}

func (i *imlLocalModel) ModelState(ctx context.Context, model string) (*ai_local_dto.DeployState, *ai_local_dto.ModelInfo, error) {
	info, err := i.localModelStateService.Get(ctx, model)
	if err != nil {
		return nil, nil, err
	}
	state := ai_local_dto.FromDeployState(info.State)
	return &state, &ai_local_dto.ModelInfo{
		Current:     info.Complete,
		Total:       info.Total,
		LastMessage: info.Msg,
	}, nil
}

func (i *imlLocalModel) Search(ctx context.Context, keyword string) ([]*ai_local_dto.LocalModelItem, error) {
	list, err := i.localModelService.Search(ctx, keyword, nil, "update_at desc")
	if err != nil {
		return nil, err
	}
	apiCountMap, err := i.aiAPIService.CountMapByModel(ctx, "", map[string]interface{}{
		"type": 1,
	})
	if err != nil {
		return nil, err
	}

	return utils.SliceToSlice(list, func(s *ai_local.LocalModel) *ai_local_dto.LocalModelItem {
		count := apiCountMap[s.Id]
		return &ai_local_dto.LocalModelItem{
			Id:         s.Id,
			Name:       s.Name,
			State:      ai_local_dto.FromLocalModelState(s.State),
			APICount:   count,
			CanDelete:  count < 1 && s.State != ai_local_dto.LocalModelStateDeploying.Int(),
			UpdateTime: auto.TimeLabel(s.UpdateAt),
			Provider:   ai_provider_local.ProviderLocal,
		}
	}), nil
}

func (i *imlLocalModel) ListCanInstall(ctx context.Context, keyword string) ([]*ai_local_dto.LocalModelPackageItem, error) {

	if keyword == "" {
		list, err := i.localModelPackageService.Search(ctx, keyword, nil)
		if err != nil {
			return nil, err
		}
		return utils.SliceToSlice(list, func(s *ai_local.LocalModelPackage) *ai_local_dto.LocalModelPackageItem {
			return &ai_local_dto.LocalModelPackageItem{
				Id:        s.Id,
				Name:      s.Name,
				Size:      s.Size,
				IsPopular: s.IsPopular,
			}
		}), nil
	} else {
		info, err := i.localModelPackageService.Get(ctx, keyword)
		if err != nil {
			return nil, err
		}
		result := make([]*ai_local_dto.LocalModelPackageItem, 0)

		//for _, v := range list {
		models := ai_provider_local.ModelsCanInstallById(info.Id)
		for _, model := range models {
			result = append(result, &ai_local_dto.LocalModelPackageItem{
				Id:        model.Id,
				Name:      model.Name,
				Size:      model.Size,
				IsPopular: model.IsPopular,
			})
		}
		//}
		return result, nil
	}

}

func (i *imlLocalModel) pullHook(fn ...func() error) func(msg ai_provider_local.PullMessage) error {
	return func(msg ai_provider_local.PullMessage) error {
		return i.transaction.Transaction(context.Background(), func(ctx context.Context) error {

			state := ai_local_dto.DeployStateFinish.Int()
			modelState := ai_local_dto.LocalModelStateNormal.Int()
			if msg.Status == "error" {
				state = ai_local_dto.DeployStateDownloadError.Int()
				modelState = ai_local_dto.LocalModelStateDeployingError.Int()
			}
			err := i.localModelService.Save(ctx, msg.Model, &ai_local.EditLocalModel{State: &modelState})
			if err != nil {
				return err
			}
			info, err := i.localModelStateService.Get(ctx, msg.Model)
			if err != nil {
				if !errors.Is(err, gorm.ErrRecordNotFound) {
					return err
				}

				err = i.localModelStateService.Create(ctx, &ai_local.CreateLocalModelInstallState{
					Id:       msg.Model,
					Complete: msg.Completed,
					Total:    msg.Total,
					State:    state,
					Msg:      msg.Msg,
				})
				if err != nil {
					return err
				}
				info, err = i.localModelStateService.Get(ctx, msg.Model)
				if err != nil {
					return err
				}

			} else {
				if info.Complete < msg.Completed {
					info.Complete = msg.Completed

				}
				if info.Total < msg.Total {
					info.Total = msg.Total
				}
				if msg.Msg != "" {
					info.Msg = msg.Msg
				}
				err = i.localModelStateService.Save(ctx, msg.Model, &ai_local.EditLocalModelInstallState{State: &state, Complete: &info.Complete, Total: &info.Total, Msg: &info.Msg})
				if err != nil {
					return err
				}
			}

			serviceState := 0
			if msg.Status == "error" {
				state = 2
			}
			list, err := i.localModelCacheService.List(ctx, msg.Model, ai_local.CacheTypeService)
			if err != nil {
				return err
			}
			for _, l := range list {
				serviceInfo, err := i.serviceService.Get(ctx, l.Target)
				if err != nil {
					if errors.Is(err, gorm.ErrRecordNotFound) {
						continue
					}
					return err
				}
				if serviceInfo.State == serviceState {
					continue
				}
				err = i.serviceService.Save(ctx, l.Target, &service.Edit{State: &serviceState})
				if err != nil {
					return err
				}
			}
			if state == ai_local_dto.DeployStateFinish.Int() {
				for _, f := range fn {
					err = f()
					if err != nil {
						return err
					}
				}
				v, _ := i.settingService.Get(ctx, "system.ai_model.ollama_address")

				cfg := make(map[string]interface{})
				cfg["provider"] = "ollama"
				cfg["model"] = msg.Model
				cfg["model_config"] = ai_provider_local.LocalConfig
				cfg["priority"] = 0
				cfg["base"] = v

				return i.syncGateway(ctx, cluster.DefaultClusterID, []*gateway.DynamicRelease{
					{
						BasicItem: &gateway.BasicItem{
							ID:          msg.Model,
							Description: msg.Model,
							Resource:    "ai-provider",
							Version:     info.UpdateAt.Format("20060102150405"),
							MatchLabels: map[string]string{
								"module": "ai-provider",
							},
						},
						Attr: cfg,
					}}, true)
			}
			return nil
		})
	}
}

func (i *imlLocalModel) syncGateway(ctx context.Context, clusterId string, releases []*gateway.DynamicRelease, online bool) error {
	client, err := i.clusterService.GatewayClient(ctx, clusterId)
	if err != nil {
		log.Errorf("get apinto client error: %v", err)
		return nil
	}
	defer func() {
		err := client.Close(ctx)
		if err != nil {
			log.Warn("close apinto client:", err)
		}
	}()
	for _, releaseInfo := range releases {
		dynamicClient, err := client.Dynamic(releaseInfo.Resource)
		if err != nil {
			return err
		}
		if online {
			err = dynamicClient.Online(ctx, releaseInfo)
		} else {
			err = dynamicClient.Offline(ctx, releaseInfo)
		}
		if err != nil {
			return err
		}
	}

	return nil
}

func (i *imlLocalModel) Deploy(ctx context.Context, model string, session string, fn ...func() error) (*ai_provider_local.Pipeline, error) {
	var p *ai_provider_local.Pipeline
	err := i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		item, err := i.localModelCacheService.GetByTarget(ctx, ai_local.CacheTypeService, model)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}

		} else {
			model = item.Model
		}
		info, err := i.localModelService.Get(ctx, model)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
			err = i.localModelService.Create(ctx, &ai_local.CreateLocalModel{
				Id:       model,
				Name:     model,
				Provider: ai_provider_local.ProviderLocal,
				State:    ai_local_dto.LocalModelStateDeploying.Int(),
			})

		} else {
			if info.State == ai_local_dto.LocalModelStateDeployingError.Int() {
				state := ai_local_dto.LocalModelStateDeploying.Int()
				err = i.localModelService.Save(ctx, model, &ai_local.EditLocalModel{State: &state})
			}
		}
		if err != nil {
			return err
		}
		p, err = ai_provider_local.PullModel(model, session, i.pullHook(fn...))
		if err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	return p, nil
}

func (i *imlLocalModel) SaveCache(ctx context.Context, model string, target string) error {
	return i.localModelCacheService.Save(ctx, model, ai_local.CacheTypeService, target)
}

func (i *imlLocalModel) CancelDeploy(ctx context.Context, model string) error {
	return i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		item, err := i.localModelCacheService.GetByTarget(ctx, ai_local.CacheTypeService, model)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}

		} else {
			model = item.Model
		}
		list, err := i.localModelCacheService.List(ctx, model, ai_local.CacheTypeService)
		if err != nil {
			return err
		}
		for _, l := range list {
			info, err := i.serviceService.Get(ctx, l.Target)
			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					continue
				}
				return err
			}
			if info.State == 0 {
				continue
			}
			err = i.serviceService.Delete(ctx, info.Id)
			if err != nil {
				return err
			}
			err = i.aiAPIService.DeleteByService(ctx, info.Id)
			if err != nil {
				return err
			}
			err = i.routerService.DeleteByService(ctx, info.Id)
			if err != nil {
				return err
			}
		}
		err = i.localModelCacheService.Delete(ctx, model)
		if err != nil {
			return err
		}
		// 删除模型
		err = i.localModelService.Delete(ctx, model)
		if err != nil {
			return err
		}
		ai_provider_local.StopPull(model)
		return nil
	})
}

func (i *imlLocalModel) RemoveModel(ctx context.Context, model string) error {
	// 判断是否有api
	count, err := i.aiAPIService.CountByModel(ctx, model)
	if err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("model %s has api, can not remove", model)
	}
	info, err := i.localModelService.Get(ctx, model)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		return ai_provider_local.RemoveModel(model)
	}
	if info.State == ai_local_dto.LocalModelStateDeploying.Int() {
		return fmt.Errorf("model %s is deploying, can not remove", model)
	}
	return i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		err = i.localModelService.Delete(ctx, model)
		if err != nil {
			return err
		}
		return ai_provider_local.RemoveModel(model)
	})

}

func (i *imlLocalModel) Enable(ctx context.Context, model string) error {
	info, err := i.localModelService.Get(ctx, model)
	if err != nil {
		return err
	}
	if info.State == ai_local_dto.LocalModelStateDisable.Int() || info.State == ai_local_dto.LocalModelStateError.Int() {

		return i.transaction.Transaction(ctx, func(ctx context.Context) error {
			status := ai_local_dto.LocalModelStateNormal.Int()
			err = i.localModelService.Save(ctx, model, &ai_local.EditLocalModel{State: &status})
			if err != nil {
				return err
			}
			v, _ := i.settingService.Get(ctx, "system.ai_model.ollama_address")
			cfg := make(map[string]interface{})
			cfg["provider"] = "ollama"
			cfg["model"] = info.Id
			cfg["model_config"] = ai_provider_local.LocalConfig
			cfg["priority"] = 0
			cfg["base"] = v

			return i.syncGateway(ctx, cluster.DefaultClusterID, []*gateway.DynamicRelease{
				{
					BasicItem: &gateway.BasicItem{
						ID:          info.Id,
						Description: info.Id,
						Resource:    "ai-provider",
						Version:     info.UpdateAt.Format("20060102150405"),
						MatchLabels: map[string]string{
							"module": "ai-provider",
						},
					},
					Attr: cfg,
				}}, true)
		})

	}
	return fmt.Errorf("model %s is not disabled state,can not enable", model)
}

func (i *imlLocalModel) Disable(ctx context.Context, model string) error {
	info, err := i.localModelService.Get(ctx, model)
	if err != nil {
		return err
	}
	if info.State == ai_local_dto.LocalModelStateNormal.Int() {
		disable := ai_local_dto.LocalModelStateDisable.Int()
		return i.transaction.Transaction(ctx, func(ctx context.Context) error {
			err = i.localModelService.Save(ctx, model, &ai_local.EditLocalModel{State: &disable})
			if err != nil {
				return err
			}

			return i.syncGateway(ctx, cluster.DefaultClusterID, []*gateway.DynamicRelease{
				{
					BasicItem: &gateway.BasicItem{
						ID:       info.Id,
						Resource: "ai-provider",
					},
				}}, false)
		})

	}
	return fmt.Errorf("model %s is not enabled state,can not disable", model)
}

func (i *imlLocalModel) OnInit() {
	register.Handle(func(v server.Server) {
		ctx := context.Background()

		list, err := i.localModelPackageService.List(ctx)
		if err != nil {
			return
		}
		oldModels := utils.SliceToMapO(list, func(s *ai_local.LocalModelPackage) (string, *ai_local.LocalModelPackage) {
			return s.Id, s
		})
		models, version := ai_provider_local.ModelsCanInstall()
		for _, model := range models {

			if v, ok := oldModels[model.Id]; ok {
				if v.Version == version {
					continue
				}
				err = i.localModelPackageService.Save(ctx, model.Id, &ai_local.EditLocalModelPackage{
					Size:        &model.Size,
					Hash:        &model.Digest,
					Description: &model.Description,
					Version:     &version,
					Popular:     &model.IsPopular,
				})
				if err != nil {
					return
				}
			} else {
				err = i.localModelPackageService.Create(ctx, &ai_local.CreateLocalModelPackage{
					Id:          model.Id,
					Name:        model.Name,
					Size:        model.Size,
					Hash:        model.Digest,
					Description: model.Description,
					Version:     version,
					Popular:     model.IsPopular,
				})
				if err != nil {
					return
				}
			}
			delete(oldModels, model.Id)
		}
		for id := range oldModels {
			err = i.localModelPackageService.Delete(ctx, id)
			if err != nil {
				return
			}
		}
		//installModels, err := ai_provider_local.ModelsInstalled()
		//if err != nil {
		//	return
		//}
		//for _, model := range installModels {
		//
		//	id := strings.TrimSuffix(model.Name, ":latest")
		//	name := strings.TrimSuffix(model.Name, ":latest")
		//	_, err = i.localModelService.Get(ctx, id)
		//	if err != nil {
		//		if !errors.Is(err, gorm.ErrRecordNotFound) {
		//			return
		//		}
		//		err = i.localModelService.Create(ctx, &ai_local.CreateLocalModel{
		//			Id:    id,
		//			Name:  name,
		//			State: 1,
		//		})
		//		if err != nil {
		//			return
		//		}
		//	}
		//}
		i.transaction.Transaction(ctx, func(ctx context.Context) error {
			localModels, err := i.localModelService.Search(ctx, "", map[string]interface{}{
				"provider": "ollama",
			})
			if err != nil {
				return err
			}
			if len(localModels) == 0 {
				return nil
			}
			err = i.localModelService.UpdateProvider(ctx, ai_provider_local.ProviderLocal, utils.SliceToSlice(localModels, func(s *ai_local.LocalModel) string {
				return s.Id
			})...)
			if err != nil {
				return err
			}

			apis, err := i.aiAPIService.Search(ctx, "", map[string]interface{}{
				"provider": "ollama",
			})
			if err != nil {
				return err
			}
			return i.aiAPIService.UpdateAIProvider(ctx, ai_provider_local.ProviderLocal, utils.SliceToSlice(apis, func(s *ai_api.API) string {
				return s.ID
			})...)
		})

	})
}

func (i *imlLocalModel) getLocalModels(ctx context.Context, v string) ([]*gateway.DynamicRelease, error) {
	list, err := i.localModelService.List(ctx)
	if err != nil {
		return nil, err
	}
	if v == "" {
		var has bool
		v, has = i.settingService.Get(ctx, "system.ai_model.ollama_address")
		if !has {
			return nil, errors.New("ollama_address not set")
		}
	}

	releases := make([]*gateway.DynamicRelease, 0, len(list))
	for _, l := range list {
		if l.State != ai_local_dto.LocalModelStateNormal.Int() {
			continue
		}
		cfg := make(map[string]interface{})
		cfg["provider"] = "ollama"
		cfg["model"] = l.Id
		cfg["model_config"] = ai_provider_local.LocalConfig
		cfg["base"] = v
		releases = append(releases, &gateway.DynamicRelease{
			BasicItem: &gateway.BasicItem{
				ID:          l.Id,
				Description: l.Name,
				Resource:    "ai-provider",
				Version:     l.UpdateAt.Format("20060102150405"),
				MatchLabels: map[string]string{
					"module": "ai-provider",
				},
			},
			Attr: cfg,
		})
	}
	return releases, nil
}

func (i *imlLocalModel) initGateway(ctx context.Context, clusterId string, clientDriver gateway.IClientDriver) error {
	releases, err := i.getLocalModels(ctx, "")
	if err != nil {
		return err
	}

	for _, p := range releases {
		client, err := clientDriver.Dynamic(p.Resource)
		if err != nil {
			return err
		}
		err = client.Online(ctx, p)
		if err != nil {
			return err
		}
	}

	return nil
}
