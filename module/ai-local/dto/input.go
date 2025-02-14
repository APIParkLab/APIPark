package ai_local_dto

type Update struct {
	Disable bool `json:"disable"`
}

type CancelDeploy struct {
	Model string `json:"model"`
}

type DeployInput struct {
	Model string `json:"model"`
	Team  string `json:"team"`
}
