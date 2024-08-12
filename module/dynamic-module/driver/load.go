package driver

import (
	"embed"
	"path"

	"github.com/eolinker/eosc/log"
)

var (
	//go:embed embed
	pluginDir embed.FS
)

func init() {
	err := LoadPlugins(&pluginDir, "embed", "plugin.yml")
	if err != nil {
		panic(err)
	}
}

func LoadPlugins(fs *embed.FS, dir string, target string) error {
	entries, err := fs.ReadDir(dir)
	if err != nil {
		return err
	}

	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		filePath := path.Join(dir, e.Name(), target)
		fileContent, err := fs.ReadFile(filePath)
		if err != nil {
			return err
		}
		pluginCfg, err := Read(fileContent)
		if err != nil {
			log.Errorf("read inert plugin file(%s) error: %v", filePath, err)
			return err
		}
		Register(NewDriver(pluginCfg))

	}

	return err
}
