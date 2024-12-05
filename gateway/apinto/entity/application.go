package entity

type Application struct {
	*BasicInfo
	Labels         map[string]string `json:"labels"`
	Authorizations []*Authorization  `json:"auth"`
}

type Authorization struct {
	Type      string            `json:"type"`
	Position  string            `json:"position"`
	TokenName string            `json:"token_name"`
	Config    interface{}       `json:"config"`
	Users     []*AuthUser       `json:"users"`
	Labels    map[string]string `json:"labels"`
}

type AuthUser struct {
	Expire         int64             `json:"expire"`
	Pattern        interface{}       `json:"pattern"`
	HideCredential bool              `json:"hide_credential"`
	Labels         map[string]string `json:"labels"`
}
