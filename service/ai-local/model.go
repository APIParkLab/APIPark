package ai_local

import "time"

type LocalModel struct {
	Id       string
	Name     string
	Provider string
	State    int
	CreateAt time.Time
	UpdateAt time.Time
	Creator  string
	Updater  string
}

type CreateLocalModel struct {
	Id       string
	Name     string
	Provider string
	State    int
}

type EditLocalModel struct {
	State *int
}

type LocalModelPackage struct {
	Id          string
	Name        string
	Size        string
	Hash        string
	Description string
	Version     string
	IsPopular   bool
}

type CreateLocalModelPackage struct {
	Id          string
	Name        string
	Size        string
	Hash        string
	Description string
	Version     string
	Popular     bool
}

type EditLocalModelPackage struct {
	Size        *string
	Hash        *string
	Description *string
	Version     *string
	Popular     *bool
}

type LocalModelInstallState struct {
	Id       string
	Complete int64
	Total    int64
	State    int
	Msg      string
	UpdateAt time.Time
}

type CreateLocalModelInstallState struct {
	Id       string
	Complete int64
	Total    int64
	State    int
	Msg      string
}

type EditLocalModelInstallState struct {
	Complete *int64
	Total    *int64
	State    *int
	Msg      *string
}
