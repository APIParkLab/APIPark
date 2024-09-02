package publish

import (
	"strconv"

	"github.com/APIParkLab/APIPark/module/publish"
	"github.com/APIParkLab/APIPark/module/publish/dto"
	"github.com/APIParkLab/APIPark/module/release"
	dto2 "github.com/APIParkLab/APIPark/module/release/dto"
	"github.com/gin-gonic/gin"
)

var (
	_ IPublishController = (*imlPublishController)(nil)
)

type imlPublishController struct {
	publishModule publish.IPublishModule `autowired:""`
	releaseModule release.IReleaseModule `autowired:""`
}

func (c *imlPublishController) ReleaseDo(ctx *gin.Context, serviceId string, input *dto.ApplyOnReleaseInput) (*dto.Publish, error) {
	newReleaseId, err := c.releaseModule.Create(ctx, serviceId, &dto2.CreateInput{
		Version: input.Version,
		Remark:  input.VersionRemark,
	})
	if err != nil {
		return nil, err
	}
	apply, err := c.publishModule.Apply(ctx, serviceId, &dto.ApplyInput{
		Release: newReleaseId,
		Remark:  input.PublishRemark,
	})
	if err != nil {
		return nil, err
	}
	err = c.publishModule.Accept(ctx, serviceId, apply.Id, "")
	if err != nil {
		c.releaseModule.Delete(ctx, serviceId, newReleaseId)
		return nil, err
	}
	//err = c.publishModule.Publish(ctx, serviceId, apply.Id)
	//if err != nil {
	//	c.releaseModule.Delete(ctx, serviceId, newReleaseId)
	//	return nil, err
	//}
	err = c.publishModule.Publish(ctx, serviceId, apply.Id)
	if err != nil {
		c.releaseModule.Delete(ctx, serviceId, newReleaseId)
		return nil, err
	}
	return apply, err
}

func (c *imlPublishController) PublishStatuses(ctx *gin.Context, serviceId string, id string) ([]*dto.PublishStatus, error) {
	return c.publishModule.PublishStatuses(ctx, serviceId, id)
}

func (c *imlPublishController) ApplyOnRelease(ctx *gin.Context, serviceId string, input *dto.ApplyOnReleaseInput) (*dto.Publish, error) {
	newReleaseId, err := c.releaseModule.Create(ctx, serviceId, &dto2.CreateInput{
		Version: input.Version,
		Remark:  input.VersionRemark,
	})
	if err != nil {
		return nil, err
	}
	apply, err := c.publishModule.Apply(ctx, serviceId, &dto.ApplyInput{
		Release: newReleaseId,
		Remark:  input.PublishRemark,
	})
	if err != nil {
		return nil, err
	}
	return apply, nil
}

func (c *imlPublishController) Apply(ctx *gin.Context, serviceId string, input *dto.ApplyInput) (*dto.Publish, error) {
	apply, err := c.publishModule.Apply(ctx, serviceId, input)
	if err != nil {
		return nil, err
	}
	return apply, nil
}

func (c *imlPublishController) CheckPublish(ctx *gin.Context, serviceId string, releaseId string) (*dto.DiffOut, error) {
	return c.publishModule.CheckPublish(ctx, serviceId, releaseId)
}

func (c *imlPublishController) Close(ctx *gin.Context, serviceId string, id string) error {
	err := c.publishModule.Stop(ctx, serviceId, id)
	if err != nil {
		return err
	}
	return nil
}

func (c *imlPublishController) Stop(ctx *gin.Context, serviceId string, id string) error {
	return c.publishModule.Stop(ctx, serviceId, id)
}

func (c *imlPublishController) Refuse(ctx *gin.Context, serviceId string, id string, input *dto.Comments) error {
	return c.publishModule.Refuse(ctx, serviceId, id, input.Comments)
}

func (c *imlPublishController) Accept(ctx *gin.Context, serviceId string, id string, input *dto.Comments) error {
	return c.publishModule.Accept(ctx, serviceId, id, input.Comments)
}

func (c *imlPublishController) Publish(ctx *gin.Context, serviceId string, id string) error {
	return c.publishModule.Publish(ctx, serviceId, id)
}

func (c *imlPublishController) ListPage(ctx *gin.Context, serviceId string, page, pageSize string) ([]*dto.Publish, int, int, int64, error) {
	pageNum, _ := strconv.Atoi(page)
	pageSizeNum, _ := strconv.Atoi(pageSize)
	if pageNum < 1 {
		pageNum = 1
	}
	if pageSizeNum <= 0 {
		pageSizeNum = 50
	}
	list, total, err := c.publishModule.List(ctx, serviceId, pageNum, pageSizeNum)
	if err != nil {
		return nil, 0, 0, 0, err
	}

	return list, pageNum, pageSizeNum, total, nil
}

func (c *imlPublishController) Detail(ctx *gin.Context, serviceId string, id string) (*dto.PublishDetail, error) {
	return c.publishModule.Detail(ctx, serviceId, id)
}
