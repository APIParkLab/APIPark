package auth

func init() {
	b := NewAKSK()
	Register(b.Name(), b)
}

func NewAKSK() *AKSK {
	return &AKSK{}
}

type AKSK struct {
}

func (a *AKSK) Name() string {
	return "aksk"
}

func (a *AKSK) ToPattern(cfg map[string]interface{}) interface{} {
	result := make(map[string]interface{})
	result["ak"] = cfg["ak"]
	result["sk"] = cfg["sk"]
	return result
}

func (a *AKSK) ToConfig(cfg map[string]interface{}) interface{} {
	return nil
}
