package locale

import (
	"embed"
	"encoding/json"
	"strings"

	"github.com/eolinker/eosc"
)

var (
	//go:embed i18n/*
	i18nDirs    embed.FS
	i18nData    eosc.Untyped[string, map[string]string]
	defaultI18n = "zh-CN"
)

func init() {
	i18nData = eosc.BuildUntyped[string, map[string]string]()
	files, err := i18nDirs.ReadDir("i18n")
	if err != nil {
		panic(err)
	}
	var data []byte
	for _, f := range files {
		data, err = i18nDirs.ReadFile("i18n/" + f.Name())
		if err != nil {
			panic(err)
		}

		tmp := make(map[string]string)
		err = json.Unmarshal(data, &tmp)
		if err != nil {
			panic(err)
		}
		key := strings.TrimSuffix(f.Name(), ".json")
		i18nData.Set(key, tmp)
	}
}

func Get(i18n string) map[string]string {
	result, has := i18nData.Get(i18n)
	if has {
		return result
	}

	result, has = i18nData.Get(defaultI18n)
	if !has {
		return make(map[string]string)
	}
	return result
}
