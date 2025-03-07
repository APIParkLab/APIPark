package model_dto

type SimpleModel struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

type ModelParametersTemplate struct {
	Id              string `json:"id"`
	ProviderName    string `json:"provider_name"`
	ModelName       string `json:"model_name"`
	ModelParameters string `json:"model_parameters"`
}
