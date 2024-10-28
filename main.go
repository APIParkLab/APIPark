package main

import (
	"flag"
	"fmt"
	"net"
	"net/http"

	"github.com/eolinker/eosc/log"
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/cftool"
	"github.com/eolinker/go-common/permit"
	"github.com/eolinker/go-common/server"
)

var (
	version  string
	confPath string
)

func init() {
	flag.StringVar(&confPath, "c", "config.yml", "`config` file path for server ")
}

type ServerConfig struct {
	Port int `yaml:"port"`
}

func main() {
	doCheck()

	flag.Parse()

	cf := new(ServerConfig)
	cftool.Register(fmt.Sprintf("root:%s", confPath), cf)
	cftool.ReadFile(confPath)

	ser := server.CreateServer()

	err := autowire.CheckComplete()
	if err != nil {
		log.Fatal("check autowired:", err)
		return
	}

	if cf.Port == 0 {
		log.Fatal("need port")
	}
	ln, err := net.Listen("tcp", fmt.Sprintf(":%d", cf.Port))
	if err != nil {
		log.Fatal(err)
		return
	}
	srv := ser.Build()
	for access, paths := range srv.Permits() {
		permit.AddPermitRule(access, paths...)
	}
	err = http.Serve(ln, srv)
	if err != nil {
		log.Fatal(err)
		return
	}

}
