package application_authorization_dto

type CreateAuthorization struct {
	UUID           string                 `json:"uuid"`
	Name           string                 `json:"name"`
	Driver         string                 `json:"driver"`
	Position       string                 `json:"position"`
	TokenName      string                 `json:"token_name"`
	ExpireTime     int64                  `json:"expire_time"`
	Config         map[string]interface{} `json:"config"`
	HideCredential bool                   `json:"hide_credential"`
}

type EditAuthorization struct {
	Name           *string                 `json:"name"`
	Position       *string                 `json:"position"`
	TokenName      *string                 `json:"token_name"`
	ExpireTime     *int64                  `json:"expire_time"`
	Config         *map[string]interface{} `json:"config"`
	HideCredential *bool                   `json:"hide_credential"`
}
