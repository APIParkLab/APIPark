package commit

import (
	"github.com/APIParkLab/APIPark/stores/universally/commit"
	"time"
)

type Commit[H any] struct {
	UUID     string
	Target   string
	Key      string
	Data     *H
	CreateAt time.Time
	Operator string
}

func newCommit[H any](e *commit.Commit[H]) *Commit[H] {
	return &Commit[H]{
		UUID:     e.UUID,
		Target:   e.Target,
		Key:      e.Key,
		Data:     e.Data,
		CreateAt: e.CreateAt,
		Operator: e.Operator,
	}
}
