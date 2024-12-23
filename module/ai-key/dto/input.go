package ai_key_dto

type Create struct {
	Id         string `json:"id"`
	Name       string `json:"name"`
	Config     string `json:"config"`
	ExpireTime int    `json:"expire_time"`
}

type Edit struct {
	Name       *string `json:"name"`
	Config     *string `json:"config"`
	ExpireTime *int    `json:"expire_time"`
}

type Sort struct {
	Origin string `json:"origin"`
	Target string `json:"target"`
	Sort   string `json:"sort"`
}
