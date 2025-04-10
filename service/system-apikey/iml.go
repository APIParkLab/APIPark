package system_apikey

import (
	"time"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/APIParkLab/APIPark/stores/system"
)

type imlAPIKeyService struct {
	store system.IAPIKeyStore `autowired:""`
	universally.IServiceGet[APIKey]
	universally.IServiceDelete
	universally.IServiceCreate[Create]
	universally.IServiceEdit[Update]
}

func (i *imlAPIKeyService) OnComplete() {
	i.IServiceGet = universally.NewGet[APIKey, system.APIKey](i.store, FromEntity)
	i.IServiceCreate = universally.NewCreator[Create, system.APIKey](i.store, "system_apikey", i.createEntityHandler, i.uniquestHandler, i.labelHandler)
	i.IServiceDelete = universally.NewDelete[system.APIKey](i.store)
	i.IServiceEdit = universally.NewEdit[Update, system.APIKey](i.store, i.updateHandler, i.labelHandler)
}

func (i *imlAPIKeyService) idHandler(e *system.APIKey) int64 {
	return e.Id
}
func (i *imlAPIKeyService) labelHandler(e *system.APIKey) []string {
	return []string{e.Name}
}
func (i *imlAPIKeyService) uniquestHandler(t *Create) []map[string]interface{} {
	return []map[string]interface{}{{"uuid": t.Id}}
}
func (i *imlAPIKeyService) createEntityHandler(t *Create) *system.APIKey {
	now := time.Now()
	return &system.APIKey{
		UUID:     t.Id,
		Name:     t.Name,
		Value:    t.Value,
		Expired:  t.Expired,
		CreateAt: now,
		UpdateAt: now,
	}
}

func (i *imlAPIKeyService) updateHandler(e *system.APIKey, t *Update) {
	isUpdate := false
	if t.Name != nil {
		e.Name = *t.Name
		isUpdate = true
	}
	if t.Value != nil {
		e.Value = *t.Value
		isUpdate = true
	}
	if t.Expired != nil {
		e.Expired = *t.Expired
		isUpdate = true
	}
	if isUpdate {
		e.UpdateAt = time.Now()
	}

}
