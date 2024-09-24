package ai

import (
	"context"
	"errors"
	"fmt"
	ai_dto "github.com/APIParkLab/APIPark/module/ai/dto"
	"github.com/APIParkLab/APIPark/module/ai/provider"
	"github.com/APIParkLab/APIPark/service/ai"
	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"
	"sort"
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
	providers := provider.Providers()
	sort.SliceIsSorted(providers, func(i, j int) bool {
		return providers[i].Index() < providers[j].Index()
	})
	providerMap := utils.SliceToMap(list, func(e *ai.Provider) string {
		return e.Id
	})
	items := make([]*ai_dto.SimpleProviderItem, 0, len(providers))
	for _, v := range providers {
		item := &ai_dto.SimpleProviderItem{
			Id:   v.Info().Id,
			Name: v.Info().Name,
			Logo: v.Info().Logo,
		}
		if info, has := providerMap[v.Info().Id]; has {
			err = v.GlobalConfig().CheckConfig(info.Config)
			if err == nil {
				item.Configured = true
			}
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
	providers := provider.Providers()
	sort.SliceIsSorted(providers, func(i, j int) bool {
		return providers[i].Index() < providers[j].Index()
	})
	providerMap := utils.SliceToMap(list, func(e *ai.Provider) string {
		return e.Id
	})
	items := make([]*ai_dto.ProviderItem, 0, len(providers))
	for _, v := range providers {
		item := &ai_dto.ProviderItem{
			Id:         v.Info().Id,
			Name:       v.Info().Name,
			Logo:       v.Info().Logo,
			DefaultLLM: v.Info().DefaultLLM,
		}
		if info, has := providerMap[v.Info().Id]; has {
			//item.Enable = info.Status
			err = v.GlobalConfig().CheckConfig(info.Config)
			if err == nil {
				item.Configured = true
			}

		}
		items = append(items, item)
	}
	return items, nil
}

func (i *imlProviderModule) Provider(ctx context.Context, id string) (*ai_dto.Provider, error) {
	p, has := provider.GetProvider(id)
	if !has {
		return nil, fmt.Errorf("ai provider not found")
	}
	info, err := i.providerService.Get(ctx, id)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return &ai_dto.Provider{
			Id:           p.Info().Id,
			Name:         p.Info().Name,
			Config:       p.GlobalConfig().DefaultConfig(),
			GetAPIKeyUrl: p.Info().GetAPIKeyUrl,
		}, nil
	}

	return &ai_dto.Provider{
		Id:           info.Id,
		Name:         info.Name,
		Config:       p.GlobalConfig().MaskConfig(info.Config),
		GetAPIKeyUrl: p.Info().GetAPIKeyUrl,
	}, nil
}

func (i *imlProviderModule) LLMs(ctx context.Context, driver string) ([]*ai_dto.LLMItem, *ai_dto.ProviderItem, error) {
	p, has := provider.GetProvider(driver)
	if !has {
		return nil, nil, fmt.Errorf("ai provider not found")
	}

	llms := p.LLMs()

	items := make([]*ai_dto.LLMItem, 0, len(llms))
	for _, v := range llms {
		items = append(items, &ai_dto.LLMItem{
			Id:     v.Id,
			Logo:   v.Logo,
			Scopes: v.Scopes,
		})
	}
	info, err := i.providerService.Get(ctx, driver)
	if err != nil {
		return items, nil, err
	}

	return items, &ai_dto.ProviderItem{Id: info.Id, Name: info.Name, Logo: p.Info().Logo, Configured: true}, nil
}

func (i *imlProviderModule) UpdateProviderStatus(ctx context.Context, id string, enable bool) error {
	_, err := i.providerService.Get(ctx, id)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		p, has := provider.GetProvider(id)
		if !has {
			return fmt.Errorf("ai provider not found")
		}
		cfg := p.GlobalConfig().DefaultConfig()
		return i.providerService.Save(ctx, id, &ai.SetProvider{
			Name:       &p.Info().Name,
			DefaultLLM: &p.Info().DefaultLLM,
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
		p, has := provider.GetProvider(id)
		if !has {
			return fmt.Errorf("ai provider not found")
		}
		return i.providerService.Save(ctx, id, &ai.SetProvider{
			Name:       &p.Info().Name,
			DefaultLLM: &p.Info().DefaultLLM,
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
		p, has := provider.GetProvider(id)
		if !has {
			return fmt.Errorf("ai provider not found")
		}
		cfg := p.GlobalConfig().DefaultConfig()
		return i.providerService.Save(ctx, id, &ai.SetProvider{
			Name:       &p.Info().Name,
			DefaultLLM: &input.LLM,
			Config:     &cfg,
		})
	}
	return i.providerService.Save(ctx, id, &ai.SetProvider{
		DefaultLLM: &input.LLM,
	})
}
