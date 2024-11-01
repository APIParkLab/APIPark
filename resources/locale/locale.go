package locale

import (
	"embed"
	"encoding/json"
	"strings"

	"github.com/eolinker/go-common/pm3"
)

var (
	//go:embed i18n/*
	i18nDirs embed.FS
)

func init() {
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
		pm3.I18nRegister(key, tmp)
	}
}
