package frontend

import (
	"embed"
	_ "embed"
	"fmt"
	"io/fs"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/eolinker/go-common/pm3"
	"github.com/eolinker/go-common/server"
	"github.com/gabriel-vasile/mimetype"
	"github.com/gin-gonic/gin"
)

var (
	//go:embed dist/favicon.ico
	iconContent []byte
	iconType    string
	//go:embed dist/vite.svg
	viteContent     []byte
	viteContentType string
	//go:embed dist
	dist embed.FS
	//go:embed dist/index.html
	indexHtml []byte
)
var (
	expires      = time.Hour * 24 * 3
	cacheControl = fmt.Sprintf("public, max-age=%d", 3600*24*7)
)

func AddExpires(ginCtx *gin.Context) {
	ginCtx.Header("Expires", time.Now().Add(expires).UTC().Format(http.TimeFormat))
	ginCtx.Header("Cache-Control", cacheControl)
}

func init() {
	iconType = mimetype.Detect(iconContent).String()
	viteContentType = mimetype.Detect(viteContent).String()
	server.SetIndexHtmlHandler(IndexHtml)
	server.AddSystemPlugin(new(Frontend))
}
func getFileSystem(dir string) http.FileSystem {
	fDir, err := fs.Sub(dist, path.Join("dist", dir))
	if err != nil {
		panic(err)
	}
	return http.FS(fDir)
}

type Frontend struct {
}

func (f *Frontend) Middlewares() []pm3.IMiddleware {
	return []pm3.IMiddleware{
		pm3.CreateMiddle(func(method, path string) bool {
			if method != http.MethodGet {
				return false
			}
			if strings.HasPrefix(path, "/api") {
				return false
			}
			return true
		}, AddExpires, 0),
	}
}

func (f *Frontend) Name() string {
	return "baseFrontend"
}

func IndexHtml(ginCtx *gin.Context) {
	AddExpires(ginCtx)
	ginCtx.Header("Cache-Control", "no-store, no-cache, max-age=0, must-revalidate, proxy-revalidate")
	ginCtx.Data(http.StatusOK, "text/html; charset=utf-8", indexHtml)
}

func (f *Frontend) Api() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiSimple(http.MethodGet, "/favicon.ico", func(ginCtx *gin.Context) {
			ginCtx.Data(http.StatusOK, iconType, iconContent)
		}),
		pm3.CreateApiSimple(http.MethodGet, "/vite.svg", func(ginCtx *gin.Context) {
			ginCtx.Data(http.StatusOK, viteContentType, viteContent)
		}),
	}
}
func (f *Frontend) Files() []pm3.FrontendFiles {
	return []pm3.FrontendFiles{

		{
			Path:       "/assets/",
			FileSystem: getFileSystem("assets"),
		}, {
			Path:       "/tinymce/",
			FileSystem: getFileSystem("tinymce"),
		}, {
			Path:       "/frontend/",
			FileSystem: getFileSystem("/"),
		},
	}
}
