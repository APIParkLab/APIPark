package model_dto

type Model struct {
	Name                string `json:"name"`
	AccessConfiguration string `json:"access_configuration"`
	ModelParameters     string `json:"model_parameters"`
}

type EditModel struct {
	Id string `json:"id"`
	Model
}
