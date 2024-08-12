package service_doc

import (
	"context"
	"errors"
	"time"
	
	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"
	
	"github.com/APIParkLab/APIPark/stores/service"
)

type imlDocService struct {
	store service.IServiceDocStore `autowired:""`
}

func (i *imlDocService) Save(ctx context.Context, input *SaveDoc) error {
	info, err := i.Get(ctx, input.Sid)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	userID := utils.UserId(ctx)
	if info != nil {
		_, err = i.store.Update(ctx, &service.Doc{
			Id:       info.ID,
			Sid:      input.Sid,
			Doc:      input.Doc,
			CreateAt: info.CreateTime,
			UpdateAt: time.Now(),
			Creator:  info.Creator,
			Updater:  userID,
		})
		return err
	}
	return i.store.Insert(ctx, &service.Doc{
		Sid:      input.Sid,
		Doc:      input.Doc,
		CreateAt: time.Now(),
		UpdateAt: time.Now(),
		Creator:  userID,
		Updater:  userID,
	})
}

func (i *imlDocService) Get(ctx context.Context, sid string) (*Doc, error) {
	doc, err := i.store.First(ctx, map[string]interface{}{"sid": sid})
	if err != nil {
		return nil, err
	}
	return &Doc{
		ID:         doc.Id,
		DocID:      doc.Sid,
		Creator:    doc.Creator,
		Updater:    doc.Updater,
		Doc:        doc.Doc,
		UpdateTime: doc.UpdateAt,
		CreateTime: doc.CreateAt,
	}, nil
}
