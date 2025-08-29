package auth

func init() {
	b := NewJWT()
	Register(b.Name(), b)
}

func NewJWT() *JWT {
	return &JWT{}
}

type JWT struct {
}

func (J *JWT) Name() string {
	return "jwt"
}

func (J *JWT) ToPattern(cfg map[string]interface{}) interface{} {
	result := make(map[string]interface{})
	result["username"] = cfg["user"]
	return result
}

func (J *JWT) ToConfig(cfg map[string]interface{}) interface{} {
	result := make(map[string]interface{})
	result["iss"] = cfg["iss"]
	result["algorithm"] = cfg["algorithm"]
	result["secret"] = cfg["secret"]
	result["rsa_public_key"] = cfg["publicKey"]
	result["path"] = cfg["userPath"]
	result["claims_to_verify"] = cfg["claimsToVerify"]
	result["signature_is_base_64"] = cfg["signatureIsBase64"]
	return result
}
