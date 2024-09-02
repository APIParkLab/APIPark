package system

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"fmt"
	application_authorization "github.com/APIParkLab/APIPark/module/application-authorization"
	"github.com/APIParkLab/APIPark/module/catalogue"
	"github.com/APIParkLab/APIPark/module/router"
	"github.com/APIParkLab/APIPark/module/service"
	"github.com/APIParkLab/APIPark/module/subscribe"
	"github.com/APIParkLab/APIPark/module/team"
	"github.com/APIParkLab/APIPark/module/upstream"
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

var _ IExportConfigController = (*imlExportConfigController)(nil)

type imlExportConfigController struct {
	teamModule                     team.ITeamExportModule                               `autowired:""`
	serviceModule                  service.IExportServiceModule                         `autowired:""`
	appModule                      service.IExportAppModule                             `autowired:""`
	routerModule                   router.IExportRouterModule                           `autowired:""`
	upstreamModule                 upstream.IExportUpstreamModule                       `autowired:""`
	applicationAuthorizationModule application_authorization.IExportAuthorizationModule `autowired:""`
	catalogueModule                catalogue.IExportCatalogueModule                     `autowired:""`
	subscribeModule                subscribe.IExportSubscribeModule                     `autowired:""`
	applyModule                    subscribe.IExportSubscribeApprovalModule             `autowired:""`
}

type ExportFile struct {
	Driver string      `json:"driver"`
	Data   interface{} `json:"data"`
}

func (e *ExportFile) Byte() []byte {
	b, _ := json.Marshal(e.Data)
	return b
}

func zipFile(files []*ExportFile) (*bytes.Buffer, error) {
	// 创建一个缓冲区用于存储 ZIP 文件内容
	buf := new(bytes.Buffer)
	zipWriter := zip.NewWriter(buf)
	now := time.Now()
	// 将文件写入 ZIP
	for _, file := range files {
		header := &zip.FileHeader{
			Name:     fmt.Sprintf("%s.json", file.Driver),
			Method:   zip.Deflate,
			Modified: now,
		}
		f, err := zipWriter.CreateHeader(header)
		if err != nil {
			return nil, fmt.Errorf("failed to create zip file: %v", err)
		}
		_, err = f.Write(file.Byte())
		if err != nil {
			return nil, fmt.Errorf("failed to write to zip file: %v", err)
		}
	}

	// 关闭 ZIP writer，完成压缩过程
	err := zipWriter.Close()
	if err != nil {
		return nil, fmt.Errorf("failed to close zip writer: %v", err)
	}
	return buf, nil
}

func (i *imlExportConfigController) ExportAll(ctx *gin.Context) error {
	files, err := i.appendFiles(ctx)
	if err != nil {
		return err
	}
	buf, err := zipFile(files)
	if err != nil {

	}

	ctx.DataFromReader(http.StatusOK, int64(buf.Len()), "application/zip", buf, map[string]string{
		"Content-Disposition": "attachment; filename=\"export.zip\"",
	})
	return nil
}

func (i *imlExportConfigController) appendFiles(ctx *gin.Context) ([]*ExportFile, error) {
	type exportConfig struct {
		exportFunc func(ctx *gin.Context) (interface{}, error)
		driver     string
	}

	exports := []exportConfig{
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.teamModule.ExportAll(ctx)
			},
			driver: "team",
		},
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.serviceModule.ExportAll(ctx)
			},
			driver: "service",
		},
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.appModule.ExportAll(ctx)
			},
			driver: "app",
		},
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.routerModule.ExportAll(ctx)
			},
			driver: "api",
		},
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.upstreamModule.ExportAll(ctx)
			},
			driver: "upstream",
		},
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.applicationAuthorizationModule.ExportAll(ctx)
			},
			driver: "authorization",
		},
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.catalogueModule.ExportAll(ctx)
			},
			driver: "catalogue",
		},
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.subscribeModule.ExportAll(ctx)
			},
			driver: "subscribe",
		},
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.applyModule.ExportAll(ctx)
			},
			driver: "apply",
		},
	}

	files := make([]*ExportFile, 0, len(exports))
	for _, config := range exports {
		data, err := config.exportFunc(ctx)
		if err != nil {
			return nil, fmt.Errorf("[%s] failed to export data: %v", config.driver, err)
		}

		files = append(files, &ExportFile{
			Driver: config.driver,
			Data:   data,
		})
	}

	return files, nil
}
