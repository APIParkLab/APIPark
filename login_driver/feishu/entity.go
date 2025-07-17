package feishu

type UserTokenResponse struct {
	Code                  int    `json:"code"`
	AccessToken           string `json:"access_token"`
	ExpiresIn             int    `json:"expires_in"`
	RefreshToken          string `json:"refresh_token"`
	RefreshTokenExpiresIn int    `json:"refresh_token_expires_in"`
	TokenType             string `json:"token_type"`
	Scope                 string `json:"scope"`
	Error                 string `json:"error"`
	ErrorDescription      string `json:"error_description"`
}

type UserInfoResponse struct {
	Code int      `json:"code"`
	Msg  string   `json:"msg"`
	Data UserInfo `json:"data"`
}

type UserInfo struct {
	Name    string `json:"name"`
	OpenID  string `json:"open_id"`
	UnionId string `json:"union_id"`
	Email   string `json:"email"`
	Mobile  string `json:"mobile"`
}
