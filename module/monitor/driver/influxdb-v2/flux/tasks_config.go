package flux

import (
	_ "embed"

	"gopkg.in/yaml.v3"
)

//go:embed influxdb_config/tasks.yaml
var tasksData []byte

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
	err := yaml.Unmarshal(tasksData, &conf)
	if err != nil {
		panic(err)
	}
	taskList = conf
}

func GetTaskConfigList() []*TaskConf {
	return taskList
}
