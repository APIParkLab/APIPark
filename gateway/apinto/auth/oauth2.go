package auth

func init() {
	b := NewOAuth2()
	Register(b.Name(), b)
}

func NewOAuth2() *OAuth2 {
	return &OAuth2{}
}

type OAuth2 struct {
}

func (o *OAuth2) Name() string {
	return "oauth2"
}
func (o *OAuth2) ToPattern(cfg map[string]interface{}) interface{} {
	result := make(map[string]interface{})
	result["client_id"] = cfg["client_id"]
	result["client_secret"] = cfg["client_secret"]
	result["client_type"] = cfg["client_type"]
	result["hash_secret"] = cfg["hash_secret"]
	result["redirect_urls"] = cfg["redirect_urls"]
	return result
}
func (o *OAuth2) ToConfig(cfg map[string]interface{}) interface{} {
	return nil
}
