//go:build init

package main

import (
	"bytes"
	"encoding/csv"
	"fmt"
	_ "github.com/APIParkLab/APIPark/resources/access"
	_ "github.com/APIParkLab/APIPark/resources/permit"
	_ "github.com/APIParkLab/APIPark/resources/plugin"
	"github.com/eolinker/eosc/log"
	"github.com/eolinker/go-common/access"
	"github.com/eolinker/go-common/permit"
	"github.com/eolinker/go-common/pm3"
	"github.com/eolinker/go-common/utils"
	"os"
	"sort"
	"strings"
	"time"
)

const unsetValue = "-"

func doCheck() {
	accessConf, unset := loadAccess()
	
	drivers := pm3.List()
	
	newAccess := 0
	for _, p := range drivers {
		if ac, ok := p.(pm3.AccessConfig); ok {
			if len(ac.Access()) > 0 {
				for asKey := range ac.Access() {
					key := strings.ToLower(asKey)
					if _, has := accessConf[key]; !has {
						accessConf[key] = empty(key)
						newAccess++
					}
				}
			}
			
		}
		
	}
	for asKey := range permit.All() {
		key := strings.ToLower(asKey)
		if _, has := accessConf[key]; !has {
			accessConf[key] = empty(key)
			newAccess++
		}
	}
	if newAccess > 0 || unset > 0 {
		f := accessFile()
		fmt.Printf("%d access need set, see : %s and %s", newAccess+unset, saveTemplate(accessConf, f), saveCsv(accessConf, f))
		
	}
	os.Exit(0)
}
func accessFile() string {
	
	if version == "" {
		return time.Now().Format("20060102-150405")
	}
	return version
}
func saveCsv(as map[string]*Access, key string) string {
	buf := &bytes.Buffer{}
	w := csv.NewWriter(buf)
	err := w.Write([]string{"group", "name", "cname", "desc"})
	if err != nil {
		return ""
	}
	list := utils.MapToSliceNoKey(as)
	sort.Sort(AccessListSort(list))
	for _, i := range list {
		err := w.Write([]string{i.Group, i.Name, i.Cname, i.Desc})
		if err != nil {
			return ""
		}
	}
	w.Flush()
	filePath := fmt.Sprintf("access.%s.csv", key)
	err = os.WriteFile(filePath, buf.Bytes(), 0666)
	if err != nil {
		log.Fatal(err)
		
	}
	return filePath
}

type AccessListSort []*Access

func (ls AccessListSort) Len() int {
	return len(ls)
}

func (ls AccessListSort) Less(i, j int) bool {
	if ls[i].Group != ls[j].Group {
		return ls[i].Group < ls[j].Group
	}
	if ls[i].Cname != ls[j].Cname {
		return ls[i].Cname < ls[j].Cname
	}
	return ls[i].Name < ls[j].Name
}

func (ls AccessListSort) Swap(i, j int) {
	ls[i], ls[j] = ls[j], ls[i]
}

func saveTemplate(as map[string]*Access, key string) string {
	out := make(map[string][]access.Access)
	
	for _, a := range as {
		
		out[a.Group] = append(out[a.Group], access.Access{
			Name:  a.Name,
			CName: a.Cname,
			Desc:  a.Desc,
		})
	}
	buf := &bytes.Buffer{}
	err := yaml.NewEncoder(buf).Encode(out)
	if err != nil {
		log.Fatal(err)
		return ""
	}
	filePath := fmt.Sprintf("access.%s.yml", key)
	err = os.WriteFile(filePath, buf.Bytes(), 0666)
	if err != nil {
		log.Fatal(err)
		
	}
	return filePath
}

type Access struct {
	Key   string
	Group string
	Name  string
	Cname string
	Desc  string
}

func empty(key string) *Access {
	group, name := readKey(key)
	return &Access{
		Key:   key,
		Group: group,
		Name:  name,
		Cname: unsetValue,
		Desc:  unsetValue,
	}
}
func readKey(key string) (group string, name string) {
	ls := strings.Split(key, ".")
	if len(ls) != 2 {
		log.Fatal("invalid access key:[%s]", key)
	}
	return ls[0], ls[1]
}

func loadAccess() (map[string]*Access, int) {
	confAccess := access.All()
	unset := 0
	as := make(map[string]*Access)
	for group, al := range confAccess {
		for _, a := range al {
			g, name := readKey(a.Name)
			if g != group {
				log.Fatal("invalid access key:[%s]", a.Name)
			}
			as[a.Name] = &Access{
				Key:   a.Name,
				Group: group,
				Name:  name,
				Cname: a.CName,
				Desc:  a.Desc,
			}
			if a.CName == unsetValue || a.Desc == unsetValue {
				unset++
			}
		}
	}
	return as, unset
}
