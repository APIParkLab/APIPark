package catalogue_dto

type CreateCatalogue struct {
	Id     string  `json:"id"`
	Name   string  `json:"name"`
	Parent *string `json:"parent" aocheck:"catalogue"`
}

type EditCatalogue struct {
	Name   *string `json:"name"`
	Parent *string `json:"parent" aocheck:"catalogue"`
}

type SubscribeService struct {
	Service      string   `json:"service"`
	Applications []string `json:"applications" aocheck:"project"`
	Reason       string   `json:"reason"`
}

type SortItem struct {
	Id       string      `json:"id"`
	Children []*SortItem `json:"children"`
}
