package plugin

import (
	"context"
	"embed"
	_ "embed"
	"encoding/json"
	"fmt"
	"gopkg.in/yaml.v3"
	"log"
	"strings"
	
	"github.com/APIParkLab/APIPark/model/plugin_model"
	pluginModule "github.com/APIParkLab/APIPark/module/plugin-cluster"
	"github.com/APIParkLab/APIPark/service/setting"
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
	"github.com/eolinker/go-common/utils"
)

const (
	pluginVersionName = "system.plugin.version"
)

var (
	//go:embed plugin.yml
	embeddedPlugin []byte
	//go:embed render/*.json
	renders embed.FS
)

type pluginLoad struct {
	transaction    store.ITransaction                `autowired:""`
	module         pluginModule.IPluginClusterModule `autowired:""`
	settingService setting.ISettingService           `autowired:""`
	version        string
	defines        []*plugin_model.Define
}

func (p *pluginLoad) OnInit() {
	
	p.transaction.Transaction(context.Background(), func(ctx context.Context) error {
		value, has := p.settingService.Get(ctx, pluginVersionName)
		if has {
			if value >= p.version {
				return nil
			}
		}
		err := p.module.UpdateDefine(ctx, p.defines)
		if err != nil {
			return err
		}
		return p.settingService.Set(ctx, pluginVersionName, p.version, "system")
	})
	
	p.defines = nil
	p.version = ""
}

func (p *pluginLoad) UnmarshalYAML(value *yaml.Node) error {
	
	sorts := make([]string, 0)
	var itemNodes []*yaml.Node
	
	for i := 0; i < len(value.Content); i += 2 {
		v := value.Content[i]
		switch strings.ToLower(v.Value) {
		case "version":
			p.version = value.Content[i+1].Value
			continue
		case "sort":
			err := value.Content[i+1].Decode(&sorts)
			if err != nil {
				return err
			}
			continue
		case "plugin":
			itemNodes = value.Content[i+1].Content
			
		}
		
	}
	items, err := pluginItemUnmarshalYAML(sorts, itemNodes)
	if err != nil {
		return err
	}
	p.defines = items
	return nil
}
func pluginItemUnmarshalYAML(sorts []string, nodes []*yaml.Node) ([]*plugin_model.Define, error) {
	if len(nodes) == 0 {
		return nil, fmt.Errorf("yaml: error decoding plugin is empty")
	}
	type defineItem struct {
		*plugin_model.Define
		sort int
	}
	sortBase := len(sorts) + 1
	Items := make([]*defineItem, 0, len(nodes)/2-2)
	for i := 0; i < len(nodes); i += 2 {
		k := nodes[i].Value
		v := nodes[i+1]
		it := new(defineT)
		
		err := v.Decode(&it)
		if err != nil {
			log.Printf("yaml: error decoding %s: %v", v.Value, err)
			return nil, err
		}
		Items = append(Items, &defineItem{
			
			Define: &plugin_model.Define{
				Extend: it.Id,
				Name:   k,
				Cname:  it.CName,
				Desc:   it.Desc,
				Kind:   plugin_model.ParseKind(it.Kind),
				Status: plugin_model.ParseStatus(it.Status),
				Config: it.Config,
			},
			sort: i + sortBase,
		})
	}
	
	sortValues := make(map[string]int, len(sorts))
	for i, v := range sorts {
		sortValues[v] = i
	}
	
	for _, v := range Items {
		if s, has := sortValues[v.Name]; has {
			v.sort = s
		}
		extend := v.Extend
		extend = strings.Replace(extend, ".", "_", -1)
		//extend = strings.Replace(extend, "-", "_", -1)
		extend = strings.Replace(extend, ":", "_", -1)
		renderBody, err := renders.ReadFile(fmt.Sprintf("render/%s.json", extend))
		if err != nil {
			return nil, err
		}
		renderObj := new(defineRender)
		err = json.Unmarshal(renderBody, renderObj)
		if err != nil {
			return nil, err
		}
		v.Render = renderObj.Render
	}
	
	utils.Sort(Items, func(i, j *defineItem) bool {
		
		return i.sort < j.sort
	})
	for i, v := range Items {
		v.sort = i
	}
	return utils.SliceToSlice(Items, func(v *defineItem) *plugin_model.Define {
		return v.Define
	}), nil
}
func init() {
	loader := new(pluginLoad)
	
	err := yaml.Unmarshal(embeddedPlugin, loader)
	// 释放内存
	embeddedPlugin = nil
	if err != nil {
		panic(fmt.Errorf("unmarshal plugin inner:%w", err))
		return
	}
	autowire.Autowired(loader)
}
