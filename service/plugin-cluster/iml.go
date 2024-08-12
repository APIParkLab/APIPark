package plugin_cluster

import (
	"context"
	"errors"
	"fmt"
	"time"
	
	"github.com/APIParkLab/APIPark/model/plugin_model"
	"github.com/APIParkLab/APIPark/stores/plugin"
	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"
)

var (
	_ IPluginService = (*imlPluginService)(nil)
)

type imlPluginService struct {
	defineStore          plugin.IPluginDefineStore    `autowired:""`
	pluginPartitionStore plugin.IPartitionPluginStore `autowired:""`
}

func (i *imlPluginService) SaveDefine(ctx context.Context, defines []*plugin_model.Define) error {
	return i.defineStore.Transaction(ctx, func(txCtx context.Context) error {
		ov, err := i.defineStore.List(ctx, map[string]interface{}{})
		if err != nil {
			return err
		}
		
		ovm := utils.SliceToMap(ov, func(v *plugin.Define) string {
			return v.Name
		})
		
		vsInsert := make([]*plugin.Define, 0, len(defines))
		vsUpdate := make([]*plugin.Define, 0, len(defines))
		for sort, dv := range defines {
			ev := &plugin.Define{
				Id:          0,
				Extend:      dv.Extend,
				Name:        dv.Name,
				Cname:       dv.Cname,
				Description: dv.Desc,
				Kind:        dv.Kind,
				Status:      dv.Status,
				Render:      dv.Render,
				Config:      dv.Config,
				Sort:        sort,
				UpdateTime:  time.Now(),
			}
			if oev, ok := ovm[dv.Name]; ok {
				ev.Id = oev.Id
				
				delete(ovm, dv.Name)
				vsUpdate = append(vsUpdate, ev)
			} else {
				vsInsert = append(vsInsert, ev)
			}
		}
		// 删除多余的
		_, err = i.defineStore.Delete(ctx, utils.MapToSlice(ovm, func(n string, v *plugin.Define) int64 {
			return v.Id
		})...)
		if err != nil {
			return err
		}
		if len(vsInsert) > 0 {
			err = i.defineStore.Insert(ctx, vsInsert...)
			if err != nil {
				return err
			}
		}
		
		for _, v := range vsUpdate {
			_, err := i.defineStore.Update(ctx, v)
			if err != nil {
				return err
			}
		}
		
		return nil
	})
}

func (i *imlPluginService) GetDefine(ctx context.Context, name string) (*PluginDefine, error) {
	define, err := i.defineStore.First(ctx, map[string]interface{}{
		"name": name,
	})
	if err != nil {
		return nil, err
	}
	return FromEntity(define), nil
	
}

func (i *imlPluginService) GetConfig(ctx context.Context, clusterId string, name string) (*Config, *PluginDefine, error) {
	
	define, err := i.defineStore.First(ctx, map[string]interface{}{
		"name": name,
	})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, fmt.Errorf("plugin define not found: %s", name)
		}
		return nil, nil, err
	}
	conf, _ := i.pluginPartitionStore.First(ctx, map[string]interface{}{
		"partition": clusterId,
		"Plugin":    name,
	})
	if conf == nil {
		return &Config{
			Plugin:   name,
			Status:   define.Status,
			Config:   define.Config,
			Operator: "",
		}, FromEntity(define), nil
		
	}
	return ConfigFromStore(conf), FromEntity(define), nil
	
}

func (i *imlPluginService) Defines(ctx context.Context, kind ...plugin_model.Kind) ([]*PluginDefine, error) {
	if len(kind) == 0 {
		list, err := i.defineStore.List(ctx, map[string]interface{}{}, "sort asc")
		if err != nil {
			return nil, err
		}
		return utils.SliceToSlice(list, FromEntity), nil
		
	} else {
		list, err := i.defineStore.List(ctx, map[string]interface{}{
			"kind": kind[0],
		}, "sort asc")
		if err != nil {
			return nil, err
		}
		return utils.SliceToSlice(list, FromEntity), nil
	}
}

func (i *imlPluginService) Options(ctx context.Context) []*PluginOption {
	list, err := i.defineStore.List(ctx, map[string]interface{}{
		"kind": plugin_model.OpenKind,
	})
	if err != nil {
		return nil
	}
	return utils.SliceToSlice(list, func(s *plugin.Define) *PluginOption {
		return &PluginOption{
			Cname: s.Cname,
			Desc:  s.Description,
			Name:  s.Name,
		}
	})
}

func (i *imlPluginService) SetCluster(ctx context.Context, clusterId string, name string, status plugin_model.Status, config plugin_model.ConfigType) error {
	operator := utils.UserId(ctx)
	
	return i.defineStore.Transaction(ctx, func(txCtx context.Context) error {
		
		define, err := i.defineStore.First(ctx, map[string]interface{}{
			"name": name,
		})
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("plugin not exits:%s", name)
			}
			return err
		}
		if define.Kind != plugin_model.OpenKind {
			return fmt.Errorf("plugin not support config: %s[%s] width %s", define.Cname, name, define.Cname)
		}
		conf, err := i.pluginPartitionStore.First(ctx, map[string]interface{}{
			"partition": clusterId,
			"name":      name,
		})
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		if conf == nil {
			conf = &plugin.Partition{
				Id:         0,
				Partition:  clusterId,
				Plugin:     define.Name,
				Config:     config,
				Status:     status,
				CreateTime: time.Now(),
				UpdateTime: time.Now(),
				Operator:   operator,
			}
			return i.pluginPartitionStore.Insert(ctx, conf)
		} else {
			conf.Config = config
			conf.Status = status
			conf.Operator = operator
			conf.UpdateTime = time.Now()
			_, err := i.pluginPartitionStore.Update(ctx, conf)
			if err != nil {
				return err
			}
			return nil
		}
		
	})
	
}

func (i *imlPluginService) ListCluster(ctx context.Context, clusterId string, kind ...plugin_model.Kind) ([]*ConfigPartition, error) {
	
	defines, err := i.Defines(ctx, kind...)
	if err != nil {
		return nil, err
	}
	
	configList, err := i.pluginPartitionStore.List(ctx, map[string]interface{}{
		"partition": clusterId,
	})
	if err != nil {
		return nil, err
	}
	configMap := utils.SliceToMap(configList, func(t *plugin.Partition) string {
		return t.Plugin
	})
	
	return utils.SliceToSlice(defines, func(d *PluginDefine) *ConfigPartition {
		c, has := configMap[d.Name]
		if has {
			return &ConfigPartition{
				Extend: d.Extend,
				Cname:  d.Cname,
				Desc:   d.Name,
				Config: ConfigFromStore(c),
			}
		} else {
			return &ConfigPartition{
				Extend: d.Extend,
				Cname:  d.Cname,
				Desc:   d.Name,
				
				Config: &Config{
					Plugin: d.Name,
					Status: d.Status,
					Config: d.Config,
					
					Operator: "",
				},
			}
		}
	}), nil
	
}
