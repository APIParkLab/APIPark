package flux

import (
	_ "embed"

	"gopkg.in/yaml.v3"
)

//go:embed influxdb_config/buckets.yaml
var bucketsData []byte

var (
	bucketList []*BucketConf
)

type BucketConf struct {
	BucketName string `yaml:"bucket_name"`
	Retention  int64  `yaml:"retention"`
}

func initBucketsConfig() {
	conf := make([]*BucketConf, 0, 5)
	err := yaml.Unmarshal(bucketsData, &conf)
	if err != nil {
		panic(err)
	}
	bucketList = conf
}

func GetBucketConfigList() []*BucketConf {
	return bucketList
}
