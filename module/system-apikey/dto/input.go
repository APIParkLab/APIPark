package system_apikey_dto

type Create struct {
	Id      string `json:"id"`
	Name    string `json:"name"`
	Value   string `json:"value"`
	Expired int64  `json:"expired"`
}

type Update struct {
	Name    *string `json:"name"`
	Value   *string `json:"value"`
	Expired *int64  `json:"expired"`
}
