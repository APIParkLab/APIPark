package ai

import (
	"context"
	"errors"
	"fmt"
	model_runtime "github.com/APIParkLab/APIPark/ai-provider/model-runtime"
	ai_dto "github.com/APIParkLab/APIPark/module/ai/dto"
	"github.com/APIParkLab/APIPark/service/ai"
	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"
)

var _ IProviderModule = (*imlProviderModule)(nil)

type imlProviderModule struct {
	providerService ai.IProviderService `autowired:""`
}

func (i *imlProviderModule) SimpleProviders(ctx context.Context) ([]*ai_dto.SimpleProviderItem, error) {
	list, err := i.providerService.List(ctx)
	if err != nil {
		return nil, err
	}
	providers := model_runtime.Providers()

	providerMap := utils.SliceToMap(list, func(e *ai.Provider) string {
		return e.Id
	})
	items := make([]*ai_dto.SimpleProviderItem, 0, len(providers))
	for _, v := range providers {
		item := &ai_dto.SimpleProviderItem{
			Id:   v.ID(),
			Name: v.Name(),
			Logo: v.Logo(),
		}
		if _, has := providerMap[v.ID()]; has {
			item.Configured = true
		}
		items = append(items, item)
	}
	return items, nil
}

func (i *imlProviderModule) Providers(ctx context.Context) ([]*ai_dto.ProviderItem, error) {
	list, err := i.providerService.List(ctx)
	if err != nil {
		return nil, err
	}
	providers := model_runtime.Providers()
	providerMap := utils.SliceToMap(list, func(e *ai.Provider) string {
		return e.Id
	})
	items := make([]*ai_dto.ProviderItem, 0, len(providers))
	for _, v := range providers {
		defaultLLM, has := v.DefaultModel(model_runtime.ModelTypeLLM)
		if !has {
			continue
		}
		item := &ai_dto.ProviderItem{
			Id:             v.ID(),
			Name:           v.Name(),
			Logo:           v.Logo(),
			DefaultLLM:     defaultLLM.ID(),
			DefaultLLMLogo: defaultLLM.Logo(),
		}
		if _, has = providerMap[v.ID()]; has {
			item.Configured = true
		}
		items = append(items, item)
	}
	return items, nil
}

func (i *imlProviderModule) Provider(ctx context.Context, id string) (*ai_dto.Provider, error) {
	p, has := model_runtime.GetProvider(id)
	if !has {
		return nil, fmt.Errorf("ai provider not found")
	}
	info, err := i.providerService.Get(ctx, id)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return &ai_dto.Provider{
			Id:           p.ID(),
			Name:         p.Name(),
			Config:       p.DefaultConfig(),
			GetAPIKeyUrl: p.HelpUrl(),
		}, nil
	}

	return &ai_dto.Provider{
		Id:           info.Id,
		Name:         info.Name,
		Config:       p.MaskConfig(info.Config),
		GetAPIKeyUrl: p.HelpUrl(),
	}, nil
}

func (i *imlProviderModule) LLMs(ctx context.Context, driver string) ([]*ai_dto.LLMItem, *ai_dto.ProviderItem, error) {
	p, has := model_runtime.GetProvider(driver)
	if !has {
		return nil, nil, fmt.Errorf("ai provider not found")
	}

	llms, has := p.ModelsByType(model_runtime.ModelTypeLLM)
	if !has {
		return nil, nil, fmt.Errorf("ai provider not found")
	}

	items := make([]*ai_dto.LLMItem, 0, len(llms))
	for _, v := range llms {
		items = append(items, &ai_dto.LLMItem{
			Id:     v.ID(),
			Logo:   v.Logo(),
			Config: p.DefaultConfig(),
			Scopes: []string{
				"chat",
			},
		})
	}
	info, err := i.providerService.Get(ctx, driver)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, err
		}
		defaultLLM, has := p.DefaultModel(model_runtime.ModelTypeLLM)
		if !has {
			return nil, nil, fmt.Errorf("ai provider default llm not found")
		}
		return items, &ai_dto.ProviderItem{
			Id:         p.ID(),
			Name:       p.Name(),
			DefaultLLM: defaultLLM.ID(),
			Logo:       p.Logo(),
			Configured: false,
		}, err
	}

	return items, &ai_dto.ProviderItem{Id: info.Id, Name: info.Name, DefaultLLM: info.DefaultLLM, Logo: p.Logo(), Configured: true}, nil
}

func (i *imlProviderModule) UpdateProviderStatus(ctx context.Context, id string, enable bool) error {
	_, err := i.providerService.Get(ctx, id)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		p, has := model_runtime.GetProvider(id)
		if !has {
			return fmt.Errorf("ai provider not found")
		}
		cfg := p.DefaultConfig()
		name := p.Name()
		defaultLLm, ok := p.DefaultModel(model_runtime.ModelTypeLLM)
		if !ok {
			return fmt.Errorf("ai provider default llm not found")
		}
		defaultLLmId := defaultLLm.ID()
		return i.providerService.Save(ctx, id, &ai.SetProvider{
			Name:       &name,
			DefaultLLM: &defaultLLmId,
			Config:     &cfg,
			Status:     &enable,
		})
	}
	return i.providerService.Save(ctx, id, &ai.SetProvider{
		Status: &enable,
	})

}

func (i *imlProviderModule) UpdateProviderConfig(ctx context.Context, id string, input *ai_dto.UpdateConfig) error {
	_, err := i.providerService.Get(ctx, id)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		p, has := model_runtime.GetProvider(id)
		if !has {
			return fmt.Errorf("ai provider not found")
		}
		name := p.Name()
		defaultLLm, ok := p.DefaultModel(model_runtime.ModelTypeLLM)
		if !ok {
			return fmt.Errorf("ai provider default llm not found")
		}
		defaultLLmId := defaultLLm.ID()
		return i.providerService.Save(ctx, id, &ai.SetProvider{
			Name:       &name,
			DefaultLLM: &defaultLLmId,
			Config:     &input.Config,
		})
	}
	return i.providerService.Save(ctx, id, &ai.SetProvider{
		Config: &input.Config,
	})
}

func (i *imlProviderModule) UpdateProviderDefaultLLM(ctx context.Context, id string, input *ai_dto.UpdateLLM) error {
	_, err := i.providerService.Get(ctx, id)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		p, has := model_runtime.GetProvider(id)
		if !has {
			return fmt.Errorf("ai provider not found")
		}
		name := p.Name()
		cfg := p.DefaultConfig()
		return i.providerService.Save(ctx, id, &ai.SetProvider{
			Name:       &name,
			DefaultLLM: &input.LLM,
			Config:     &cfg,
		})
	}
	return i.providerService.Save(ctx, id, &ai.SetProvider{
		DefaultLLM: &input.LLM,
	})
}
