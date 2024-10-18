package system

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	catalogue_dto "github.com/APIParkLab/APIPark/module/catalogue/dto"

	application_authorization_dto "github.com/APIParkLab/APIPark/module/application-authorization/dto"
	service_dto "github.com/APIParkLab/APIPark/module/service/dto"
	team_dto "github.com/APIParkLab/APIPark/module/team/dto"
	"github.com/eolinker/eosc/log"
	"github.com/eolinker/go-common/register"
	"github.com/eolinker/go-common/server"
	"github.com/eolinker/go-common/utils"
	"github.com/google/uuid"

	system_dto "github.com/APIParkLab/APIPark/module/system/dto"

	application_authorization "github.com/APIParkLab/APIPark/module/application-authorization"
	"github.com/APIParkLab/APIPark/module/catalogue"
	"github.com/APIParkLab/APIPark/module/router"
	"github.com/APIParkLab/APIPark/module/service"
	"github.com/APIParkLab/APIPark/module/subscribe"
	"github.com/APIParkLab/APIPark/module/system"
	"github.com/APIParkLab/APIPark/module/team"
	"github.com/APIParkLab/APIPark/module/upstream"
	"github.com/gin-gonic/gin"
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

var (
	_ ISettingController = (*imlSettingController)(nil)
)

type imlSettingController struct {
	settingModule system.ISettingModule `autowired:""`
}

func (i *imlSettingController) Get(ctx *gin.Context) (*system_dto.Setting, error) {
	return i.settingModule.Get(ctx), nil
}

func (i *imlSettingController) Set(ctx *gin.Context, input *system_dto.InputSetting) error {
	return i.settingModule.Set(ctx, input)
}

type imlInitController struct {
	teamModule                     team.ITeamModule                               `autowired:""`
	appModule                      service.IAppModule                             `autowired:""`
	applicationAuthorizationModule application_authorization.IAuthorizationModule `autowired:""`
	catalogueModule                catalogue.ICatalogueModule                     `autowired:""`
}

func (i *imlInitController) OnInit() {
	register.Handle(func(v server.Server) {
		ctx := utils.SetUserId(context.Background(), "admin")
		teams, err := i.teamModule.Search(ctx, "")
		if err != nil {
			log.Error("get teams error: %v", err)
			return
		}
		if len(teams) == 0 {
			info, err := i.teamModule.Create(ctx, &team_dto.CreateTeam{
				Name:        "Default Team",
				Description: "Auto created By APIPark",
			})
			if err != nil {
				log.Error("create default team error: %v", err)
				return
			}
			app, err := i.appModule.CreateApp(ctx, info.Id, &service_dto.CreateApp{
				Name:        "Demo Application",
				Description: "Auto created By APIPark",
			})
			if err != nil {
				i.teamModule.Delete(ctx, info.Id)
				log.Error("create default app error: %v", err)
				return
			}
			_, err = i.applicationAuthorizationModule.AddAuthorization(ctx, app.Id, &application_authorization_dto.CreateAuthorization{
				Name:       "Default API Key",
				Driver:     "apikey",
				Position:   "Header",
				TokenName:  "Authorization",
				ExpireTime: 0,
				Config: map[string]interface{}{
					"apikey": uuid.New().String(),
				},
			})
			if err != nil {
				i.teamModule.Delete(ctx, info.Id)
				i.appModule.DeleteApp(ctx, app.Id)
				log.Error("create default api key error: %v", err)
				return
			}
		}
		items, err := i.catalogueModule.Search(ctx, "")
		if err != nil {
			log.Error("get catalogue error: %v", err)
			return
		}
		if len(items) == 0 {
			err = i.catalogueModule.Create(ctx, &catalogue_dto.CreateCatalogue{
				Name: "Default Catalogue",
			})
			if err != nil {
				log.Error("create default catalogue error: %v", err)
				return
			}
		}
	})
}
