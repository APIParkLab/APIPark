package release

import (
	"github.com/APIParkLab/APIPark/module/release"
	"github.com/APIParkLab/APIPark/module/release/dto"
	service_diff "github.com/APIParkLab/APIPark/module/service-diff"
	"github.com/gin-gonic/gin"
)

var (
	_ IReleaseController = (*imlReleaseController)(nil)
)

type imlReleaseController struct {
	module     release.IReleaseModule          `autowired:""`
	diffModule service_diff.IServiceDiffModule `autowired:""`
}

func (c *imlReleaseController) Create(ctx *gin.Context, project string, input *dto.CreateInput) error {
	
	_, err := c.module.Create(ctx, project, input)
	return err
}
func (c *imlReleaseController) Delete(ctx *gin.Context, project string, id string) error {
	return c.module.Delete(ctx, project, id)
}
func (c *imlReleaseController) Detail(ctx *gin.Context, project string, id string) (*dto.Detail, error) {
	return c.module.Detail(ctx, project, id)
}
func (c *imlReleaseController) List(ctx *gin.Context, project string) ([]*dto.Release, error) {
	return c.module.List(ctx, project)
}
func (c *imlReleaseController) Preview(ctx *gin.Context, project string) (*dto.Release, *service_diff.DiffOut, bool, error) {
	releaseInfo, diff, complete, err := c.module.Preview(ctx, project)
	if err != nil {
		return nil, nil, false, err
	}
	
	out, err := c.diffModule.Out(ctx, diff)
	if err != nil {
		return nil, nil, false, err
	}
	return releaseInfo, out, complete, nil
}
