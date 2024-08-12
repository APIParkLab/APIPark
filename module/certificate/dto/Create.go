package certificate_dto

type FileInput struct {
	Key  string `json:"key"`
	Cert string `json:"pem"`
}
