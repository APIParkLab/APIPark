package apinto

const (
	ProfessionOutput      = "output"
	ProfessionCertificate = "certificate"
	ProfessionRouter      = "router"
	ProfessionApplication = "app"
	ProfessionService     = "service"
)

var dynamicResourceMap = map[string]Worker{
	"file-access-log": {
		Profession: ProfessionOutput,
		Driver:     "file",
	},
	"http-access-log": {
		Profession: ProfessionOutput,
		Driver:     "http_output",
	},
	"nsqd-access-log": {
		Profession: ProfessionOutput,
		Driver:     "nsqd",
	},
	"syslog-access-log": {
		Profession: ProfessionOutput,
		Driver:     "syslog_output",
	},
	"kafka-access-log": {
		Profession: ProfessionOutput,
		Driver:     "kafka_output",
	},
	"influxdbv2": {
		Profession: ProfessionOutput,
		Driver:     "influxdbv2",
	},
	"redis": {
		Profession: ProfessionOutput,
		Driver:     "redis",
	},
	// 证书
	"certificate": {
		Profession: ProfessionCertificate,
		Driver:     "server",
	},
}

type Worker struct {
	Profession string
	Driver     string
}
