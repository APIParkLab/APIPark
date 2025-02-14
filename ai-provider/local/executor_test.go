package ai_provider_local

import (
	"fmt"
	"io"
	"net/http"
	"testing"

	"github.com/gin-contrib/gzip"

	"github.com/eolinker/eosc/log"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
)

func TestPullModel(t *testing.T) {
	// 创建 Gin 引擎
	r := gin.Default()
	r.Use(gzip.Gzip(gzip.DefaultCompression))
	// 设置路由，监听 "/stream" 路径
	r.GET("/stream", streamHandler)
	r.GET("/stop", stopPull)
	r.GET("/models", models)

	// 启动 HTTP 服务器
	r.Run(":11180")
}

func streamHandler(c *gin.Context) {
	// 创建一个通道，用于监测客户端关闭连接的信号
	model := c.Query("model")
	p, err := PullModel(model, uuid.NewString(), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	done := make(chan struct{})
	// 启动一个 goroutine 监听客户端关闭连接
	go func() {
		select {
		case <-c.Writer.CloseNotify():
			log.Info("client closed connection,close pipeline")
			taskExecutor.ClosePipeline(model, p.id)
		case <-done:
		}
	}()

	c.Stream(func(w io.Writer) bool {
		select {
		case msg, ok := <-p.channel:
			if !ok {
				return false
			}
			_, err := w.Write([]byte(fmt.Sprintf("%s\n", msg.Msg)))
			if err != nil {
				log.Error("write message error: %v", err)
				return false
			}
			return true
		}
	})
	done <- struct{}{}
}

func stopPull(c *gin.Context) {
	model := c.Query("model")
	StopPull(model)
	c.JSON(http.StatusOK, gin.H{"message": "stop pull model"})
}

func models(c *gin.Context) {
	ms, err := ModelsInstalled()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"models": ms})
}
