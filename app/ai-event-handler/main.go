package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/eolinker/go-common/autowire"
	nsq "github.com/nsqio/go-nsq"

	"github.com/eolinker/go-common/cftool"

	_ "github.com/eolinker/go-common/store/store_mysql"
	_ "github.com/go-sql-driver/mysql"
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
	// 1. 连接 MySQL 数据库
	cftool.Register[ServerConfig](fmt.Sprintf("root:%s", confPath))
	cftool.ReadFile(confPath)

	handler := &NSQHandler{}
	autowire.Autowired(handler)
	err := autowire.CheckComplete()
	if err != nil {
		log.Fatal("check autowired:", err)
		return
	}
	// 2. 创建 NSQ 消费者
	config := nsq.NewConfig()
	hostname, err := os.Hostname()
	if err != nil {
		log.Fatalf("Failed to get hostname: %v", err)
		return
	}
	nsqConfig := handler.nsqConfig
	consumer, err := nsq.NewConsumer(fmt.Sprintf("%s_ai_event", nsqConfig.TopicPrefix), hostname, config)
	if err != nil {
		log.Fatalf("Failed to create NSQ consumer: %v", err)
	}

	consumer.AddHandler(handler)

	// 4. 连接到 NSQ
	//nsqAddress := "172.18.166.219:9150" // NSQ 地址
	err = consumer.ConnectToNSQD(nsqConfig.Addr)
	if err != nil {
		log.Fatalf("Failed to connect to NSQ: %v", err)
	}
	log.Println("Connected to NSQ")

	// 5. 捕获系统信号，优雅关闭
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	// 优雅停止消费者
	consumer.Stop()
	<-consumer.StopChan
	log.Println("NSQ Consumer stopped")
}
