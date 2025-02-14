package ai_local

import (
	"context"
	"errors"
	"fmt"
	"strings"

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
	aiAPIService             ai_api.IAPIService                      `autowired:""`
	transaction              store.ITransaction                      `autowired:""`
}

func (i *imlLocalModel) SimpleList(ctx context.Context) ([]*ai_local_dto.SimpleItem, error) {
	list, err := i.localModelService.List(ctx)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, func(s *ai_local.LocalModel) *ai_local_dto.SimpleItem {
		return &ai_local_dto.SimpleItem{
			Id:   s.Id,
			Name: s.Name,
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
		return &ai_local_dto.LocalModelItem{
			Id:         s.Id,
			Name:       s.Name,
			State:      ai_local_dto.FromLocalModelState(s.State),
			APICount:   apiCountMap[s.Id],
			CanDelete:  true,
			UpdateTime: auto.TimeLabel(s.UpdateAt),
		}
	}), nil
}

func (i *imlLocalModel) ListCanInstall(ctx context.Context, keyword string) ([]*ai_local_dto.LocalModelPackageItem, error) {
	list, err := i.localModelPackageService.Search(ctx, keyword, nil)
	if err != nil {
		return nil, err
	}
	if keyword != "" {
		result := make([]*ai_local_dto.LocalModelPackageItem, 0)

		for _, v := range list {
			models := ai_provider_local.ModelsCanInstallById(v.Id)
			for _, model := range models {
				result = append(result, &ai_local_dto.LocalModelPackageItem{
					Id:        model.Id,
					Name:      model.Name,
					Size:      model.Size,
					IsPopular: model.IsPopular,
				})
			}
		}
		return result, nil
	}
	return utils.SliceToSlice(list, func(s *ai_local.LocalModelPackage) *ai_local_dto.LocalModelPackageItem {
		return &ai_local_dto.LocalModelPackageItem{
			Id:        s.Id,
			Name:      s.Name,
			Size:      s.Size,
			IsPopular: s.IsPopular,
		}
	}), nil
}

func (i *imlLocalModel) pullHook() func(msg ai_provider_local.PullMessage) error {
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

				return i.localModelStateService.Create(ctx, &ai_local.CreateLocalModelInstallState{
					Id:       msg.Model,
					Complete: msg.Completed,
					Total:    msg.Total,
					State:    state,
					Msg:      msg.Msg,
				})

			}
			if info.Complete < msg.Completed {
				info.Complete = msg.Completed

			}
			if info.Total < msg.Total {
				info.Total = msg.Total
			}
			if msg.Msg != "" {
				info.Msg = msg.Msg
			}
			return i.localModelStateService.Save(ctx, msg.Model, &ai_local.EditLocalModelInstallState{State: &state, Complete: &info.Complete, Total: &info.Total, Msg: &info.Msg})
		})
	}
}

func (i *imlLocalModel) Deploy(ctx context.Context, model string, session string) (*ai_provider_local.Pipeline, error) {
	var p *ai_provider_local.Pipeline
	err := i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		_, err := i.localModelService.Get(ctx, model)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
			names := strings.Split(model, ":")
			err = i.localModelService.Create(ctx, &ai_local.CreateLocalModel{
				Id:       model,
				Name:     model,
				Provider: names[0],
			})

		} else {
			state := ai_local_dto.LocalModelStateDeploying.Int()
			err = i.localModelService.Save(ctx, model, &ai_local.EditLocalModel{State: &state})
		}
		if err != nil {
			return err
		}
		p, err = ai_provider_local.PullModel(model, session, i.pullHook())
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

func (i *imlLocalModel) CancelDeploy(ctx context.Context, model string) error {
	ai_provider_local.StopPull(model)

	// 删除模型
	return i.localModelService.Delete(ctx, model)
}

func (i *imlLocalModel) RemoveModel(ctx context.Context, model string) error {
	err := ai_provider_local.RemoveModel(model)
	if err != nil {
		return err
	}
	return i.localModelService.Delete(ctx, model)
}

func (i *imlLocalModel) Enable(ctx context.Context, model string) error {
	info, err := i.localModelService.Get(ctx, model)
	if err != nil {
		return err
	}
	if info.State == ai_local_dto.LocalModelStateDisable.Int() || info.State == ai_local_dto.LocalModelStateError.Int() {
		status := ai_local_dto.LocalModelStateNormal.Int()
		return i.localModelService.Save(ctx, model, &ai_local.EditLocalModel{State: &status})
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
		return i.localModelService.Save(ctx, model, &ai_local.EditLocalModel{State: &disable})
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
		installModels, err := ai_provider_local.ModelsInstalled()
		if err != nil {
			return
		}
		for _, model := range installModels {

			id := strings.TrimSuffix(model.Name, ":latest")
			name := strings.TrimSuffix(model.Name, ":latest")
			_, err = i.localModelService.Get(ctx, id)
			if err != nil {
				if !errors.Is(err, gorm.ErrRecordNotFound) {
					return
				}
				err = i.localModelService.Create(ctx, &ai_local.CreateLocalModel{
					Id:    id,
					Name:  name,
					State: 1,
				})
				if err != nil {
					return
				}
			}
		}
	})
}
