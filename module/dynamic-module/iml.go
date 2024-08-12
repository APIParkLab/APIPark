package dynamic_module

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"
	
	"github.com/eolinker/eosc/log"
	
	"github.com/APIParkLab/APIPark/gateway"
	
	"github.com/eolinker/go-common/store"
	
	"github.com/eolinker/ap-account/service/user"
	
	"github.com/APIParkLab/APIPark/service/cluster"
	
	"github.com/eolinker/go-common/utils"
	
	"github.com/google/uuid"
	
	"github.com/APIParkLab/APIPark/module/dynamic-module/driver"
	
	dynamic_module_dto "github.com/APIParkLab/APIPark/module/dynamic-module/dto"
	dynamic_module "github.com/APIParkLab/APIPark/service/dynamic-module"
)

var _ IDynamicModuleModule = (*imlDynamicModule)(nil)

type imlDynamicModule struct {
	clusterService              cluster.IClusterService                     `autowired:""`
	dynamicModuleService        dynamic_module.IDynamicModuleService        `autowired:""`
	dynamicModulePublishService dynamic_module.IDynamicModulePublishService `autowired:""`
	userService                 user.IUserService                           `autowired:""`
	transaction                 store.ITransaction                          `autowired:""`
}

func (i *imlDynamicModule) initGateway(ctx context.Context, clusterId string, clientDriver gateway.IClientDriver) error {
	// TODO: 初始化集群操作
	return nil
}

func (i *imlDynamicModule) Online(ctx context.Context, module string, id string, clusterInput *dynamic_module_dto.ClusterInput) error {
	_, has := driver.Get(module)
	if !has {
		return fmt.Errorf("模块【%s】不存在", module)
	}
	//if len(clusterInput.Clusters) == 0 {
	//	return fmt.Errorf("上线分区失败，分区为空")
	//}
	
	id = strings.ToLower(fmt.Sprintf("%s_%s", id, module))
	info, err := i.dynamicModuleService.Get(ctx, id)
	if err != nil {
		return fmt.Errorf("上线失败，配置不存在")
	}
	clusters, err := i.clusterService.List(ctx, clusterInput.Clusters...)
	if err != nil || len(clusters) == 0 {
		return fmt.Errorf("上线失败，集群不存在")
	}
	
	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		for _, c := range clusters {
			
			// 插入发布历史
			err = i.dynamicModulePublishService.Create(ctx, &dynamic_module.CreateDynamicModulePublish{
				ID:            uuid.New().String(),
				DynamicModule: id,
				Module:        module,
				Cluster:       c.Uuid,
				Version:       info.Version,
			})
			if err != nil {
				return err
			}
			err = i.dynamicClient(ctx, c.Uuid, module, func(dynamicClient gateway.IDynamicClient) error {
				cfg := &gateway.DynamicRelease{}
				err = json.Unmarshal([]byte(info.Config), &cfg)
				if err != nil {
					return err
				}
				cfg.ID = id
				cfg.Version = info.Version
				cfg.MatchLabels = map[string]string{
					"module": module,
				}
				err = dynamicClient.Online(ctx, cfg)
				if err != nil {
					return err
				}
				return nil
			})
			if err != nil {
				return err
			}
			
		}
		
		return nil
	})
}

func (i *imlDynamicModule) Offline(ctx context.Context, module string, id string, clusterInput *dynamic_module_dto.ClusterInput) error {
	_, has := driver.Get(module)
	if !has {
		return fmt.Errorf("模块【%s】不存在", module)
	}
	//if len(clusterInput.Clusters) == 0 {
	//	return fmt.Errorf("下线分区失败，分区为空")
	//}
	
	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		id = strings.ToLower(fmt.Sprintf("%s_%s", id, module))
		if len(clusterInput.Clusters) == 0 {
			clusters, err := i.clusterService.List(ctx)
			if err != nil {
				return err
			}
			clusterInput.Clusters = make([]string, 0)
			for _, c := range clusters {
				clusterInput.Clusters = append(clusterInput.Clusters, c.Uuid)
			}
		}
		for _, clusterId := range clusterInput.Clusters {
			err := i.dynamicClient(ctx, clusterId, module, func(dynamicClient gateway.IDynamicClient) error {
				return dynamicClient.Offline(ctx, &gateway.DynamicRelease{
					BasicItem: &gateway.BasicItem{
						ID: id,
					},
				})
			})
			if err != nil {
				return err
			}
			
		}
		return nil
	})
}

//
//func (i *imlDynamicModule) PartitionStatuses(ctx context.Context, module string, keyword string, page int, pageSize int) (map[string]map[string]string, error) {
//	_, has := driver.Get(module)
//	if !has {
//		return nil, fmt.Errorf("模块【%s】不存在", module)
//	}
//	list, _, err := i.dynamicModuleService.SearchByPage(ctx, keyword, map[string]interface{}{
//		"module": module,
//	}, page, pageSize, "update_at desc")
//	if err != nil {
//		return nil, err
//	}
//	partitions, err := i.partitionService.List(ctx)
//	if err != nil {
//		return nil, err
//	}
//	out := make(map[string]map[string]string)
//	for _, c := range partitions {
//		err := i.dynamicClient(ctx, c.Cluster, module, func(dynamicClient gateway.IDynamicClient) error {
//			versions, err := dynamicClient.Versions(ctx, map[string]string{
//				"module": module,
//			})
//			if err != nil {
//				return err
//			}
//			for _, l := range list {
//				id := strings.TrimSuffix(l.ID, fmt.Sprintf("_%s", module))
//				if _, ok := out[id]; !ok {
//					out[id] = make(map[string]string)
//				}
//
//				out[id][c.UUID] = "未发布"
//				if v, ok := versions[strings.ToLower(l.ID)]; ok {
//					if v == l.Version {
//						out[id][c.UUID] = "已发布"
//					} else {
//						out[id][c.UUID] = "待发布"
//					}
//				}
//			}
//			return nil
//		})
//		if err != nil {
//			return nil, err
//		}
//
//	}
//	return out, nil
//}

func (i *imlDynamicModule) dynamicClient(ctx context.Context, clusterId string, resource string, h func(gateway.IDynamicClient) error) error {
	client, err := i.clusterService.GatewayClient(ctx, clusterId)
	
	if err != nil {
		return err
	}
	defer func() {
		err := client.Close(ctx)
		if err != nil {
			log.Warn("close apinto client:", err)
		}
	}()
	dynamic, err := client.Dynamic(resource)
	if err != nil {
		return err
	}
	return h(dynamic)
}

//
//func (i *imlDynamicModule) PartitionStatus(ctx context.Context, module string, id string) (*dynamic_module_dto.OnlineInfo, error) {
//	_, has := driver.Get(module)
//
//	if !has {
//		return nil, fmt.Errorf("模块【%s】不存在", module)
//	}
//	partitions, err := i.partitionService.List(ctx)
//	if err != nil {
//		return nil, err
//	}
//	partitionIds := utils.SliceToSlice(partitions, func(s *partition.Partition) string {
//		return s.UUID
//	})
//	suffix := fmt.Sprintf("_%s", module)
//	id = id + suffix
//	info, err := i.dynamicModuleService.Get(ctx, id)
//	if err != nil {
//		return nil, err
//	}
//	publishMap, err := i.dynamicModulePublishService.Latest(ctx, id, partitionIds)
//	if err != nil {
//		return nil, err
//	}
//
//	partitionInfos := make([]*dynamic_module_dto.PartitionInfo, 0, len(partitionIds))
//	for _, c := range partitions {
//		err := i.dynamicClient(ctx, c.Cluster, module, func(dynamicClient gateway.IDynamicClient) error {
//			version, err := dynamicClient.Version(ctx, id)
//			if err != nil {
//				return err
//			}
//			updater := ""
//			updateTime := time.Time{}
//			publishInfo, ok := publishMap[c.UUID]
//			if ok {
//				updater = publishInfo.Creator
//				updateTime = publishInfo.CreateAt
//			}
//			cInfo := &dynamic_module_dto.PartitionInfo{
//				Name:       c.UUID,
//				Title:      c.Name,
//				Status:     "未发布",
//				Updater:    auto.UUID(updater),
//				UpdateTime: auto.TimeLabel(updateTime),
//			}
//			if version == info.Version {
//				cInfo.Status = "已发布"
//			} else if version != "" {
//				cInfo.Status = "待发布"
//			}
//			partitionInfos = append(partitionInfos, cInfo)
//			return nil
//		})
//		if err != nil {
//			return nil, err
//		}
//
//	}
//	return &dynamic_module_dto.OnlineInfo{
//		Id:          strings.TrimSuffix(info.ID, suffix),
//		Name:        strings.TrimSuffix(info.ID, suffix),
//		Title:       info.Name,
//		Description: info.Description,
//		Clusters:  partitionInfos,
//	}, nil
//}

func (i *imlDynamicModule) ModuleDrivers(ctx context.Context, group string) ([]*dynamic_module_dto.ModuleDriver, error) {
	ds := driver.List(group)
	return utils.SliceToSlice(ds, func(s driver.IDriver) *dynamic_module_dto.ModuleDriver {
		return &dynamic_module_dto.ModuleDriver{
			Name:  s.Name(),
			Title: s.Title(),
			Path:  s.Front(),
		}
		
	}), nil
}

func (i *imlDynamicModule) Render(ctx context.Context, module string) (map[string]interface{}, error) {
	d, has := driver.Get(module)
	if !has {
		return nil, fmt.Errorf("module %s not found", module)
	}
	return d.Define().Render(), nil
}

func (i *imlDynamicModule) PluginInfo(ctx context.Context, module string, clusterIds ...string) (*dynamic_module_dto.PluginInfo, error) {
	d, has := driver.Get(module)
	if !has {
		return nil, fmt.Errorf("module %s not found", module)
	}
	
	fields := make([]*driver.Field, 0, 1)
	
	fields = append(fields, &driver.Field{
		Name:  "status",
		Title: fmt.Sprintf("状态"),
		Attr:  "status",
		Enum: []string{
			"已发布",
			"待发布",
			"未发布",
		},
	})
	return &dynamic_module_dto.PluginInfo{
		PluginBasic: &dynamic_module_dto.PluginBasic{
			Id:    d.ID(),
			Name:  d.Name(),
			Title: d.Title(),
		},
		Drivers: utils.SliceToSlice(d.Define().Drivers(), func(s *driver.Field) *dynamic_module_dto.Field {
			return &dynamic_module_dto.Field{
				Name:  s.Name,
				Title: s.Title,
			}
		}),
		Fields: utils.SliceToSlice(d.Define().Fields(fields...), func(s *driver.Field) *dynamic_module_dto.Field {
			return &dynamic_module_dto.Field{
				Name:  s.Name,
				Title: s.Title,
				Attr:  s.Attr,
				Enum:  s.Enum,
			}
		}),
	}, nil
}

func (i *imlDynamicModule) Create(ctx context.Context, module string, input *dynamic_module_dto.CreateDynamicModule) (*dynamic_module_dto.DynamicModule, error) {
	d, has := driver.Get(module)
	if !has {
		return nil, fmt.Errorf("module %s not found", module)
	}
	
	id := strings.ToLower(fmt.Sprintf("%s_%s", input.Id, module))
	err := i.transaction.Transaction(ctx, func(ctx context.Context) error {
		cfg, err := json.Marshal(input.Config)
		if err != nil {
			return err
		}
		return i.dynamicModuleService.Create(ctx, &dynamic_module.CreateDynamicModule{
			Id:          id,
			Name:        input.Name,
			Driver:      input.Driver,
			Description: input.Description,
			Config:      string(cfg),
			Module:      module,
			Profession:  d.Define().Profession(),
			Skill:       d.Define().Skill(),
			Version:     time.Now().Format("20060102150405"),
		})
	})
	if err != nil {
		return nil, err
	}
	
	return i.Get(ctx, module, input.Id)
}

func (i *imlDynamicModule) Edit(ctx context.Context, module string, id string, input *dynamic_module_dto.EditDynamicModule) (*dynamic_module_dto.DynamicModule, error) {
	id = strings.ToLower(fmt.Sprintf("%s_%s", id, module))
	_, err := i.get(ctx, module, id)
	if err != nil {
		return nil, err
	}
	var cfg *string
	var version *string
	if input.Config != nil {
		tmp, _ := json.Marshal(input.Config)
		t := string(tmp)
		cfg = &t
		v := time.Now().Format("20060102150405")
		version = &v
	}
	err = i.dynamicModuleService.Save(ctx, id, &dynamic_module.EditDynamicModule{
		Name:        input.Name,
		Description: input.Description,
		Config:      cfg,
		Version:     version,
	})
	if err != nil {
		return nil, err
	}
	return i.Get(ctx, module, id)
}

func (i *imlDynamicModule) Delete(ctx context.Context, module string, ids []string) error {
	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		for _, id := range ids {
			id = strings.ToLower(fmt.Sprintf("%s_%s", id, module))
			_, err := i.get(ctx, module, id)
			if err != nil {
				return err
			}
			err = i.dynamicModuleService.Delete(ctx, id)
			if err != nil {
				return err
			}
		}
		
		return nil
	})
	
}

func (i *imlDynamicModule) Get(ctx context.Context, module string, id string) (*dynamic_module_dto.DynamicModule, error) {
	suffix := fmt.Sprintf("_%s", module)
	if !strings.HasSuffix(id, suffix) {
		id = strings.ToLower(fmt.Sprintf("%s_%s", id, module))
	}
	
	info, err := i.get(ctx, module, id)
	if err != nil {
		return nil, err
	}
	cfg := make(map[string]interface{})
	err = json.Unmarshal([]byte(info.Config), &cfg)
	if err != nil {
		return nil, err
	}
	return &dynamic_module_dto.DynamicModule{
		Id:          strings.TrimSuffix(info.ID, suffix),
		Name:        info.Name,
		Driver:      info.Driver,
		Description: info.Description,
		Config:      cfg,
	}, nil
}

func (i *imlDynamicModule) get(ctx context.Context, module string, id string) (*dynamic_module.DynamicModule, error) {
	info, err := i.dynamicModuleService.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	
	if info.Module != module {
		return nil, fmt.Errorf("module not match")
	}
	return info, nil
}

func (i *imlDynamicModule) List(ctx context.Context, module string, keyword string, page int, pageSize int) ([]map[string]interface{}, int64, error) {
	d, has := driver.Get(module)
	if !has {
		return nil, 0, fmt.Errorf("module %s not found", module)
	}
	list, total, err := i.dynamicModuleService.SearchByPage(ctx, keyword, map[string]interface{}{
		"module": module,
	}, page, pageSize, "update_at desc")
	if err != nil {
		return nil, 0, err
	}
	
	userIDs := utils.SliceToSlice(list, func(s *dynamic_module.DynamicModule) string {
		return s.Updater
	})
	clusters, err := i.clusterService.List(ctx)
	if err != nil {
		return nil, 0, err
	}
	
	userMap := i.userService.GetLabels(ctx, userIDs...)
	items := make([]map[string]interface{}, 0, len(list))
	suffix := fmt.Sprintf("_%s", module)
	for _, c := range clusters {
		err = i.dynamicClient(ctx, c.Uuid, module, func(dynamicClient gateway.IDynamicClient) error {
			versions, err := dynamicClient.Versions(ctx, map[string]string{
				"module": module,
			})
			if err != nil {
				log.Error("get versions error", err)
			}
			for _, l := range list {
				status := "未发布"
				id := strings.TrimSuffix(l.ID, suffix)
				
				item := map[string]interface{}{
					"id":          id,
					"title":       l.Name,
					"driver":      l.Driver,
					"description": l.Description,
					"updater":     userMap[l.Updater],
					"update_time": l.UpdateAt.Format("2006-01-02 15:04:05"),
				}
				
				tmp := make(map[string]interface{})
				err = json.Unmarshal([]byte(l.Config), &tmp)
				if err == nil {
					for _, column := range d.Define().Columns() {
						if _, ok := item[column]; ok {
							continue
						}
						item[column] = tmp[column]
						
					}
				}
				if versions != nil {
					if v, ok := versions[strings.ToLower(l.ID)]; ok {
						if v == l.Version {
							status = "已发布"
						} else {
							status = "待发布"
						}
					}
				}
				item["status"] = status
				items = append(items, item)
			}
			return nil
		})
		if err != nil {
			return nil, 0, err
		}
		
	}
	
	return items, total, nil
}
