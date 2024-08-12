package commit

import (
	"context"
	"errors"
	"github.com/eolinker/go-common/utils"
	"strings"
	"time"

	"github.com/eolinker/go-common/store"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var (
	_ ICommitStore[any] = (*Store[any])(nil)
)

type ICommitStore[H any] interface {
	Save(ctx context.Context, key string, target string, h *H) error
	Latest(ctx context.Context, key string, target ...string) ([]*Commit[H], error)
	Get(ctx context.Context, uuid string) (*Commit[H], error)
	List(ctx context.Context, uuids ...string) ([]*Commit[H], error)
}

type Store[H any] struct {
	db              store.IDB `autowired:""`
	latestTableName string
	commitTableName string
	name            string
}

func (h *Store[H]) List(ctx context.Context, uuids ...string) ([]*Commit[H], error) {
	if len(uuids) == 0 {
		return nil, errors.New("uuids is empty")
	}
	db := h.db.DB(ctx).Table(h.commitTableName)
	if len(uuids) == 1 {
		db = db.Where("`uuid` = ?", uuids[0])
	} else {
		db = db.Where("`uuid` in ?", uuids)
	}

	var commit = make([]*Commit[H], 0, len(uuids))
	err := db.Find(&commit).Error
	if err != nil {
		return nil, err
	}
	return commit, nil
}

func NewCommitStore[H any](name string) *Store[H] {
	return &Store[H]{
		name:            name,
		latestTableName: name + "_latest",
		commitTableName: name + "_commit",
	}
}

func (h *Store[H]) OnComplete() {

	onceMigrate(h.name, func() {
		db := h.db.DB(context.Background())

		err := db.Table(h.commitTableName).AutoMigrate(&Commit[H]{})
		if err != nil {
			panic(err)
		}
		err = db.Table(h.latestTableName).AutoMigrate(&Latest{})
		if err != nil {
			panic(err)
		}
	})

}

var (
	latestUniques = []clause.Column{
		{
			Name: "target",
		}, {
			Name: "type",
		},
	}
)

func (h *Store[H]) Save(ctx context.Context, key string, target string, commit *H) error {
	hid := uuid.NewString()
	ho := &Commit[H]{
		Id:       0,
		UUID:     hid,
		Target:   target,
		Key:      key,
		Data:     commit,
		CreateAt: time.Now(),
	}
	lo := &Latest{
		Id:     0,
		Target: target,
		Key:    key,
		Latest: hid,
	}

	return h.db.DB(ctx).Transaction(func(tx *gorm.DB) error {
		err := tx.Table(h.commitTableName).Create(ho).Error
		if err != nil {
			return err
		}

		return tx.Table(h.latestTableName).Clauses(clause.OnConflict{
			Columns:   latestUniques,
			UpdateAll: true,
		}).Create(lo).Error

	})
}
func (h *Store[H]) Latest(ctx context.Context, key string, target ...string) ([]*Commit[H], error) {

	wheres := make([]string, 0, 2)
	args := make([]interface{}, 0, 2)
	if key == "" && len(target) == 0 {
		return nil, errors.New("key or target is required")
	}
	if key != "" {
		wheres = append(wheres, "`key` = ?")
		args = append(args, key)
	}
	if len(target) > 0 {
		if len(target) > 1 {
			wheres = append(wheres, "`target` in ?")
			args = append(args, target)
		} else {
			wheres = append(wheres, "`target` = ?")
			args = append(args, target[0])
		}
	}

	latest := make([]*Latest, 0)
	err := h.db.DB(ctx).Debug().Table(h.latestTableName).Where(strings.Join(wheres, " and "), args...).Find(&latest).Error

	if err != nil {
		return nil, err
	}
	latestUUUID := utils.SliceToSlice(latest, func(l *Latest) string { return l.Latest })
	ho := make([]*Commit[H], 0, len(latest))
	if len(latestUUUID) == 0 {
		return nil, nil
	}
	if len(latestUUUID) > 1 {
		err = h.db.DB(ctx).Table(h.commitTableName).Where("`uuid` in ?", latestUUUID).Find(&ho).Error

	} else {
		err = h.db.DB(ctx).Table(h.commitTableName).Where("`uuid` = ?", latestUUUID[0]).Find(&ho).Error
	}
	if err != nil {
		return nil, err
	}
	return ho, nil
}
func (h *Store[H]) Get(ctx context.Context, uuid string) (*Commit[H], error) {
	var commit = new(Commit[H])
	err := h.db.DB(ctx).Table(h.commitTableName).Where("`uuid` = ?", uuid).First(commit).Error
	if err != nil {
		return nil, err
	}
	return commit, nil
}
