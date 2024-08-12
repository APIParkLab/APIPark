package auth

func init() {
	a := NewApikey()
	Register(a.Name(), a)
}

func NewApikey() *Apikey {
	return &Apikey{}
}

type Apikey struct {
}

func (a *Apikey) Name() string {
	return "apikey"
}

func (a *Apikey) ToPattern(cfg map[string]interface{}) interface{} {
	result := make(map[string]interface{})
	result["apikey"] = cfg["apikey"]
	return result
}

func (a *Apikey) ToConfig(cfg map[string]interface{}) interface{} {
	return nil
}
