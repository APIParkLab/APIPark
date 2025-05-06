package flux

import (
	"embed"
	_ "embed"
	"fmt"
	"strings"

	"github.com/eolinker/eosc/log"

	yaml "gopkg.in/yaml.v3"
)

//go:embed tasks/*.yaml
var taskReader embed.FS

var (
	taskList []*TaskConf
)

type TaskConf struct {
	TaskName string `yaml:"task_name"`
	Cron     string `yaml:"cron"`
	Offset   string `yaml:"offset"`
	Flux     string `yaml:"flux"`
}

func initTasksConfig() {
	conf := make([]*TaskConf, 0, 15)
	files, err := taskReader.ReadDir("tasks")
	if err != nil {
		panic(fmt.Sprintf("read tasks dir error: %v", err))
	}
	for _, file := range files {
		if file.IsDir() || !strings.HasSuffix(file.Name(), ".yaml") {
			continue
		}
		name := fmt.Sprintf("tasks/%s", file.Name())
		data, err := taskReader.ReadFile(name)
		if err != nil {
			log.Errorf("read file(%s) error: %v", name, err)
			continue
		}
		tmp := make([]*TaskConf, 0, 15)
		err = yaml.Unmarshal(data, &tmp)
		if err != nil {
			log.Errorf("unmarshal file(%s) error: %v", name, err)
			continue
		}
		conf = append(conf, tmp...)

	}
	taskList = conf
}

func GetTaskConfigList() []*TaskConf {
	return taskList
}
