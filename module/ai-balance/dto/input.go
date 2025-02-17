package ai_balance_dto

type Create struct {
	Id       string `json:"id"`
	Type     string `json:"type"`
	Provider string `json:"provider"`
	Model    string `json:"model"`
}

type Sort struct {
	Origin string `json:"origin"`
	Target string `json:"target"`
	Sort   string `json:"sort"`
}
